# LocalSite 🚀

LocalSite is a 100% local web development platform powered by Ollama. Generate modern, responsive websites using AI models running directly on your machine.

## 🙏 Credits

This project is based on [DeepSite](https://huggingface.co/spaces/enzostvs/deepsite) created by [enzostvs](https://huggingface.co/enzostvs).

- **Original project**: [DeepSite on HuggingFace](https://huggingface.co/spaces/enzostvs/deepsite)
- **Original author**: [@enzostvs](https://huggingface.co/enzostvs)
- **License**: MIT

LocalSite is an adaptation designed to work entirely locally with Ollama, without requiring cloud service connections.

## ✨ Features

- 🎨 **AI-powered website generation**: Create modern websites with simple text prompts
- 🏠 **100% Local**: Everything runs on your machine, no data sent to the cloud
- 🤖 **Powered by Ollama**: Use any Ollama model installed on your system
- ⚡ **Real-time interface**: Instantly preview changes as you edit or generate
- 📝 **Integrated code editor**: Monaco Editor for editing generated HTML/CSS/JS
- 🎯 **Easy customization**: Modify and improve generated code
- 🔄 **Dynamic model selection**: Automatically detect and use available Ollama models

## 📋 Prerequisites

- Node.js 18+ 
- [Ollama](https://ollama.ai/) installed and running
- At least one Ollama model downloaded (recommended: `deepseek-r1:7b`)

## 🛠️ Quick Start

### 1. Install Ollama

```bash
# On macOS
brew install ollama

# On Linux
curl -fsSL https://ollama.ai/install.sh | sh

# On Windows - download from https://ollama.ai/download
```

### 2. Download a model

```bash
# Recommended model for code generation
ollama pull deepseek-r1:7b

# Other popular models
ollama pull qwen3:latest
ollama pull codellama:latest
```

### 3. Start Ollama

```bash
ollama serve
```

### 4. Install and run LocalSite

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

Open http://localhost:3001 in your browser.

## 🚀 Usage

1. Open the application in your browser
2. Enter a prompt like: "Create a modern portfolio website for a developer"
3. Select your preferred Ollama model from the settings
4. Click "Generate" and watch AI create your website
5. Preview the result and edit if needed
6. Export or deploy your site
