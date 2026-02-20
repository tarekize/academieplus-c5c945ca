#!/usr/bin/env bash

# 🚀 QUICK START - Affichage Adaptatif
# Exécutez ce script pour démarrer rapidement

echo "================================================================"
echo "🎓 Système d'Affichage Adaptatif - QUICK START"
echo "================================================================"
echo ""

# 1. Vérify current directory
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json not found"
    echo "   Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

echo "✅ Répertoire correct"
echo ""

# 2. Install/Update dependencies
echo "📦 Vérifiant les dépendances..."
npm list framer-motion > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Framer Motion manquant, installation..."
    npm install framer-motion
fi
echo "✅ Dépendances OK"
echo ""

# 3. Build test
echo "🔨 Compilation..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Compilation réussie"
else
    echo "❌ Erreur de compilation"
    tail -20 /tmp/build.log
    exit 1
fi
echo ""

# 4. Summary
echo "================================================================"
echo "✨ PRÊT À UTILISER!"
echo "================================================================"
echo ""
echo "📚 Documentation:"
echo "   - GUIDE_AFFICHAGE_ADAPTATIF_v2.md"
echo "   - GUIDE_INTEGRATION_FINAL.md"
echo "   - GUIDE_TEST_AFFICHAGE_ADAPTATIF.md"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. npm run dev"
echo "   2. Ajouter route /video-admin dans App.tsx"
echo "   3. Intégrer dans Cours.tsx (voir guide)"
echo "   4. Visiter http://localhost:5173/video-admin"
echo ""
echo "🎬 Ajouter une vidéo de test:"
echo "   - Titre: 'Les Équations du 1er degré'"
echo "   - URL: https://youtu.be/kJQX31NMxzc"
echo ""
echo "💡 Besoin d'aide?"
echo "   Consultez: GUIDE_INTEGRATION_FINAL.md"
echo ""
echo "================================================================"
