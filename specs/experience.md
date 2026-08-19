# experience.md
Spécification expérience et contenu pour ayoub-hidri.dev v2
Objectif : transformer un CV en ligne en page de personal branding à double audience

---

## 1. Audiences et jobs de la page

| Audience | Ce qu'elle cherche | Action attendue |
|----------|--------------------|-----------------|
| A. Dirigeant de PME (10-50 salariés) | Comprendre ce que l'IA peut lui rapporter concrètement, sans blabla | Réserver un audit flash (Calendly) |
| B. DSI / CTO / ESN / recruteur tech | Vérifier la séniorité, la stack, les références | Contacter pour une mission ou télécharger le CV PDF |

Job unique de la page : convertir la crédibilité technique en confiance, puis en rendez-vous. Tout le reste est secondaire.

Principe de navigation : les deux audiences sont triées dès le hero via deux parcours explicites. Aucune des deux ne doit scroller dans du contenu qui ne la concerne pas sans l'avoir choisi.

---

## 2. Architecture de page (ordre de scroll)

```
01  HERO             promesse + tri des deux audiences
02  PREUVE           bande de références clients
03  PARCOURS IA      offre PME : audit flash + formation
04  CAS CONCRETS     3 preuves chiffrées, format problème/solution/résultat
05  PARCOURS TECH    missions senior, stack, open source
06  CV COMPRESSÉ     accordéon chronologique + PDF
07  ATELIER          la touche maker, humaine
08  CONTACT          CTA final + coordonnées
```

Chaque section ci-dessous précise : intention, contenu (copy FR de référence), comportement.

---

## 3. Sections

### 01. HERO

Intention : en 5 secondes, le visiteur sait ce qu'Ayoub fait, pour qui, et où cliquer.

Contenu :

- Eyebrow mono : `✕ AYOUB HIDRI / INGÉNIEUR & CONSULTANT IA / STRASBOURG`
- H1 (l'élément spectaculaire de la page) :
  "Je fabrique des systèmes qui font gagner du temps."
- Sous-titre (corps, max 2 lignes) :
  "15 ans d'ingénierie logicielle pour Leboncoin, Salomon ou Deloitte. Aujourd'hui, j'aide aussi les PME à mettre l'IA et l'automatisation au service de leur productivité."
- Deux cartes de tri, côte à côte (empilées sur mobile) :
  - Carte A : titre "Vous dirigez une PME", texte "Audit de vos process, automatisations concrètes, formation de vos équipes.", lien ancre vers section 03. Label mono : `PARCOURS IA`.
  - Carte B : titre "Vous cherchez un ingénieur senior", texte "React, TypeScript, Next.js, Strapi, NestJS. Missions freelance et leadership technique.", lien ancre vers section 05. Label mono : `PARCOURS TECH`.

Comportement : les ancres scrollent en douceur (sauf reduced-motion). Le sélecteur de langue FR/EN et le lien PDF restent dans un header minimal sticky (logo texte "AH", nav réduite : IA / Tech / CV / Contact).

### 02. PREUVE

Intention : désarmer le doute avant même de présenter l'offre.

Contenu :

- Eyebrow : `✕ ILS M'ONT FAIT CONFIANCE`
- Rangée de noms en texte (pas de logos images, cohérence brutaliste) : Leboncoin, Salomon, Deloitte, Engie Digital, Memo Bank, Technip Energies. Archivo 600, séparés par des filets verticaux.
- Une ligne mono en dessous : `15 ANS / 8 SECTEURS / MISSIONS DE 3 MOIS À 2 ANS`

### 03. PARCOURS IA (audience A)

Intention : présenter l'offre PME comme un chemin simple en deux marches, pas un catalogue.

Contenu :

- Eyebrow : `✕ ACCOMPAGNEMENT IA & AUTOMATISATION`
- H2 : "L'IA utile, pas l'IA gadget."
- Intro (3 phrases max) : "La plupart des PME perdent des heures chaque semaine sur des tâches que la machine fait mieux : saisie, relances, rapprochements, reporting. Je viens de l'ingénierie, pas du conseil en slides. Chaque recommandation que je fais, je sais la construire."
- Deux blocs d'offre (cartes) :
  1. **Audit flash** : "2 à 3 jours dans vos équipes. Je cartographie vos process, j'identifie 5 à 10 automatisations chiffrées en heures gagnées par mois, et je vous livre une feuille de route priorisée. Vous savez quoi faire, dans quel ordre, et ce que ça rapporte." Métadonnée mono : `2-3 JOURS / LIVRABLE : FEUILLE DE ROUTE`.
  2. **Formation équipes** : "1 à 2 jours pour rendre vos équipes autonomes : usage professionnel de l'IA générative, prompts métier, et un premier workflow d'automatisation construit en direct sur votre cas réel." Métadonnée mono : `1-2 JOURS / INTRA-ENTREPRISE`.
- Note financement (une ligne, corps secondaire) : mention du financement possible de la formation, formulation à valider selon le statut Qualiopi/portage au moment de la mise en ligne. Ne rien promettre de faux.
- CTA principal de la page (le seul en bleu) : "Réserver un échange de 30 min" vers Calendly.

### 04. CAS CONCRETS

Intention : prouver par l'exemple. C'est la section qui vend l'audit.

Format : 3 cartes identiques, structure stricte en 3 lignes chacune :

- `PROBLÈME` (mono) : une phrase.
- `SYSTÈME` (mono) : une phrase.
- `RÉSULTAT` (mono) : un chiffre en gros + une phrase.

Contenu de référence (à affiner avec les vrais chiffres avant mise en ligne, ne jamais publier de chiffre invérifiable) :

1. Rapprochement comptable : détection automatique des justificatifs manquants sur le compte pro et relance, au lieu d'une chasse manuelle mensuelle aux reçus.
2. Tri d'emails : classification automatique des emails entrants (factures, prospects, administratif) avec actions associées.
3. Traitement documentaire : système OCR de traitement de documents d'assurance chez MMA/COVEA, automatisation du traitement des sinistres.

Chaque carte se termine par les tags techno concernés (n8n, Claude, PostgreSQL, etc.) en tags mono.

### 05. PARCOURS TECH (audience B)

Intention : rassurer un profil technique en 20 secondes de scan.

Contenu :

- Eyebrow : `✕ MISSIONS & EXPERTISE TECHNIQUE`
- H2 : "Ingénieur full stack senior, orienté produit."
- Paragraphe court : disponibilité pour missions freelance longues, leadership technique, modernisation de legacy, remote-first depuis Strasbourg.
- Tableau de stack (le tableau brutaliste assumé) : colonne techno / colonne années. React 10+, TypeScript 8+, Next.js 10+, Node.js 12+, NestJS 6+, Strapi 4+, PostgreSQL 10+, AWS 8+.
- Bloc "IA & agents" distinct : développement d'agents (Claude SDK, skills, plugins), orchestration de workflows IA, intégration LLM en production. C'est le pont entre les deux parcours : un dev senior qui maîtrise réellement l'outillage IA.
- Bloc open source : contributeur Strapi Stars, plugins publiés sous l'organisation opkod-france. Liens GitHub.
- CTA secondaire : "Me contacter" (mailto) + "Télécharger le CV" (PDF).

### 06. CV COMPRESSÉ

Intention : garder la profondeur du CV actuel sans qu'elle écrase la page.

Contenu et comportement :

- Eyebrow : `✕ PARCOURS`
- Accordéon chronologique reprenant les expériences existantes de la page actuelle (Salomon, Leboncoin, Deloitte, Engie, Isobar, Cleanio, Business & Decision, DigitalMania), fermées par défaut, 3 puces max par poste une fois ouvertes.
- Ligne de titre fermée : poste + entreprise à gauche, dates mono à droite.
- Formation (ESPRIT 2010) et langues (français, anglais, arabe) en une ligne compacte sous l'accordéon.
- Lien permanent vers le PDF bilingue.

### 07. ATELIER

Intention : la section qui rend la page mémorable et humaine. Courte.

Contenu :

- Eyebrow : `✕ À CÔTÉ DU CLAVIER`
- H3 : "Je fabrique aussi des choses qu'on peut toucher."
- 3 à 4 lignes : broderie machine et pixel art (Brother PR680W), impression 3D (Bambu Lab X1C), découpe laser, meubles en bois, un trieur de LEGO. Une phrase de conclusion du type : "Même logique qu'en logiciel : comprendre le système, puis le construire."
- Optionnel : 2-3 photos carrées en noir et blanc, traitées en tramé/pixelisé pour rester dans la signature visuelle. Pas de galerie.

### 08. CONTACT

Intention : dernier point de conversion, minimal.

Contenu :

- H2 : "On en parle ?"
- Une ligne : "Un process à fluidifier, une équipe à former, une mission technique : écrivez-moi ou prenez un créneau."
- CTA primaire : Calendly. CTA secondaire : email.
- Footer : email, LinkedIn, GitHub (ayhid + opkod-france), Medium, mention légale minimale (OPKOD), lien FR/EN.

---

## 4. Bilinguisme

- FR par défaut (l'offre IA vise des PME françaises), toggle EN dans le header.
- La version EN peut alléger la section 03 (l'offre PME est franco-centrée) et mettre le parcours tech en premier. À trancher en v1 : soit une EN miroir simple, soit une EN réordonnée. Recommandation : miroir simple en v1, réordonnancement en v2.
- Conserver les balises hreflang et les métadonnées OG existantes, mises à jour avec le nouveau positionnement.

## 5. SEO et métadonnées

- Title FR : "Ayoub Hidri : Consultant IA & automatisation pour PME, ingénieur full stack senior"
- Meta description FR : promesse + preuve, 150 caractères max, sans superlatif creux.
- JSON-LD : Person + ProfessionalService (OPKOD), sameAs vers LinkedIn/GitHub/Medium.
- Une seule page, ancres propres (`/#ia`, `/#tech`, `/#cv`, `/#contact`). Le CV détaillé peut devenir `/cv` en v2 si l'accordéon ne suffit pas.

## 6. Mesure du succès

- Événements à tracker (analytics sobre, type Plausible ou Umami, pas de cookies tiers) : clic Calendly, clic mailto, téléchargement PDF, clic carte parcours A vs B.
- KPI v1 : ratio visites vers clics Calendly. C'est le seul chiffre qui valide le repositionnement.

## 7. Hors scope v1

- Blog intégré (Medium suffit pour l'instant).
- Mode sombre.
- Page /cv séparée.
- Témoignages clients (à ajouter dès qu'il y en a deux de vrais, section prévue entre 04 et 05).
