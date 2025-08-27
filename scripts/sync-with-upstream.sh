#!/bin/bash

# Script de synchronisation avec DeepSite upstream
# Usage: ./scripts/sync-with-upstream.sh

set -e

echo "🔄 Synchronisation avec DeepSite upstream..."

# Sauvegarder la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branche actuelle: $CURRENT_BRANCH"

# Fetch les dernières modifications de DeepSite
echo "📥 Récupération des dernières modifications de DeepSite..."
git fetch upstream main

# Créer une branche temporaire pour la mise à jour
UPDATE_BRANCH="update-from-deepsite-$(date +%Y%m%d)"
echo "🌿 Création de la branche de mise à jour: $UPDATE_BRANCH"
git checkout -b $UPDATE_BRANCH

# Merger les changements upstream
echo "🔀 Fusion des changements upstream..."
git merge upstream/main --no-edit || {
    echo "⚠️  Conflits détectés! Résolvez-les manuellement."
    echo "📝 Fichiers en conflit:"
    git status --short | grep "^UU"
    exit 1
}

echo "✅ Synchronisation réussie!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Testez l'application: npm run dev"
echo "2. Vérifiez que le mode local fonctionne toujours"
echo "3. Si tout est OK, mergez dans votre branche principale:"
echo "   git checkout $CURRENT_BRANCH"
echo "   git merge $UPDATE_BRANCH"
echo "4. Supprimez la branche temporaire:"
echo "   git branch -d $UPDATE_BRANCH"