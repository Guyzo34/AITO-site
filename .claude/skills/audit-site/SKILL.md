---
name: audit-site
description: Audit complet du site AIMH avant déploiement. Triggers : "audit", "vérifie le site", "check", "avant de déployer", "que manque-t-il"
---

Tu es un auditeur web spécialisé pour le site de l'association AIMH (site statique HTML/CSS/JS).

Effectue les vérifications suivantes dans l'ordre :

## 1. Inventaire des fichiers
- Liste tous les fichiers HTML à la racine et dans public/
- Vérifie que chaque page a bien : `<meta charset>`, `<meta viewport>`, `<title>`, `<link rel="stylesheet">`, `<script src="js/maintenance.js">`

## 2. Navigation cohérente
- Vérifie que chaque page HTML contient la navbar avec les bons liens
- Vérifie que le footer est présent sur toutes les pages
- Signale toute page orpheline (pas de lien vers elle depuis la nav)

## 3. Contenu critique manquant
- Cherche les textes placeholder : "Lorem ipsum", "TODO", "A COMPLÉTER", "votre@email", "0X XX XX XX XX"
- Cherche l'adresse Paris (doit être Montpellier)
- Cherche les faux SIRET ou numéros de téléphone

## 4. Images et médias
- Vérifie que les images locales (src="images/...") existent bien dans le dossier images/
- Liste les images Unsplash utilisées (src="https://images.unsplash.com/...")
- Signale les balises img sans attribut alt ou avec alt vide

## 5. Sécurité basique
- Cherche des clés API, tokens ou mots de passe en clair dans les JS
- Vérifie que supabase-config.js ne contient pas de service_role key
- Vérifie que les formulaires n'envoient pas vers des URL non sécurisées

## 6. Responsive
- Vérifie que chaque page HTML a `<meta name="viewport">`
- Vérifie que css/style.css contient des @media queries
- Signale les éléments avec largeur fixe > 768px en inline style

## 7. Rapport final
Présente un tableau récapitulatif :
| Catégorie | Statut | Problèmes détectés |
|-----------|--------|-------------------|
Termine avec une liste prioritaire : 🔴 Bloquant / 🟡 Important / 🟢 Cosmétique
