"use client";
import { useEffect, useState } from "react";
import { MODELS } from "@/lib/providers";

interface OllamaModel {
  value: string;
  label: string;
  providers: string[];
  autoProvider: string;
  isLocal: boolean;
}

export const useOllamaModels = () => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isLocalMode = process.env.NEXT_PUBLIC_LOCAL_MODE === "true";

  useEffect(() => {
    if (!isLocalMode) {
      // En mode cloud, utiliser les modèles statiques
      setModels(MODELS);
      setLoading(false);
      return;
    }

    // En mode local, récupérer les modèles Ollama
    const fetchOllamaModels = async () => {
      try {
        const response = await fetch("/api/ollama-models");
        if (response.ok) {
          const data = await response.json();
          if (data.models && data.models.length > 0) {
            setModels(data.models);
          } else {
            // Si pas de modèles Ollama, afficher un message
            setError("Aucun modèle Ollama trouvé. Assurez-vous qu'Ollama est lancé et que vous avez téléchargé des modèles.");
            setModels([]);
          }
        } else {
          throw new Error("Failed to fetch models");
        }
      } catch (err) {
        console.error("Error fetching Ollama models:", err);
        setError("Impossible de récupérer les modèles Ollama. Vérifiez qu'Ollama est lancé.");
        // Pas de fallback - afficher seulement les modèles réellement disponibles
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOllamaModels();
    
    // Rafraîchir la liste toutes les 30 secondes
    const interval = setInterval(fetchOllamaModels, 30000);
    return () => clearInterval(interval);
  }, [isLocalMode]);

  return { models, loading, error, isLocalMode };
};