#!/usr/bin/env powershell

# 🚀 QUICK START - Affichage Adaptatif (Windows)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🎓 Système d'Affichage Adaptatif - QUICK START (Windows)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify current directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json not found" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Répertoire correct" -ForegroundColor Green
Write-Host ""

# 2. Install/Update dependencies
Write-Host "📦 Vérifiant les dépendances..." -ForegroundColor Yellow
$framerCheck = npm list framer-motion 2>$null | Select-String "framer-motion"
if (-not $framerCheck) {
    Write-Host "⚠️  Framer Motion manquant, installation..." -ForegroundColor Yellow
    npm install framer-motion
}
Write-Host "✅ Dépendances OK" -ForegroundColor Green
Write-Host ""

# 3. Build test
Write-Host "🔨 Compilation..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0 -or $buildOutput -like "*built*") {
    Write-Host "✅ Compilation réussie" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur de compilation" -ForegroundColor Red
    Write-Host ($buildOutput | Select-Object -Last 30) -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Summary
Write-Host "================================================================" -ForegroundColor Green
Write-Host "✨ PRÊT À UTILISER!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - GUIDE_AFFICHAGE_ADAPTATIF_v2.md"
Write-Host "   - GUIDE_INTEGRATION_FINAL.md"
Write-Host "   - GUIDE_TEST_AFFICHAGE_ADAPTATIF.md"
Write-Host ""

Write-Host "📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. npm run dev" -ForegroundColor White
Write-Host "   2. Ajouter route /video-admin dans App.tsx" -ForegroundColor White
Write-Host "   3. Intégrer dans Cours.tsx (voir guide)" -ForegroundColor White
Write-Host "   4. Visiter http://localhost:5173/video-admin" -ForegroundColor White
Write-Host ""

Write-Host "🎬 Ajouter une vidéo de test:" -ForegroundColor Cyan
Write-Host "   - Titre: 'Les Équations du 1er degré'" -ForegroundColor White
Write-Host "   - URL: https://youtu.be/kJQX31NMxzc" -ForegroundColor White
Write-Host ""

Write-Host "💡 Besoin d'aide?" -ForegroundColor Cyan
Write-Host "   Consultez: GUIDE_INTEGRATION_FINAL.md" -ForegroundColor White
Write-Host ""

Write-Host "================================================================" -ForegroundColor Green
