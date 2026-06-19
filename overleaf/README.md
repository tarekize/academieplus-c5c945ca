# Documentation technique — AcadémiePlus (Overleaf)

Ce dossier contient la **documentation technique complète** du projet
AcadémiePlus, rédigée en **LaTeX** et prête à compiler sur
[Overleaf](https://overleaf.com) ou en local.

## Compilation

- **Compilateur** : `pdfLaTeX`
- **Fichier principal** : `main.tex`
- **Encodage** : UTF-8

### Sur Overleaf
1. Créez un nouveau projet → *Upload Project*.
2. Compressez le dossier `overleaf/` en `.zip` et importez-le.
3. Vérifiez que le compilateur est réglé sur **pdfLaTeX** (Menu → Settings).
4. Cliquez sur **Recompile**.

### En local
```bash
cd overleaf
pdflatex main.tex
pdflatex main.tex   # 2e passe pour la table des matières
```

## Structure

```
overleaf/
├── main.tex                 # document maître (titre, thème, imports)
└── sections/
    ├── 01-introduction.tex      # présentation, rôles, niveaux
    ├── 02-architecture.tex      # architecture globale, arborescence
    ├── 03-stack-technique.tex   # technologies, versions, librairies
    ├── 04-roles-auth.tex        # authentification et rôles
    ├── 05-fonctionnalites.tex   # toutes les pages écran par écran
    ├── 06-moteur-adaptatif.tex  # calcul du niveau de l'élève (ELO)
    ├── 07-base-de-donnees.tex   # 21 tables détaillées
    ├── 08-mcd.tex               # modèle conceptuel de données
    ├── 09-edge-functions.tex    # fonctions serveur IA
    ├── 10-securite-rls.tex      # sécurité et RLS
    └── 11-deploiement.tex       # déploiement, i18n, tests, conseils
```

## Packages LaTeX requis
Tous disponibles par défaut sur Overleaf : `babel` (french), `geometry`,
`xcolor`, `fancyhdr`, `titlesec`, `booktabs`, `longtable`, `tabularx`,
`hyperref`, `tcolorbox`, `listings`, `fontawesome5`, `amsmath`.

> Si `fontawesome5` n'est pas disponible localement, installez le paquet
> `texlive-fonts-extra` ou retirez les icônes `\fa...` du document.
