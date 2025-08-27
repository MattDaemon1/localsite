// Configuration centralisée pour l'application

export const isLocalMode = process.env.NEXT_PUBLIC_LOCAL_MODE === "true";

export const getApiEndpoint = (endpoint: string) => {
  // Si on est en mode local et que Ollama est configuré, utiliser les endpoints locaux
  if (isLocalMode) {
    switch (endpoint) {
      case "/api/ask-ai":
        return "/api/ask-ai-local";
      case "/api/auth":
        return null; // Pas d'auth en mode local
      default:
        return endpoint;
    }
  }
  return endpoint;
};

export const getDefaultProvider = () => {
  return isLocalMode ? "ollama" : "auto";
};

export const getDefaultModel = () => {
  return isLocalMode ? "deepseek-r1:7b" : "deepseek-ai/DeepSeek-V3-0324";
};