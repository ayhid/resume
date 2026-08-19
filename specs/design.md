# design.md
Spécification design pour ayoub-hidri.dev v2 (page de personal branding)
Direction : brutalisme sobre, minimalisme d'ingénieur

---

## 1. Intention

La page doit ressembler à ce qu'Ayoub est : un ingénieur qui fabrique des systèmes, pas une agence qui vend du rêve. Le brutalisme ici n'est pas une posture agressive : c'est la matière brute et honnête. Structure visible, hiérarchie franche, zéro décoration gratuite. Chaque élément a une fonction, sinon il est supprimé.

Référence mentale : un document technique bien composé, croisé avec une grille de broderie pixel. Pas un template Dribbble.

Interdits absolus :

- Aucun border-radius. Angles droits partout.
- Aucune ombre portée (box-shadow), aucun dégradé, aucun glassmorphism.
- Aucune image stock, aucune illustration 3D générique, aucun emoji dans l'UI.
- Pas de carrousel, pas de slider.
- Pas de fond crème + accent terracotta (cliché IA), pas de fond noir + vert acide.

---

## 2. Palette

Palette réduite à 4 valeurs + 1 accent. L'accent est un bleu de travail : le bleu des vestes d'atelier françaises. Il relie le côté maker (atelier, machines) et le côté sérieux (documents officiels). C'est le seul élément de couleur de la page.

| Token          | Hex       | Usage |
|----------------|-----------|-------|
| `--paper`      | `#F7F6F2` | Fond principal, blanc cassé légèrement gris, comme du papier machine |
| `--ink`        | `#141414` | Texte principal, bordures, éléments structurels |
| `--ink-60`     | `#5C5C58` | Texte secondaire, métadonnées, légendes |
| `--line`       | `#D8D6CF` | Filets fins, grille de fond, séparateurs discrets |
| `--work-blue`  | `#2B44D8` | Accent unique : liens, CTA, marqueurs actifs, sélection de texte |

Règles :

- `--work-blue` ne couvre jamais plus de 5 % de la surface visible d'un écran.
- Les CTA principaux sont en `--ink` plein avec texte `--paper`. Le bleu est réservé au CTA prioritaire de la page (un seul).
- `::selection` : fond `--work-blue`, texte `--paper`. Petit détail signature.
- Mode sombre : hors scope v1. Ne pas implémenter à moitié.

---

## 3. Typographie

Deux familles, pas trois. L'économie fait partie du brutalisme.

### Display et corps : Archivo (variable)

- Display : Archivo, graisse 700 à 800, largeur étendue (axe wdth 110 à 125) pour les H1/H2. Capitales ou sentence case selon la section, letter-spacing légèrement négatif (-0.02em) sur les très gros corps.
- Corps : Archivo 400, largeur normale, 16 à 18 px, line-height 1.6, mesure max 68ch.

### Utilitaire : IBM Plex Mono

- Tout ce qui est métadonnée : dates, tags techno, labels de section (eyebrows), numéros, chiffres clés, légendes.
- Toujours en 12 à 13 px, letter-spacing +0.04em, souvent en capitales.
- C'est la voix "terminal" de la page : elle rappelle que l'auteur vit dans un éditeur de code.

### Échelle typographique

Base 16 px, ratio ~1.333 (quarte). Valeurs indicatives desktop / mobile :

| Rôle      | Desktop  | Mobile  | Famille |
|-----------|----------|---------|---------|
| H1 hero   | 72-96 px | 40-48 px | Archivo 800 étendu |
| H2        | 40 px    | 28 px   | Archivo 700 étendu |
| H3        | 24 px    | 20 px   | Archivo 700 |
| Corps     | 18 px    | 16 px   | Archivo 400 |
| Meta/mono | 13 px    | 12 px   | IBM Plex Mono 500 |

Le H1 du hero est l'élément le plus expressif de la page. Il peut casser la grille (déborder légèrement, occuper toute la largeur). C'est le seul endroit où la typo a le droit d'être spectaculaire.

---

## 4. Signature visuelle : la grille point de croix

L'élément mémorable de la page, discret mais partout. Il vient directement de l'univers d'Ayoub : broderie pixel art + pixel art + ingénierie.

1. **Grille de fond** : un pattern de grille très léger (lignes `--line` à 8 % d'opacité, maille de 24 px) sur le fond `--paper`, visible seulement si on y prête attention. Comme une toile Aïda de broderie ou du papier millimétré.
2. **Marqueurs de section** : chaque section est introduite par un eyebrow mono précédé d'un petit motif de croix (✕ dessiné en CSS/SVG, 8 px, couleur `--ink`), comme un point de croix. Exemple : `✕ ACCOMPAGNEMENT IA`.
3. **Soulignement stitch** : les liens ont un soulignement en pointillés courts (border-bottom dashed 1px), qui passe en trait plein `--work-blue` au hover. Le lien "se coud" au survol.
4. **Avatar pixel** : si un portrait est utilisé, version pixelisée basse résolution (style grille de broderie 32x32) plutôt qu'une photo corporate. Optionnel v1.

Ne pas en rajouter au-delà de ces quatre usages. La signature vaut par sa répétition discrète, pas par son volume.

---

## 5. Grille et espacement

- Conteneur max 1140 px, gouttières 24 px mobile / 48 px desktop.
- Grille 12 colonnes desktop, 4 colonnes mobile.
- Échelle d'espacement : 4 / 8 / 16 / 24 / 40 / 64 / 104 px. Rien en dehors.
- Sections séparées par un filet plein `--ink` de 1 px pleine largeur (pas un filet gris timide : une vraie ligne de structure). À l'intérieur des sections, filets `--line`.
- Asymétrie assumée : les sections alternent des compositions décalées (titre colonne 1-5, contenu colonne 6-12) plutôt qu'un centrage systématique.

---

## 6. Composants

### Boutons

- Rectangle net, bordure 1 px `--ink`, padding 14 px 24 px, label en IBM Plex Mono capitales 13 px.
- Primaire : fond `--ink`, texte `--paper`. Hover : fond `--work-blue`, translation 0 (pas d'effet de lift, pas d'ombre).
- Secondaire : fond transparent, bordure `--ink`. Hover : fond `--ink`, texte `--paper`.
- Focus clavier : outline 2 px `--work-blue`, offset 2 px, toujours visible.

### Cartes (les deux parcours, les cas clients)

- Bordure 1 px `--ink`, fond `--paper`, aucun radius, aucune ombre.
- Hover : la bordure passe à 2 px sans décaler le layout (utiliser outline ou box-shadow inset), et le titre passe en `--work-blue`.
- Toute la carte est cliquable si elle mène quelque part.

### Tags techno

- IBM Plex Mono 12 px, bordure 1 px `--line`, padding 4 px 8 px, fond transparent. Pas de pilules colorées.

### Accordéon (CV compressé)

- Ligne de titre : poste + entreprise (Archivo 600) à gauche, dates en mono à droite, chevron ASCII `+` qui devient `-` à l'ouverture.
- Séparés par des filets `--line`. Ouverture sans animation élaborée : une transition height/opacity de 150 ms suffit.

### Tableaux de chiffres (preuves, résultats)

- Vrais tableaux HTML avec filets horizontaux uniquement. Chiffres en mono. Le brutalisme aime les tableaux.

---

## 7. Motion

Le moins possible, et uniquement fonctionnel.

- Transitions : 150 ms ease-out sur couleur et bordure. C'est tout.
- Pas de scroll-triggered reveals, pas de parallax, pas de compteurs animés, pas de texte qui se tape tout seul.
- Une seule exception autorisée : au chargement, le H1 du hero peut apparaître ligne par ligne (translation 8 px + opacité, 300 ms, stagger 80 ms). Optionnel.
- `prefers-reduced-motion: reduce` : toutes les transitions à 0.

---

## 8. Accessibilité et qualité

- Contrastes : `--ink` sur `--paper` = ratio > 15:1. `--ink-60` réservé aux textes 14 px et plus. `--work-blue` sur `--paper` = ratio ~7:1, ok partout.
- Navigation clavier complète, focus visibles (voir Boutons), skip-link vers le contenu.
- HTML sémantique strict : un seul h1, landmarks, boutons pour les actions, liens pour la navigation.
- Lighthouse cible : 100 accessibilité, > 95 performance. Pas de framework CSS lourd : CSS custom ou Tailwind purgé.
- Fonts en self-host (woff2, `font-display: swap`), variable fonts pour limiter les requêtes.

---

## 9. Ton rédactionnel (résumé, détail dans experience.md)

- Phrases courtes. Voix active. Première personne.
- Des chiffres plutôt que des adjectifs : "12 h/mois récupérées" plutôt que "gain de productivité significatif".
- Aucun jargon marketing : bannir "solutions innovantes", "accompagnement sur mesure", "révolutionner".
- Le mono sert les faits, l'Archivo sert les convictions.
