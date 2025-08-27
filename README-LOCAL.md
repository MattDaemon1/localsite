# DeepSite - Mode Local avec Ollama

Ce fork de DeepSite permet une utilisation 100% locale avec Ollama ou d'autres providers IA locaux.

## Prérequis

1. **Ollama** installé et fonctionnel
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Ou via Homebrew sur macOS
   brew install ollama
   ```

2. **Node.js** version 18 ou supérieure

3. **Un modèle Ollama** téléchargé (recommandé : DeepSeek R1)
   ```bash
   ollama pull deepseek-r1:7b
   # Ou pour plus de performance :
   ollama pull deepseek-r1:14b
   ollama pull deepseek-r1:32b
   ```

## Installation

1. Clonez le repository :
   ```bash
   git clone https://github.com/Korben00/LocalSite
   cd LocalSite
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez l'environnement local :
   ```bash
   cp .env.local.example .env.local
   ```

4. Éditez `.env.local` selon vos besoins :
   ```env
   LOCAL_MODE=true
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=deepseek-r1:7b
   NEXT_PUBLIC_LOCAL_MODE=true
   ```

## Utilisation

1. Démarrez Ollama :
   ```bash
   ollama serve
   ```

2. Dans un autre terminal, lancez l'application :
   ```bash
   npm run dev
   ```

3. Ouvrez votre navigateur à l'adresse : http://localhost:3000

## Fonctionnalités en mode local

- ✅ Génération de sites web avec IA locale
- ✅ Modification en temps réel
- ✅ Pas besoin de compte HuggingFace
- ✅ Données 100% privées
- ✅ Support de plusieurs modèles Ollama
- ❌ Déploiement sur HuggingFace Spaces (désactivé)
- ❌ Sauvegarde cloud (utilisez git localement)

## Modèles recommandés

| Modèle | VRAM nécessaire | Performance |
|--------|----------------|-------------|
| deepseek-r1:7b | 6 GB | Rapide, qualité correcte |
| deepseek-r1:14b | 12 GB | Bon équilibre |
| deepseek-r1:32b | 24 GB | Meilleure qualité |
| qwen2.5-coder:32b | 24 GB | Excellent pour le code |
| llama3.3:70b | 48 GB | Très haute qualité |

## Troubleshooting

### Ollama ne répond pas
```bash
# Vérifier qu'Ollama fonctionne
curl http://localhost:11434/api/tags

# Redémarrer Ollama
killall ollama
ollama serve
```

### Modèle non trouvé
```bash
# Lister les modèles installés
ollama list

# Télécharger le modèle manquant
ollama pull nom-du-modele
```

### Performance lente
- Utilisez un modèle plus petit (7b au lieu de 32b)
- Fermez d'autres applications gourmandes en mémoire
- Considérez l'utilisation d'un GPU compatible

## Support d'autres providers locaux

### LM Studio
1. Configurez LM Studio pour écouter sur le port 1234
2. Modifiez `.env.local` :
   ```env
   LM_STUDIO_BASE_URL=http://localhost:1234
   ```

### LocalAI
Support prévu dans une future version.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.

## Licence

Ce projet est basé sur DeepSite original par enzostvs.
Modifications pour le mode local par Korben00.