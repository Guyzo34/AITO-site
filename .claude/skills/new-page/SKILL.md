---
name: new-page
description: Crée une nouvelle page HTML conforme au design AIMH. Triggers : "crée une page", "nouvelle page", "ajoute une page", "new page"
---

Tu crées une nouvelle page HTML pour le site AIMH en respectant scrupuleusement la charte graphique existante.

## Étapes

### 1. Demander les informations si pas fournies
- Titre de la page (ex: "Partenariats")
- Section de navigation où elle apparaît (Services, standalone, etc.)
- Contenu principal souhaité (texte, cartes, formulaire, etc.)

### 2. Créer le fichier HTML
Utilise ce squelette exact — ne pas en dévier :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <script src="js/maintenance.js"></script>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITRE] — AIMH</title>
  <link rel="stylesheet" href="css/style.css">
<style>
.nav-logo { display:flex !important; align-items:center !important; gap:10px !important; margin-right:1.5rem; flex-shrink:0; text-decoration:none; }
.nav-logo-flag { flex-shrink:0; display:flex; align-items:center; }
.nav-logo-flag svg { height:36px; width:auto; border-radius:4px; box-shadow:0 1px 5px rgba(0,0,0,.4); display:block; }
.nav-logo img { height:80px !important; width:auto !important; border-radius:8px !important; display:block !important; filter:drop-shadow(0 2px 8px rgba(0,0,0,.5)); }
.nav-logo-texts { display:flex; flex-direction:column; line-height:1.25; }
.nav-logo-acronym { font-family:'Playfair Display',Georgia,serif; font-size:1.4rem; font-weight:900; color:#fff; letter-spacing:1.5px; }
.nav-logo-name { font-size:.65rem; color:rgba(255,255,255,.6); letter-spacing:.4px; line-height:1.3; }
@media(max-width:768px){ .nav-logo img { height:52px !important; } .nav-logo-name { display:none; } .nav-logo-acronym { font-size:1.1rem; } }
</style>
</head>
<body>
<div class="flag-bar" aria-hidden="true"></div>
<nav class="navbar">
  <div class="nav-container">
    <a href="index.html" class="nav-logo">
      <div class="nav-logo-flag"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="1" height="2" fill="#F77F00"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#009A44"/></svg></div>
      <img src="images/logo.png" alt="AIMH Logo">
    </a>
    <div class="nav-occitanie" title="Région Occitanie"><img src="images/occitanie.svg" alt="Région Occitanie" style="height:38px;width:auto;opacity:.92;"></div>
    <button class="nav-toggle" id="navToggle"><span></span><span></span><span></span></button>
    <div class="nav-menu" id="navMenu">
      <a href="index.html">Accueil</a><a href="presentation.html">Présentation</a><a href="actualites.html">Actualités</a><a href="evenements.html">Événements</a>
      <a href="galerie.html">Galerie</a>
      <div class="dropdown"><a href="#">Services ▾</a><div class="dropdown-menu"><a href="adhesion.html">Adhésion &amp; Cotisations</a><a href="collectivites.html">Collectivités</a><a href="projets-economiques.html">Projets économiques</a><a href="financement.html">Financement &amp; Subventions</a><a href="assurances.html">Assurances décès</a><a href="compatriotes.html">Infos Compatriotes</a><a href="tourisme.html">Tourisme Côte d'Ivoire</a></div></div>
      <a href="partenaires.html">Partenaires</a><a href="contact.html">Contact</a><a href="connexion.html" class="btn-nav">Mon espace</a>
    </div>
  </div>
</nav>
<div class="page-content">

[CONTENU ICI]

</div>
<!-- FOOTER -->
<script src="js/nav.js"></script>
</body>
</html>
```

### 3. Contenu
- Page hero avec image Unsplash représentant des Ivoiriens / Afrique / Montpellier selon le contexte
- Au moins une section `.section` avec `.container`
- Utiliser les composants existants : `.card`, `.cards-grid`, `.feature-item`, `.page-hero`

### 4. Ajouter le lien dans la navigation
- Mettre à jour la navbar de TOUTES les pages existantes si la nouvelle page est dans la nav principale
- Utiliser un PowerShell bulk-replace si nécessaire

### 5. Vérification finale
- Ouvrir le fichier créé
- Confirmer : navbar, footer, page-hero, au moins une section de contenu
