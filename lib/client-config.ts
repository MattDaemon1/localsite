"use client";

// Configuration côté client
export const isLocalMode = () => {
  // Vérifier si on est en mode local via l'URL ou l'environnement
  if (typeof window !== "undefined") {
    // Si NEXT_PUBLIC_LOCAL_MODE est défini
    if (process.env.NEXT_PUBLIC_LOCAL_MODE === "true") {
      return true;
    }
    // Détection automatique basée sur l'URL
    const hostname = window.location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  }
  return process.env.NEXT_PUBLIC_LOCAL_MODE === "true";
};

export const getApiEndpoint = (endpoint: string) => {
  const localMode = isLocalMode();
  
  switch (endpoint) {
    case "/api/ask-ai":
      return localMode ? "/api/ask-ai-local" : "/api/ask-ai";
    case "/api/auth":
      return localMode ? null : "/api/auth";
    default:
      return endpoint;
  }
};

export const getDefaultProvider = () => {
  return isLocalMode() ? "ollama" : "auto";
};


export const getDefaultModel = () => {
  // Utiliser codellama:7b-code comme modèle par défaut pour le code
  return isLocalMode() ? "codellama:7b-code" : "deepseek-ai/DeepSeek-V3-0324";
};