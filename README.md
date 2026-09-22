# Zenix v2.5.2 — Suivi glycémique

Application web progressive (PWA) personnelle de suivi glycémique. Toutes les données restent dans le navigateur (localStorage).

> ⚠️ Outil personnel : il ne remplace pas un avis médical. Ratios, cible et sensibilité doivent être validés avec votre diabétologue.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète |
| `sw.js` | Service worker (mode hors ligne) |
| `manifest.json` | Installation sur l'écran d'accueil |
| `icon.svg`, `icon-*.png`, `apple-touch-icon.png` | Icônes |

Tous les fichiers doivent être dans le même dossier, servis en HTTPS (ex. GitHub Pages).

## Saisie compacte (v2.5)

- Date et heure sur la même ligne.
- Mention « Additionnez directement… » supprimée.
- Commentaire déplacé sous le bouton Enregistrer (à remplir avant d'enregistrer : il est sauvegardé avec l'entrée).
- iPhone (appli installée) : l’appli occupe tout l’écran, plus de bande vide sous la barre de navigation ; barre du bas abaissée au plus près de la barre d’accueil (v2.5.1).
- Correctif iPhone (v2.5.2) : avec le pavé calculatrice, le champ Glucides ne prend plus le focus (il passe en lecture seule). Safari ne décale donc plus la page : la touche affichée est bien celle qui est tapée (avant : on tapait « 2 », il écrivait « 5 », et le curseur apparaissait sous le champ).
- Correctif : avec le pavé ouvert dans la modification d'une entrée, le bouton Enregistrer pouvait être « raté » (la fenêtre se fermait sans enregistrer).

## Affichage mobile (v2.4)

- Structure d'appli : l'en-tête (logo + page) et la barre de navigation restent fixes, seule la zone centrale défile. Plus de barre qui bouge sur iPhone (rebond, clavier).
- Marges de sécurité iPhone respectées (Dynamic Island, barre d'accueil, bords en paysage).
- Tous les champs en 16 px sur mobile : Safari ne zoome plus sur la page quand on touche un champ (c'était ce qui faisait déborder le logo et les modules).
- Le rappel « Aucune sauvegarde » n'apparaît plus en haut de l'écran, uniquement dans ⚙️ Réglages.

## Identité visuelle (v2.3)

- Icône **Ensō** : cercle zen tracé au pinceau, du jaune au vert, avec un soleil et un reflet sur l'eau, sur fond vert forêt.
- Thème de l'appli accordé : fond vert très sombre, accent jaune-vert (`#c3e25a`), bouton principal en dégradé jaune → vert.
- `icon-maskable-512.png` : version plein cadre pour les icônes adaptatives d'Android.
- `apple-touch-icon.png` : version carrée pour iPhone et iPad (iOS arrondit les coins lui-même).
- Cache du service worker passé en `zenix-v3` pour que les nouvelles icônes remplacent les anciennes.

## Calcul de la dose

- **Insuline glucides** = glucides / 10 × ratio du repas
- **Correction** = (glycémie − cible) / sensibilité, **0 si aucune glycémie n'est saisie**
- **Recommandée** = glucides + correction (minimum 0), avec l’arrondi au pas du stylo affiché (1 U par défaut)

### Suggestion avec insuline active (IOB)

Le calcul principal ne tient **pas** compte de l'insuline active. Quand de l'insuline est encore active, un bloc séparé « Suggestion » montre le détail :

correction brute − insuline active = correction ajustée (minimum 0) + insuline glucides = dose suggérée

L'insuline active n'est déduite que d'une correction positive, jamais de la part glucides.

## Contrôles de saisie

- Glycémie acceptée entre 0,20 et 6,00 g/L. Une valeur > 20 est reconnue comme des mg/dL, avec un bouton « Convertir ».
- Glucides : maximum 400 g. Les calculs se tapent directement, sans « = » : `30+45+20`, `2×15`, `12,5+10`. Le total s'affiche en direct dans le champ, et **Entrée** ou **=** remplace le calcul par son résultat. L'ancienne écriture `=30+45` fonctionne toujours.
- Au-delà de 40 U injectées, une confirmation est demandée.

### Pavé calculatrice (glucides)

Le bouton 🧮 dans le champ Glucides active un pavé calculatrice : chiffres, + − × ÷, virgule, ⌫, C et =. Quand il est actif, le clavier du téléphone ne s'ouvre pas pour ce champ.

- Activé par défaut sur téléphone et tablette, désactivé sur ordinateur. Le choix est mémorisé.
- Deux opérateurs d'affilée : le second remplace le premier.
- **=** calcule le total et ferme le pavé.
- Le pavé est aussi disponible dans la modification d'une entrée.

## Navigation (v2.1)

L'application est découpée en 5 pages. La barre de navigation est en bas sur mobile et en haut sur ordinateur :

| Page | Contenu |
|---|---|
| ✏️ Saisie | Formulaire, calcul de dose, insuline active et suggestion, résumé du jour |
| 📈 Graphiques | Statistiques de la période et graphiques |
| 📋 Historique | Totaux par jour et liste des entrées (modifier, supprimer) |
| 📊 Analyse | Résumé journalier, analyse des ratios et de la sensibilité |
| ⚙️ Réglages | Paramètres, historique des modifications, export et import |

Le bouton retour du téléphone ramène à la page précédente. Chaque page a son adresse (par exemple `index.html#historique`). L'appli s'ouvre toujours sur Saisie.

## Nouveautés v2

- Date et heure en **heure locale** (corrige les entrées datées de la veille entre minuit et 2 h)
- Repas choisi automatiquement selon l'heure, bouton « ↺ Dernier repas »
- **Écart = recommandé − injecté** (remplace l'ancien « manque »)
- Modification d'une entrée : heure modifiable, formules de glucides, recalcul avec les paramètres d'origine
- Filtre de période (7 j / 14 j / 30 j / 90 j / tout) et statistique « % sous le seuil haut »
- Graphiques triés par date **et heure**, lignes de cible et de seuil
- **Analyse des ratios** basée sur la glycémie 2 à 5 h après le repas (et non plus sur la dose injectée)
- **Analyse de sensibilité** calculée à partir des corrections pures (sans glucides ni insuline active)
- Nouveaux paramètres : seuil haut, ratio nuit/collation, durée d'action, pas du stylo
- Export CSV (Excel/Numbers), import JSON validé avec fusion ou remplacement
- Rappel de sauvegarde après 14 jours sans export
- Service worker enfin actif (le script dupliqué de la v1 bloquait son enregistrement)

## Compatibilité

Les données de la v1 sont reprises automatiquement (mêmes clés de stockage). L'ancien « manque » est recalculé en écart.

## Version de secours (v1)

Le dossier `v1/` contient l'ancienne version, accessible à l'adresse `…/v1/`. Elle partage les mêmes données que la v2 (même site, même stockage). En cas de bug bloquant dans la v2, ouvre `…/v1/` pour continuer à saisir, puis reviens à la v2 une fois le bug corrigé.
