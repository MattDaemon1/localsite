/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import {
  DIVIDER,
  FOLLOW_UP_SYSTEM_PROMPT,
  INITIAL_SYSTEM_PROMPT,
  MAX_REQUESTS_PER_IP,
  REPLACE_END,
  SEARCH_START,
} from "@/lib/prompts";

const ipAddresses = new Map();
const resetInterval = 60000; // Réinitialisation toutes les 60 secondes

// Réinitialisation périodique du compteur
setInterval(() => {
  ipAddresses.clear();
}, resetInterval);

// Helper function to call Ollama API
async function callOllama(messages: any[], model: string, stream = true) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const endpoint = stream ? "/api/chat" : "/api/chat";
  console.log('OLLAMA_BASE_URL utilisé:', baseUrl);
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || process.env.OLLAMA_MODEL || "deepseek-r1:7b",
      messages,
      stream,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  return response;
}

export async function POST(request: NextRequest) {
  const authHeaders = await headers();
  const body = await request.json();
  console.log('BODY REÇU', body);
  // Liste des modèles locaux compatibles Ollama (à adapter si besoin)
  const LOCAL_MODELS = [
    'qwen3:4b',
    'codellama:7b-code',
    'llama2:7b',
    'mistral:7b-instruct',
    'deepseek-r1:7b',
    'deepseek-r1:14b',
    'deepseek-r1:32b',
    // Ajoute ici d'autres modèles locaux si besoin
  ];
  let { model } = body;
  const { prompt, provider, redesignMarkdown, html } = body;
  if (!LOCAL_MODELS.includes(model)) {
    // Si le modèle n'est pas local, on force qwen3:4b (ou le modèle local par défaut)
    console.warn(`Modèle non local reçu (${model}), utilisation forcée de qwen3:4b`);
    model = 'qwen3:4b';
  }

  if (!model || (!prompt && !redesignMarkdown)) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Rate limiting basé sur l'IP (désactivé en mode local)
  const isLocalMode = process.env.LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  if (!isLocalMode) {
    const ip = authHeaders.get("x-forwarded-for")?.includes(",")
      ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
      : authHeaders.get("x-forwarded-for") || 'unknown';
    
    ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
    if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many requests. Please wait a moment.",
        },
        { status: 429 }
      );
    }
  }

  try {
    // Debug: log all relevant variables
    console.log('POST /api/ask-ai-local', { prompt, provider, model, redesignMarkdown, html });
    // Si le client demande un flux (stream), on garde le comportement actuel
    if (body.stream) {
      console.log('Streaming mode enabled');
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      const response = new NextResponse(stream.readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });

      (async () => {
        let completeResponse = "";
        try {
          const messages = [
            {
              role: "system",
              content: INITIAL_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: redesignMarkdown
                ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
                : html
                ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please create a new design based on this HTML.`
                : prompt,
            },
          ];

          if (provider === "ollama" || provider === "auto" || !provider) {
            let ollamaResponse;
            try {
              ollamaResponse = await callOllama(messages, model, true);
            } catch (err) {
              console.error('Error calling Ollama (stream):', err);
              throw err;
            }
            const reader = ollamaResponse.body?.getReader();
            if (!reader) throw new Error("No response body from Ollama");
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = new TextDecoder().decode(value);
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                      const chunk = json.message.content;
                      await writer.write(encoder.encode(chunk));
                      completeResponse += chunk;
                      if (completeResponse.includes("</html>")) break;
                    }
                  } catch (e) {
                    console.error("Error parsing Ollama response:", e);
                  }
                }
              }
              if (completeResponse.includes("</html>")) break;
            }
          } else {
            throw new Error(`Provider ${provider} not yet implemented`);
          }
        } catch (error: any) {
          await writer.write(
            encoder.encode(
              JSON.stringify({
                ok: false,
                message:
                  error.message ||
                  "An error occurred while processing your request.",
              })
            )
          );
        } finally {
          await writer?.close();
        }
      })();
      return response;
    }

    // Sinon, on renvoie une réponse JSON standard (non streamée)
    const messages = [
      {
        role: "system",
        content: INITIAL_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: redesignMarkdown
          ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
          : html
          ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please create a new design based on this HTML.`
          : prompt,
      },
    ];

    if (provider === "ollama" || provider === "auto" || !provider) {
      let ollamaResponse;
      try {
        ollamaResponse = await callOllama(messages, model, false);
      } catch (err) {
        console.error('Error calling Ollama (json):', err);
        throw err;
      }
      const result = await ollamaResponse.json();
      return NextResponse.json(result);
    } else {
      throw new Error(`Provider ${provider} not yet implemented`);
    }
  } catch (error: any) {
    // Log the full error object for debugging
    console.error('POST /api/ask-ai-local error:', error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error?.message || error?.toString() || "An error occurred while processing your request.",
        stack: error?.stack || undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authHeaders = await headers();
  const body = await request.json();
  const { prompt, html, previousPrompt, provider, selectedElementHtml, model } =
    body;

  if (!prompt || !html) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Rate limiting (désactivé en mode local)
  const isLocalMode = process.env.LOCAL_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  if (!isLocalMode) {
    const ip = authHeaders.get("x-forwarded-for")?.includes(",")
      ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
      : authHeaders.get("x-forwarded-for") || 'unknown';
    
    ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
    if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many requests. Please wait a moment.",
        },
        { status: 429 }
      );
    }
  }

  try {
    const messages = [
      {
        role: "system",
        content: FOLLOW_UP_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: previousPrompt
          ? previousPrompt
          : "You are modifying the HTML file based on the user's request.",
      },
      {
        role: "assistant",
        content: `The current code is: \n\`\`\`html\n${html}\n\`\`\` ${
          selectedElementHtml
            ? `\n\nYou have to update ONLY the following element, NOTHING ELSE: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\``
            : ""
        }`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    let chunk = "";
    
    if (provider === "ollama" || provider === "auto" || !provider) {
      const ollamaResponse = await callOllama(messages, model, false);
      const responseData = await ollamaResponse.json();
      chunk = responseData.message?.content || "";
    } else {
      throw new Error(`Provider ${provider} not yet implemented`);
    }

    if (!chunk) {
      return NextResponse.json(
        { ok: false, message: "No content returned from the model" },
        { status: 400 }
      );
    }

    const updatedLines: number[][] = [];
    let newHtml = html;
    let position = 0;
    let moreBlocks = true;

    while (moreBlocks) {
      const searchStartIndex = chunk.indexOf(SEARCH_START, position);
      if (searchStartIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const dividerIndex = chunk.indexOf(DIVIDER, searchStartIndex);
      if (dividerIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const replaceEndIndex = chunk.indexOf(REPLACE_END, dividerIndex);
      if (replaceEndIndex === -1) {
        moreBlocks = false;
        continue;
      }

      const searchBlock = chunk.substring(
        searchStartIndex + SEARCH_START.length,
        dividerIndex
      );
      const replaceBlock = chunk.substring(
        dividerIndex + DIVIDER.length,
        replaceEndIndex
      );

      if (searchBlock.trim() === "") {
        newHtml = `${replaceBlock}\n${newHtml}`;
        updatedLines.push([1, replaceBlock.split("\n").length]);
      } else {
        const blockPosition = newHtml.indexOf(searchBlock);
        if (blockPosition !== -1) {
          const beforeText = newHtml.substring(0, blockPosition);
          const startLineNumber = beforeText.split("\n").length;
          const replaceLines = replaceBlock.split("\n").length;
          const endLineNumber = startLineNumber + replaceLines - 1;

          updatedLines.push([startLineNumber, endLineNumber]);
          newHtml = newHtml.replace(searchBlock, replaceBlock);
        }
      }

      position = replaceEndIndex + REPLACE_END.length;
    }

    return NextResponse.json({
      ok: true,
      html: newHtml,
      updatedLines,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}