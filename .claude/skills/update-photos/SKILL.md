---
name: update-photos
description: Remplace les photos d'illustration du site par des images représentant des Africains noirs. Triggers : "change les photos", "mets des photos", "update images", "remplace les illustrations", "photos africaines"
---

Tu mets à jour les photos du site AIMH pour qu'elles représentent la communauté ivoirienne (personnes africaines noires, culture ivoirienne, vie associative africaine en France).

## Règles de sélection des photos Unsplash

### Sujets prioritaires (par ordre)
1. Personnes africaines noires — portraits, groupe, famille, célébration
2. Culture ivoirienne — tissus, masques, danse, musique traditionnelle
3. Gastronomie africaine — attiéké, maquis, plats ivoiriens
4. Paysages CI — Abidjan, plages, forêt tropicale, Yamoussoukro
5. Diaspora africaine en France — étudiants, professionnels, communauté

### Format URL Unsplash standard
```
https://images.unsplash.com/photo-PHOTO_ID?w=WIDTH&h=HEIGHT&auto=format&fit=crop&q=80
```

### IDs photo fiables (tester avant d'utiliser)
- Femme africaine portrait : `photo-1551698618-1dfe5d97d256`
- Danse africaine traditionnelle : `photo-1516450360452-9312f5e86fc7`
- Marché africain coloré : `photo-1578662996442-48f60103fc96`
- Art africain / masques : `photo-1547721064-da6cfb341d50`
- Tissu africain wax : `photo-1528360983277-13d401cdc186`
- Musique africaine : `photo-1493225457124-a3eb161ffa5f`
- Communauté africaine : `photo-1542810634-71277d95dcbb`
- Femme africaine beauté : `photo-1588137378633-dea1336ce1e2`
- Plage tropicale CI : `photo-1507525428034-b723cf961d3e`
- Forêt tropicale : `photo-1447752875215-b2761acb3c5d`
- Ville africaine (Abidjan) : `photo-1547970810-dc1eac37d174`

## Étapes

### 1. Identifier les images à remplacer
- Lire le fichier HTML ciblé
- Lister toutes les balises `<img>` et les `background:url(...)` 
- Repérer les images génériques (paysages européens, personnes non-africaines)

### 2. Choisir les remplacements
- Pour chaque image à remplacer, choisir un ID Unsplash adapté au contexte
- Conserver les mêmes dimensions (w=, h=)
- Toujours ajouter `alt="Description représentant [sujet]"`

### 3. Appliquer les remplacements
- Utiliser Edit pour chaque remplacement
- Ne pas toucher aux images déjà appropriées

### 4. Vérifier
- Confirmer le nombre d'images remplacées
- Signaler si certaines images n'ont pas pu être remplacées faute d'ID adapté
