# 📋 Feuille de Route Complète du Site Frontend

**Pour:** Équipe Frontend  
**Plan Client:** "Hub interactif et inclusif"  
**Version:** 1.0

---

## 📑 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture globale](#architecture-globale)
3. [Pages & Sections](#pages--sections)
4. [Composants réutilisables](#composants-réutilisables)
5. [Fonctionnalités transversales](#fonctionnalités-transversales)
6. [Flux utilisateur complets](#flux-utilisateur-complets)

---

## 🎯 Vue d'ensemble

**Objectif:** Créer une plateforme web inclusive et accessible pour l'emploi et l'inclusion des personnes en situation de handicap.

**Publics cibles:**
- 👥 Personnes en situation de handicap (membres)
- 💼 Employeurs (recruteurs)
- 👨‍⚕️ Experts (médecins, juristes, assistants sociaux)
- 📢 Administrateurs (modérateurs, content creators)

---

## 🏗️ Architecture globale

### Structure de navigation

```
┌─ Accueil
├─ Forum / Communauté
│  ├─ Lister discussions
│  ├─ Créer post
│  ├─ Détail post + Commentaires
│  └─ Mon activity (mes posts)
│
├─ Podcasts
│  ├─ Lister podcasts
│  ├─ Lecteur player
│  ├─ Détail épisode
│  └─ Filtrer par catégorie
│
├─ Témoignages
│  ├─ Lister témoignages
│  ├─ Détail témoignage
│  ├─ Soumettre mon histoire
│  └─ Filtrer par catégorie
│
├─ Emplois & Recrutement
│  ├─ Lister offres emploi
│  ├─ Détail offre
│  ├─ Postuler (upload CV)
│  ├─ Mes candidatures
│  └─ Publier offre (RH)
│
├─ Ressources Éducatives
│  ├─ Lister articles
│  ├─ Détail article
│  ├─ Filtrer par catégorie
│  └─ Partager/Imprimer
│
├─ Experts & Annuaire
│  ├─ Lister experts
│  ├─ Détail expert
│  ├─ Filtrer par spécialité
│  └─ Contacter expert
│
├─ Galerie Multimédia
│  ├─ Albums par thème
│  ├─ Galerie photos
│  ├─ Galerie vidéos
│  └─ Lightbox viewer
│
├─ Profil Utilisateur
│  ├─ Mon profil
│  ├─ Éditer infos
│  ├─ Avatar/Photo profil
│  ├─ Mes posts
│  ├─ Mes témoignages
│  ├─ Mes candidatures
│  └─ Paramètres (notifications, confidentialité)
│
├─ À Propos & Contact
│  ├─ Qui sommes-nous
│  ├─ Mission & Valeurs
│  ├─ Équipe
│  └─ Contact
│
└─ Admin Panel (si connecté admin)
   ├─ Dashboard
   ├─ Modération posts
   ├─ Gestion experts
   ├─ Gestion annonces
   └─ Analytics
```

---

## 📄 Pages & Sections

### 1️⃣ PAGE D'ACCUEIL

#### Layout général
```
┌─────────────────────────────────┐
│         HEADER/NAV              │
├─────────────────────────────────┤
│    HERO BANNER / HERO IMAGE     │  ← Image/vidéo inspirante
│   "Bienvenue - slogan inspirant"│  ← Titre + sous-titre
│        [CTA Buttons]            │  ← "Rejoindre" "En savoir plus"
├─────────────────────────────────┤
│  PODCAST DU JOUR / FEATURED     │
│  ┌─────────────────────────────┐│
│  │ 🎙️ [COVER] Titre Episode   ││  ← Lecteur player intégré
│  │ Description courte...       ││  ← Durée, catégorie
│  │ [Écouter maintenant]        ││  ← Bouton play
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  HISTOIRES & TÉMOIGNAGES (grid) │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Tém 1│ │Tém 2│ │Tém 3│      │  ← Cards témoignages récents
│  │[+]  │ │[+]  │ │[+]  │      │  ← Photo + titre + excerpt
│  └─────┘ └─────┘ └─────┘      │
│       [Voir tous les témoignages] │
├─────────────────────────────────┤
│  ANNONCES & ACTUALITÉS          │
│  ┌─────────────────────────────┐│
│  │📢 Titre Actualité 1         ││  ← Timeline verticale
│  │📢 Titre Actualité 2         ││
│  │📢 Titre Actualité 3         ││
│  └─────────────────────────────┘│
├─────────────────────────────────┤
│  EXPERTS EN VEDETTE (cards)     │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Exp 1│ │Exp 2│ │Exp 3│      │  ← Photo + nom + spécialité
│  │bio..│ │bio..│ │bio..│      │  ← Lien contact
│  └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────┤
│  APPEL À L'ACTION (CTAs)        │
│  "Racontez votre histoire"      │  ← Buttons gros
│  "Rejoindez le forum"           │
│  "Partagez votre avis"          │
├─────────────────────────────────┤
│         FOOTER                  │
└─────────────────────────────────┘
```

#### Détails des sections

**Hero Section:**
- [ ] Image/vidéo background (parallax optionnel)
- [ ] Titre inspirant (h1)
- [ ] Sous-titre (description)
- [ ] 2-3 boutons CTA (Primary + Secondary)
- [ ] Logo/icônes décoratives

**Featured Podcast:**
- [ ] Card avec cover image
- [ ] Titre + description courte (150 chars)
- [ ] Lecteur audio intégré (play/pause/progress bar)
- [ ] Durée affichée
- [ ] Lien "Voir tous les podcasts"

**Témoignages Récents:**
- [ ] Grid 3 colonnes (responsive: 1 mobile, 2 tablette)
- [ ] Chaque card: photo (avatar) + titre + excerpt + "Lire plus"
- [ ] Hover effect
- [ ] Lien vers page complète

**Annonces & Actualités:**
- [ ] Timeline verticale (ou horizontal scroll)
- [ ] Icône + Titre + Date courte
- [ ] Lien vers détail
- [ ] Catégories (actualité|événement|formation)

**Experts Vedette:**
- [ ] Grid 4 colonnes (responsive)
- [ ] Photo profil + Nom + Spécialité + Organisation
- [ ] Petit bio (2 lignes max)
- [ ] Bouton "Voir profil"

**Section CTAs:**
- [ ] 3-4 gros boutons avec icônes
- [ ] "Racontez votre histoire" → /soumettre-temoignage
- [ ] "Rejoignez le forum" → /forum
- [ ] "Trouvez un expert" → /experts
- [ ] "Parcourez les offres" → /emplois

---

### 2️⃣ FORUM / COMMUNAUTÉ

#### Page Lister Posts

```
┌─────────────────────────────────┐
│ HEADER + SEARCH                 │
├─────────────────────────────────┤
│ [Filters] [Sort] [Create Post]  │  ← Filtres + Bouton créer
├─────────────────────────────────┤
│ POST 1                          │  ← Carte post
│ Titre: "Comment chercher emploi"│
│ Auteur: Ahmed D. | 2 jours ago  │
│ "Voici mes conseils après 2 ans"│
│ 👁️ 128 vues | 💬 5 commentaires │
│ Tags: [emploi] [conseil]        │
│ [Lire la discussion]             │
├─────────────────────────────────┤
│ POST 2                          │
│ ...                             │
├─────────────────────────────────┤
│   [← Prev] [1] [2] [3] [Next →] │  ← Pagination
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Barre de recherche** (sticky top)
  - Input search
  - Filtre par catégorie (dropdown)
  - Tri (Recent | Popular | Comments)

- [ ] **Bouton créer post** (sticky ou fixed)
  - "Créer un nouveau post"
  - Redirection vers form

- [ ] **Card Post** (réutilisable)
  - Avatar auteur (petit)
  - Nom + prénom auteur
  - Date relative (il y a 2 jours)
  - Titre (h3)
  - Excerpt (150 chars)
  - Stats: vues + commentaires
  - Tags
  - Bouton "Lire la discussion"
  - Hover effect

- [ ] **Pagination**
  - Numéros pages
  - Prev/Next buttons
  - Info "Page X de Y"

- [ ] **Filtres (sidebar optionnel ou collapse mobile)**
  - Catégorie (General | Q&A | Témoignages | Sensibilisation)
  - Plage de dates
  - Auteur (filtrer par utilisateur)

#### Page Détail Post + Commentaires

```
┌─────────────────────────────────┐
│ POST DÉTAIL                     │
│ Titre: "Comment chercher emploi"│  ← H1
│ Auteur: Ahmed D.                │
│ Avatar | [Suivre] [Message]     │  ← Actions auteur
│ Créé: 12 mai 2026 | 128 vues    │
│ ─────────────────────────────── │
│ Contenu complet du post...      │  ← Markdown si applicable
│ [Édit] [Suppr] (si owner/mod)   │  ← Actions si owner
├─────────────────────────────────┤
│ COMMENTAIRES (5)                │
│ ─────────────────────────────── │
│ Commentaire 1                   │
│ Marie B. | 1 jour ago           │
│ "Excellent conseils!"           │
│ [Répondre] [Signaler]           │
│ ─────────────────────────────── │
│ Commentaire 2                   │
│ ...                             │
├─────────────────────────────────┤
│ FORM AJOUTER COMMENTAIRE        │
│ [Avatar]                        │
│ Votre commentaire:              │
│ [Textarea]                      │  ← Rich text editor optionnel
│ [Annuler] [Poster]              │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Header Post Détail**
  - Titre
  - Auteur (avatar + nom + bio courte)
  - Actions (Follow, Message privé si connecté)
  - Stats (date, vues)
  - Boutons d'action (Edit/Delete si owner)

- [ ] **Contenu Post**
  - Texte formaté (Markdown parser)
  - Images intégrées
  - Citations si applicable

- [ ] **Section Commentaires**
  - Liste commentaires (triés par date)
  - Chaque commentaire: avatar auteur, nom, date, texte
  - Actions: Répondre, Signaler
  - Pagination si > 10 commentaires

- [ ] **Form Ajouter Commentaire**
  - Textarea avec placeholder
  - Boutons Annuler/Poster
  - Validation (min 1 char)
  - Message "Connectez-vous pour commenter" si pas auth

- [ ] **Notifications**
  - Quand réponse à son post/commentaire
  - Toast ou notification badge

#### Page Créer/Éditer Post

```
┌─────────────────────────────────┐
│ CRÉER UN NOUVEAU POST           │
├─────────────────────────────────┤
│ Titre:                          │
│ [Input text]                    │
│ (Aide: Soyez clair et concis)   │
│                                 │
│ Catégorie:                      │
│ [Dropdown: General|Q&A|...]     │
│                                 │
│ Contenu:                        │
│ [Rich text editor]              │
│ B I U | Links | Images          │
│                                 │
│ Tags (optionnel):               │
│ [Input tags with autocomplete]  │
│                                 │
│ [ ] Publier immédiatement       │
│ [ ] Attendre modération         │ ← Si non-mod
│                                 │
│ [Annuler] [Brouillon] [Publier] │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Form Builder Post**
  - Input titre (max 300 chars, counter)
  - Select catégorie
  - Rich text editor (Markdown ou WYSIWYG)
  - Tag input (autocomplete tags existants)
  - Checkbox "Publier maintenant" vs "Brouillon"
  - Buttons Annuler/Brouillon/Publier

- [ ] **Validation**
  - Titre requis (min 10 chars)
  - Contenu requis (min 20 chars)
  - Alertes d'erreur en temps réel

---

### 3️⃣ PODCASTS

#### Page Lister Podcasts

```
┌─────────────────────────────────┐
│ HEADER + FILTRES                │
│ [Catégorie dropdown] [Tri]      │
├─────────────────────────────────┤
│ PODCAST CARD 1                  │
│ ┌─────┐                         │
│ │COVER│ Episode 5               │  ← Grid layout
│ │IMG  │ "L'accessibilité web"  │
│ └─────┘ 45 min | Éducatif      │
│ Description courte...           │
│ [Écouter] [Plus info]           │
├─────────────────────────────────┤
│ PODCAST CARD 2                  │
│ ...                             │
├─────────────────────────────────┤
│ [Pagination]                    │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Grid Podcasts** (3-4 colonnes, responsive)
  - Cover image
  - Titre
  - Description courte
  - Durée (min)
  - Catégorie (badge)
  - Auteur (optionnel)
  - Bouton "Écouter"

- [ ] **Filtres**
  - Par catégorie (Éducatif | Sensibilisation | Expert)
  - Tri (Recent | Popular)

- [ ] **Pagination**

#### Page Détail Podcast + Lecteur

```
┌─────────────────────────────────┐
│ PODCAST PLAYER                  │
│ ┌──────────────────────────┐    │
│ │ Cover image              │    │
│ │ "Episode 5"              │    │
│ └──────────────────────────┘    │
│ Titre: "L'accessibilité web"   │
│ Auteur: Dr Ahmed | 14 mai 2026 │
│ Description complète...         │
│                                 │
│ LECTEUR AUDIO:                  │
│ ┌──────────────────────────┐    │
│ │ [|<] [◄◄] [▶] [►►] [>|] │    │
│ │ 0:00 ─────●───── 45:30   │    │
│ │ Volume: ⟨=====○──────⟩   │    │
│ │ [Download] [Share] [...] │    │
│ └──────────────────────────┘    │
│                                 │
│ [Partager] [Ajouter favoris]    │
├─────────────────────────────────┤
│ PODCASTS SIMILAIRES             │
│ Card 1 | Card 2 | Card 3        │
├─────────────────────────────────┤
│ COMMENTAIRES (optionnel)        │
│ ...                             │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Audio Player intégré**
  - Cover image
  - Play/Pause
  - Skip back/forward (15s)
  - Progress bar scrubbing
  - Volume control
  - Speed control (0.75x, 1x, 1.25x, 1.5x)
  - Download button (optionnel)
  - Share button (social)

- [ ] **Métadonnées Podcast**
  - Titre (h1)
  - Auteur
  - Date de publication
  - Durée
  - Catégorie
  - Description longue (Markdown)

- [ ] **Actions**
  - Ajouter aux favoris
  - Partager (Facebook, Twitter, Email)
  - Signaler si contenu problématique

- [ ] **Podcasts Similaires**
  - 3 autres podcasts dans la même catégorie
  - Format cards

---

### 4️⃣ TÉMOIGNAGES & HISTOIRES

#### Page Lister Témoignages

```
┌─────────────────────────────────┐
│ [Search] [Filtres] [Soumettre] │
├─────────────────────────────────┤
│ CARD TEMOIGNAGE 1               │
│ ┌─────┐                         │
│ │PHOTO│ "Mon parcours..."      │  ← Photo + titre
│ │USER │ Auteur: Ahmed D.       │
│ └─────┘ Catégorie: Emploi      │
│ "Résumé de l'histoire..."       │
│ [Lire le témoignage complet]    │
├─────────────────────────────────┤
│ CARD TEMOIGNAGE 2               │
│ ...                             │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Grid Témoignages** (2-3 colonnes, responsive)
  - Photo profil auteur
  - Nom + prénom
  - Titre témoignage
  - Excerpt (150 chars)
  - Catégorie (badge)
  - Bouton "Lire"

- [ ] **Filtres**
  - Par catégorie (Handicap | Inclusion | Éducation | Emploi)

- [ ] **Bouton "Soumettre mon histoire"**
  - Redirection vers form

#### Page Détail Témoignage

```
┌─────────────────────────────────┐
│ HEADER TEMOIGNAGE               │
│ Titre: "Mon parcours vers..."   │
│ Auteur: Ahmed D.                │
│ Avatar | Date: 5 mai 2026       │
├─────────────────────────────────┤
│ PHOTO PRINCIPALE (optionnel)    │
│ ┌─────────────────────────────┐│
│ │ Image hero du témoignage    ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ CONTENU PRINCIPAL               │
│ "J'ai eu mon diplôme en 2021   │
│  mais c'était très difficile..." │
│                                 │
│ Paragraphes formattés...        │
│ Possibilité d'images intégrées  │
├─────────────────────────────────┤
│ [Partager] [Imprimer]           │
│ [< Précédent] [Suivant >]       │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Header Témoignage**
  - Titre (h1)
  - Photo auteur (avatar)
  - Nom auteur + lien profil
  - Date
  - Catégorie (badge)

- [ ] **Contenu**
  - Markdown parser
  - Possible images intégrées
  - Vidéo intégrée (optionnel)
  - Audio excerpt (optionnel)

- [ ] **Actions**
  - Partager (social)
  - Imprimer
  - Navigation: Précédent/Suivant

- [ ] **Related Testimonies**
  - 3-4 autres témoignages similaires

#### Page Soumettre Témoignage

```
┌─────────────────────────────────┐
│ SOUMETTRE MON HISTOIRE          │
├─────────────────────────────────┤
│ Titre:                          │
│ [Input]                         │
│                                 │
│ Catégorie:                      │
│ [Dropdown]                      │
│                                 │
│ Récit (texte):                  │
│ [Textarea / Rich text editor]   │
│                                 │
│ Photo (optionnel):              │
│ [Upload image - max 5MB]        │
│ [Preview]                       │
│                                 │
│ Vidéo (optionnel):              │
│ [Upload ou URL YouTube/Vimeo]   │
│                                 │
│ Audio (optionnel):              │
│ [Upload fichier audio]          │
│                                 │
│ [ ] J'accepte la modération    │
│ [ ] Publier mon témoignage     │
│                                 │
│ [Annuler] [Soumettre]           │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Form Témoignage**
  - Input titre
  - Select catégorie
  - Textarea/WYSIWYG contenu
  - Upload photo
  - Upload vidéo (ou URL embed)
  - Upload audio (ou URL)
  - Checkbox acceptation modération
  - Buttons Annuler/Soumettre

- [ ] **Validation**
  - Titre requis
  - Contenu requis (min 100 chars)
  - Image: format jpg/png, max 5MB
  - Vidéo: format mp4/webm, max 100MB

---

### 5️⃣ EMPLOIS & RECRUTEMENT

#### Page Lister Offres d'Emploi

```
┌─────────────────────────────────┐
│ [Search] [Filtres] [Publier]   │
│                                 │
│ FILTRES (sidebar):              │
│ Type contrat:                   │
│ ☑ CDI ☑ CDD ☑ Stage ☑ Bénév. │
│                                 │
│ Lieu:                           │
│ [Search input avec autocomplete]│
│                                 │
│ Salaire:                        │
│ [Slider: 0 - 5000000]           │
│                                 │
│ [Réinitialiser filtres]         │
├─────────────────────────────────┤
│ JOB CARD 1                      │
│ Développeur Full-Stack          │  ← Titre
│ TechStartup Dakar | CDI         │
│ "Nous cherchons..."             │  ← Description courte
│ 📍 Dakar | 💰 2-3M FCFA         │  ← Lieu + Salaire
│ Expire le: 30 juin              │
│ [Postuler] [Partager] [+]       │
├─────────────────────────────────┤
│ JOB CARD 2                      │
│ ...                             │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Sidebar Filtres**
  - Checkboxes type contrat
  - Input location (autocomplete)
  - Slider salaire (optionnel)
  - Bouton "Réinitialiser"
  - Collapse/Expand sur mobile

- [ ] **Search Bar** (top)
  - Input search
  - Autocomplete suggestions

- [ ] **Job Card** (réutilisable)
  - Logo entreprise (optionnel)
  - Titre poste
  - Nom entreprise
  - Type contrat (badge)
  - Lieu (géolocalisation optionnel)
  - Salaire (si renseigné)
  - Excerpt description
  - Date expiration
  - Buttons: Postuler, Partager, Ajouter favoris

- [ ] **Pagination**

#### Page Détail Offre d'Emploi

```
┌─────────────────────────────────┐
│ JOB HEADER                      │
│ Titre: Développeur Full-Stack   │
│ Entreprise: TechStartup Dakar   │
│ Logo | CDI | Dakar              │
│                                 │
│ [Postuler] [Partager] [Favoris] │
├─────────────────────────────────┤
│ INFOS RAPIDES                   │
│ 💰 2-3M FCFA | ⏰ CDI           │
│ 📍 Dakar, Sénégal               │
│ ⏱️ Expire le 30 juin 2026       │
│ 👥 5 candidats                  │
├─────────────────────────────────┤
│ DESCRIPTION COMPLÈTE            │
│ Responsabilités:                │
│ - Développer features...        │
│ - Mentorer juniors...           │
│                                 │
│ Requis:                         │
│ - 3+ ans expérience             │
│ - React/Node.js                 │
│                                 │
│ Nice to have:                   │
│ - TypeScript                    │
│                                 │
│ Avantages:                      │
│ - Télétravail possible          │
│ - Formation continue            │
├─────────────────────────────────┤
│ CONTACT ENTREPRISE              │
│ Contact: Marie B.               │
│ Email: recrutement@tech.sn      │
│ Téléphone: +221 77...           │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Header Offre**
  - Logo + nom entreprise
  - Titre poste (h1)
  - Type contrat, lieu, salaire
  - Date publication/expiration
  - Nb candidats (optionnel)
  - Buttons: Postuler, Partager, Favoris

- [ ] **Infos Rapides** (section aside)
  - Tout les meta infos en cards
  - Icons + données

- [ ] **Description**
  - Responsabilités (liste)
  - Profil recherché
  - Requis
  - Nice to have
  - Avantages
  - Markdown possible

- [ ] **Contact**
  - Personne de contact (nom)
  - Email
  - Téléphone
  - Lien "Voir autres offres de cette entreprise"

- [ ] **Call-to-action**
  - Bouton "Postuler" prominent

#### Page Postuler à une Offre

```
┌─────────────────────────────────┐
│ CANDIDATURE: Développeur...     │
├─────────────────────────────────┤
│ PROFIL:                         │
│ Prénom: Ahmed                   │  ← Pré-rempli depuis profil
│ Nom: Diallo                     │
│ Email: ahmed@example.com        │
│ Téléphone: +221 77...           │
├─────────────────────────────────┤
│ CV (requis):                    │
│ [Upload fichier] ou [Depuis CV] │  ← Upload ou sélectionner CV existant
│ Preview: resume.pdf             │
│ [Remplacer]                     │
├─────────────────────────────────┤
│ LETTRE DE MOTIVATION (opt):     │
│ [Textarea ou Upload]            │
│                                 │
│ QUESTIONNAIRE OPTIONNEL:        │
│ Q1: "Pourquoi cette offre?"     │
│ [Textarea - 500 chars max]      │
│                                 │
│ Q2: "Votre plus grande réussite?│
│ [Textarea - 500 chars max]      │
│                                 │
│ [ ] Je comprends les conditions │
│                                 │
│ [Annuler] [Envoyer candidature] │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Form Candidature**
  - Infos pré-remplies (depuis profil)
  - Upload CV (drag & drop)
  - Option "Utiliser mon CV existant" (historique)
  - Textarea lettre de motivation (optionnel)
  - Questions dynamiques (si définies par recruteur)
  - Checkboxes confirmations
  - Buttons Annuler/Envoyer

- [ ] **Validation**
  - CV requis (PDF, DOC, DOCX)
  - Max 10MB
  - Email requis
  - Téléphone requis

- [ ] **Success Message**
  - "Candidature envoyée avec succès!"
  - "L'employeur vous contactera sous peu"
  - Lien "Voir mes candidatures"

#### Page Mes Candidatures

```
┌─────────────────────────────────┐
│ MES CANDIDATURES (8)            │
│ [Filtres: En attente|Accepté...│
├─────────────────────────────────┤
│ CARD CANDIDATURE 1              │
│ Développeur Full-Stack          │  ← Titre poste
│ TechStartup Dakar               │  ← Entreprise
│ Statut: ✅ Acceptée (2 jun)    │  ← Status badge
│ Postuler le: 15 mai             │
│ [Détails] [Répondre]            │
├─────────────────────────────────┤
│ CARD CANDIDATURE 2              │
│ Commercial                      │
│ ABC Corp                        │
│ Statut: ⏳ En attente (5 j)    │
│ Postuler le: 9 mai              │
│ [Détails] [Retirer candidature] │
├─────────────────────────────────┤
│ CARD CANDIDATURE 3              │
│ ...                             │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Filtres**
  - Status: En attente | Acceptée | Refusée
  - Tri: Récent | Status

- [ ] **Candidature Card**
  - Titre offre
  - Entreprise
  - Status badge (with colors)
  - Date candidature
  - Actions: Détails, Retirer candidature

- [ ] **Détails Modal**
  - Affiche details candidature
  - CV fourni
  - Lettre motivation (si fournie)
  - Réponses aux questions (si applicable)
  - Boutons d'action

---

### 6️⃣ RESSOURCES ÉDUCATIVES (ARTICLES)

#### Page Lister Articles

```
┌─────────────────────────────────┐
│ [Search] [Filtres] [Contribuer] │
│                                 │
│ FILTRES:                        │
│ [Tous] [Éducatif] [Sensibiliz..│
│ [Guides] [Ressources]           │
├─────────────────────────────────┤
│ ARTICLE CARD 1                  │
│ ┌─────────────────────────────┐│
│ │ Thumbnail                   ││
│ │ "L'accessibilité numérique" ││  ← Titre
│ │ Écrit par: Ahmed D.         ││
│ │ 12 mai 2026                 ││
│ │ "Comprendre les bonnes...   ││  ← Excerpt
│ │ Lire l'article ›            ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ ARTICLE CARD 2                  │
│ ...                             │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Filtres par catégorie**
  - Éducatif | Sensibilisation | Guides

- [ ] **Article Card** (réutilisable)
  - Image featured (ou placeholder)
  - Titre (h3)
  - Auteur
  - Date
  - Catégorie (badge)
  - Excerpt (150 chars)
  - Button "Lire l'article"
  - Temps de lecture estimé

- [ ] **Pagination**

#### Page Détail Article

```
┌─────────────────────────────────┐
│ ARTICLE HEADER                  │
│ Catégorie: [Éducatif]           │
│ Titre: "L'accessibilité..."     │
│ Auteur: Ahmed D.                │
│ Date: 12 mai 2026               │
│ Temps lecture: ~8 min           │
├─────────────────────────────────┤
│ FEATURED IMAGE                  │
│ ┌─────────────────────────────┐│
│ │ Image large (1200px)        ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ CONTENU ARTICLE                 │
│ Paragraphes avec markdown...    │
│ Possibilité images intégrées    │
│ Possibilité blocs citation      │
│ Possibilité listes              │
│                                 │
│ Sous-titres (h2, h3)            │
│                                 │
│ Vidéo intégrée (optionnel)      │
│ ┌─────────────────────────────┐│
│ │ Iframe YouTube/Vimeo        ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ [Imprimer] [Partager]           │
│ [< Précédent] [Suivant >]       │
│ Articles similaires:            │
│ - Article 1                     │
│ - Article 2                     │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Header**
  - Titre (h1)
  - Auteur + avatar
  - Date
  - Catégorie
  - Temps de lecture estimé

- [ ] **Featured Image**
  - Full-width responsive

- [ ] **Contenu**
  - Markdown rich text
  - Images intégrées
  - Vidéos YouTube/Vimeo
  - Blockquotes formatées
  - Listes (ordered/unordered)
  - Code blocks (avec syntax highlighting optionnel)

- [ ] **Sidebar (optionnel)**
  - Table of contents (générée automatiquement des h2/h3)
  - "Partagé X fois"

- [ ] **Actions**
  - Imprimer
  - Partager (social)
  - Ajouter favoris

- [ ] **Articles Similaires**
  - 3-4 articles même catégorie

---

### 7️⃣ EXPERTS & ANNUAIRE

#### Page Lister Experts

```
┌─────────────────────────────────┐
│ [Search] [Filtres]              │
│                                 │
│ FILTRES:                        │
│ Spécialité: [Dropdown]          │
│ Ville: [Input autocomplete]     │
│ [Réinitialiser]                 │
├─────────────────────────────────┤
│ EXPERT CARD 1                   │
│ ┌────┐ "Dr Youssou Tall"        │
│ │IMG │ Droit du handicap        │  ← Photo + titre + spécialité
│ │    │ ASAPSU                   │
│ └────┘ Dakar                    │
│ "Une courte bio..."             │
│ 📧 youssou@... | 📱 +221...     │
│ [Voir profil]                   │
├─────────────────────────────────┤
│ EXPERT CARD 2                   │
│ ...                             │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Filtres**
  - Select spécialité (autocomplete)
  - Input ville (autocomplete)

- [ ] **Expert Card** (réutilisable)
  - Photo profil (large)
  - Nom + prénom
  - Spécialité
  - Organisation
  - Ville
  - Bio courte (2 lignes)
  - Contact (email + téléphone si public)
  - Button "Voir profil"

- [ ] **Pagination/Grid**
  - 3 colonnes responsive

#### Page Détail Expert

```
┌─────────────────────────────────┐
│ EXPERT PROFILE HEADER           │
│ ┌────┐ "Dr Youssou Tall"        │
│ │IMG │ Droit du handicap        │
│ │    │ ASAPSU                   │
│ └────┘ Dakar, Sénégal           │
│                                 │
│ Bio complète...                 │
│                                 │
│ [📧 Envoyer message] [☎️ Appel] │
├─────────────────────────────────┤
│ INFOS CONTACT                   │
│ Email: youssou@asapsu.sn        │
│ Téléphone: +221 77 123 45 67    │
│ Site web: www.asapsu.sn         │
│ LinkedIn: /in/youssou           │
├─────────────────────────────────┤
│ ARTICLES PAR CET EXPERT         │
│ - Article 1                     │
│ - Article 2                     │
├─────────────────────────────────┤
│ EXPERTS SIMILAIRES              │
│ Card | Card | Card              │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Profile Header**
  - Photo grande
  - Nom + titre
  - Spécialité
  - Organisation
  - Localisation
  - Bio complète (Markdown)
  - Boutons contact (email, phone)

- [ ] **Contact Info**
  - Email
  - Téléphone
  - Site web (lien)
  - LinkedIn (lien)
  - Twitter (lien optionnel)

- [ ] **Articles/Publications**
  - Liste articles écrits par cet expert
  - Lien vers chaque article

- [ ] **Experts Similaires**
  - 3-4 autres experts même spécialité

---

### 8️⃣ GALERIE MULTIMÉDIA

#### Page Lister Galeries

```
┌─────────────────────────────────┐
│ [Filtres] [Créer album]         │
│                                 │
│ FILTRES:                        │
│ Thème: [Tous|Événement|Article.]│
│                                 │
├─────────────────────────────────┤
│ GALERIE CARD 1                  │
│ ┌──────────────────────────┐    │
│ │ Collage (4 images)       │    │
│ │ "Photos Conférence 2026" │    │
│ │ 24 images | Événement    │    │
│ │ [Ouvrir galerie]         │    │
│ └──────────────────────────┘    │
├─────────────────────────────────┤
│ GALERIE CARD 2 - VIDÉOS         │
│ ┌──────────────────────────┐    │
│ │ Video preview            │    │
│ │ "Interviews exclusives"  │    │
│ │ 5 vidéos | Article       │    │
│ │ [Ouvrir galerie]         │    │
│ └──────────────────────────┘    │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Gallery Card** (réutilisable)
  - Collage des premières images (4 thumb)
  - Titre galerie
  - Nb items
  - Thème
  - Button "Ouvrir"

- [ ] **Filtres**
  - Par thème (Événement | Article | Podcast | Témoignage)

#### Page Galerie Détail + Lightbox

```
┌─────────────────────────────────┐
│ GALERIE: Photos Conférence 2026 │
│ 24 images | Créée le 5 mai      │
├─────────────────────────────────┤
│ GRID IMAGES (thumbnail):        │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│                                 │
│ [Load more] ou [Pagination]     │
│                                 │
│ LIGHTBOX MODAL (on click):      │
│ ┌─────────────────────────────┐│
│ │ [<] [Image actuelle] [>]    ││
│ │ ┌─────────────────────────┐││
│ │ │                         │││
│ │ │   IMAGE GRANDE          │││
│ │ │   (avec scale & pan)    │││
│ │ │                         │││
│ │ └─────────────────────────┘││
│ │ Description: "..."          ││
│ │ [Close] [Download]          ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Grid Thumbnails**
  - Responsive grid (2-4 colonnes)
  - Images carrées (aspect ratio 1:1)
  - Hover effect (zoom, play icon si vidéo)

- [ ] **Lightbox/Modal**
  - Image en grand
  - Navigation précédent/suivant
  - Zoom + pan optionnel
  - Download button
  - Description (si disponible)
  - Close button

- [ ] **Vidéos**
  - Thumbnails avec play icon
  - Embedded player (YouTube/Vimeo)

---

### 9️⃣ PROFIL UTILISATEUR

#### Page Mon Profil

```
┌─────────────────────────────────┐
│ HEADER PROFIL                   │
│ ┌────┐ "Ahmed Diallo"          │  ← Avatar + nom
│ │IMG │ @ahmed_d                 │  ← Username
│ │    │ Malvoyant                │  ← Type handicap
│ └────┘ Membre depuis 12 mai     │
│                                 │
│ "Développeur web passionné..."  │  ← Bio
│                                 │
│ [Éditer profil] [Paramètres]    │  ← Buttons
├─────────────────────────────────┤
│ STATS                           │
│ 5 posts | 2 témoignages | 1 job │
├─────────────────────────────────┤
│ MES POSTS RÉCENTS               │
│ Post 1 (preview)                │
│ Post 2 (preview)                │
│ [Voir tous mes posts]           │
├─────────────────────────────────┤
│ MES TÉMOIGNAGES                 │
│ Tém 1 (preview)                 │
│ [Voir tous]                     │
├─────────────────────────────────┤
│ MES CANDIDATURES RÉCENTES       │
│ Job 1 - Statut: En attente      │
│ Job 2 - Statut: Acceptée        │
│ [Voir toutes les candidatures]  │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Profile Header**
  - Grande photo profil (avatar)
  - Nom + prénom
  - Username
  - Type handicap (optionnel)
  - Date inscription
  - Bio (Markdown)
  - Buttons: Éditer profil, Paramètres

- [ ] **Stats Section**
  - Badges: X posts | X témoignages | X candidatures

- [ ] **Recent Activity Feed**
  - Derniers posts
  - Derniers témoignages
  - Dernières candidatures
  - Avec preview cards

- [ ] **Navigation Profil (onglets/sidebar)**
  - À propos
  - Mes posts
  - Mes témoignages
  - Mes candidatures
  - Mes favoris

#### Page Éditer Profil

```
┌─────────────────────────────────┐
│ ÉDITER MON PROFIL               │
├─────────────────────────────────┤
│ PHOTO PROFIL:                   │
│ ┌────┐                          │
│ │IMG │ [Changer] [Supprimer]   │
│ └────┘                          │
│                                 │
│ Prénom:                         │
│ [Input] "Ahmed"                 │
│                                 │
│ Nom:                            │
│ [Input] "Diallo"                │
│                                 │
│ Bio:                            │
│ [Textarea] "Dévéloppeur web..." │
│                                 │
│ Type de handicap:               │
│ [Input] "Malvoyant"             │
│                                 │
│ Localisation (optionnel):       │
│ [Input] "Dakar, Sénégal"        │
│                                 │
│ Email:                          │
│ [Display only] ahmed@example.com│
│ [Changer email]                 │
│                                 │
│ [ ] Profil public              │
│ [ ] Afficher mon email         │
│                                 │
│ [Annuler] [Sauvegarder]         │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Edit Form**
  - Input prénom
  - Input nom
  - Textarea bio
  - Input type handicap
  - Input localisation
  - Upload photo profil (drag & drop)
  - Email display (read-only + button changer)
  - Checkboxes visibilité

- [ ] **Change Email Form** (modal)
  - Input nouvel email
  - Verification (code envoyé)
  - Confirmation

- [ ] **Avatar Upload**
  - Drag & drop zone
  - File picker
  - Image crop tool (optionnel)
  - Preview

#### Page Paramètres

```
┌─────────────────────────────────┐
│ PARAMÈTRES DE MON COMPTE        │
├─────────────────────────────────┤
│ NOTIFICATIONS                   │
│ [ ] Email: Réponse à mes posts │
│ [ ] Email: Nouvelles offres    │
│ [ ] Email: Messages experts    │
│ [ ] Notif navigateur           │
│                                 │
│ CONFIDENTIALITÉ                 │
│ [ ] Mon profil est public      │
│ [ ] Afficher mon email         │
│ [ ] Afficher mon téléphone (?)  │
│ [ ] Permettre messages privés  │
│                                 │
│ DONNÉES & SÉCURITÉ              │
│ [Changer mot de passe]          │
│ [Télécharger mes données]       │
│ [Supprimer mon compte]          │
│                                 │
│ [Sauvegarder]                   │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Notification Preferences**
  - Checkboxes pour chaque type de notification
  - Email vs navigateur

- [ ] **Privacy Settings**
  - Visibility profile (public/private)
  - Affichage info contact
  - Allow messages

- [ ] **Security**
  - Change password button
  - Download data link
  - Delete account button (avec modal confirmation)

---

### 🔟 PAGES STATIQUES

#### À Propos

```
┌─────────────────────────────────┐
│ À PROPOS DE NOUS                │
│                                 │
│ SECTION 1: MISSION              │
│ Notre mission: "Créer une       │
│ plateforme inclusive..."        │
│                                 │
│ SECTION 2: VALEURS              │
│ Card 1: Inclusion               │
│ Card 2: Transparence            │
│ Card 3: Accessibilité           │
│                                 │
│ SECTION 3: ÉQUIPE               │
│ "Rencontrez l'équipe"           │
│ Photo + Nom + Rôle (cards)      │
│                                 │
│ SECTION 4: PARTENAIRES          │
│ Logos partenaires               │
│                                 │
│ SECTION 5: TIMELINE             │
│ Notre histoire (2024, 2025...)  │
│                                 │
│ SECTION 6: IMPACT               │
│ Statistiques: X utilisateurs    │
│ X posts, X témoignages          │
└─────────────────────────────────┘
```

**Sections:**

- [ ] Hero section
- [ ] Mission & Vision
- [ ] Valeurs (cards)
- [ ] Team (photos + descriptions)
- [ ] Partenaires (logos)
- [ ] Impact/Statistiques
- [ ] Timeline historique
- [ ] Call-to-action "Nous rejoindre"

#### Contact

```
┌─────────────────────────────────┐
│ NOUS CONTACTER                  │
│                                 │
│ CONTACT FORM (gauche)           │
│ Nom:                            │
│ [Input]                         │
│                                 │
│ Email:                          │
│ [Input]                         │
│                                 │
│ Sujet:                          │
│ [Dropdown]                      │
│                                 │
│ Message:                        │
│ [Textarea]                      │
│                                 │
│ [Envoyer]                       │
│                                 │
│ INFOS CONTACT (droite)          │
│ 📧 contact@inclusion-senegal.sn│
│ 📱 +221 77 XXX XX XX             │
│ 📍 Dakar, Sénégal               │
│ 🕐 Lundi-Vendredi: 9h-17h      │
│                                 │
│ RÉSEAUX SOCIAUX                 │
│ Facebook | Twitter | LinkedIn   │
└─────────────────────────────────┘
```

**Composants:**

- [ ] **Contact Form**
  - Input name
  - Input email
  - Select sujet (contact | support | partnership | other)
  - Textarea message
  - reCAPTCHA (optionnel)
  - Submit button

- [ ] **Contact Info Sidebar**
  - Email
  - Téléphone
  - Adresse
  - Heures d'ouverture

- [ ] **Embed Map** (optionnel)
  - Google Maps

- [ ] **Social Links**

---

## 🧩 Composants réutilisables

### Composants Core

```typescript
// Navigation/Layout
├─ Header (avec logo, menu, auth buttons)
├─ Footer (links, social, newsletter)
├─ Sidebar (navigation secondaire)
├─ Breadcrumbs (navigation info)
└─ Pagination (numéros pages)

// Buttons & Forms
├─ Button (variant: primary|secondary|danger)
├─ Input (text, email, password, number)
├─ Select/Dropdown
├─ Textarea (avec counter optionnel)
├─ FileUpload (drag & drop)
├─ Checkbox & Radio
├─ ToggleSwitch
├─ DatePicker
└─ SearchBar (avec autocomplete)

// Cards & Grids
├─ Card (wrapper générique)
├─ PostCard (réutilisable forum, home)
├─ JobCard (offres emploi)
├─ ArticleCard
├─ ExpertCard
├─ PodcastCard
├─ TestimonyCard
├─ GalleryCard
└─ AnnounceCard

// Media
├─ AudioPlayer (lecteur podcast)
├─ VideoPlayer (lecteur vidéo)
├─ ImageGallery + Lightbox
├─ AvatarUploader
└─ Carousel/Slider

// Alerts & Feedback
├─ Toast (notifications)
├─ Modal/Dialog
├─ Alert (info, warning, error)
├─ Loading Spinner
├─ Empty State
└─ Error Boundary

// Rich Text & Content
├─ MarkdownEditor
├─ MarkdownViewer
├─ RichTextEditor (WYSIWYG optionnel)
├─ CodeBlock
├─ Blockquote
└─ Table

// User/Profile
├─ Avatar (small, medium, large)
├─ UserBadge (nom + avatar petit)
├─ ProfileHeader
├─ UserMenu (dropdown profil)
└─ FollowButton

// Filtering & Search
├─ FilterBar
├─ TagSelector
├─ DateRangeFilter
├─ SortSelector
└─ ClearFiltersButton

// Lists & Tables
├─ List (simple)
├─ DataTable (avec sorting, pagination)
├─ InfiniteScroll
└─ VirtualList (pour grandes listes)
```

### Page Layout Templates

```typescript
// Layouts réutilisables
├─ DefaultLayout (header + footer + sidebar)
├─ CenterLayout (centré, pas de sidebar)
├─ AuthLayout (login/register - minimal)
├─ AdminLayout (avec admin sidebar)
└─ ProfileLayout (avec profile tabs)
```

---

## 🔄 Fonctionnalités Transversales

### Système d'Authentification & Autorisation

- [ ] **Login/Register**
  - Pages et formulaires
  - Session management (JWT tokens en localStorage)
  - Remember me (optionnel)
  - Forgot password flow

- [ ] **Protected Routes**
  - Redirect si pas connecté
  - Redirect si pas authorization (role-based)
  - Loading states pendant auth check

- [ ] **User Context/Store**
  - État utilisateur global (Redux, Zustand, Context)
  - Current user data
  - Auth tokens (access + refresh)
  - User permissions

### Système de Notifications

- [ ] **Toast Notifications**
  - Success, error, warning, info
  - Auto-dismiss
  - Position (top-right, bottom-center, etc)
  - Queue gestion (max 3 toasts)

- [ ] **Modal/Alerts**
  - Confirmations (delete, logout)
  - Informations importantes
  - Loading modals

- [ ] **Email Notifications** (backend-driven)
  - New post reply
  - New job offer
  - Application response
  - Admin alerts

### Système de Recherche Avancée

- [ ] **Global Search**
  - Autocomplete sur champ search
  - Suggère posts, jobs, articles, experts
  - Redirect vers page détail

- [ ] **Filtres Avancés**
  - Multi-select catégories
  - Date range sliders
  - Keyword tagging
  - Applied filters display + clear option

- [ ] **Pagination vs Infinite Scroll**
  - Pagination pour listes principales
  - Infinite scroll optionnel pour feeds

### SEO & Meta Tags

- [ ] **Dynamic Meta Tags**
  - Title, Description, Keywords
  - Open Graph tags (social sharing)
  - Twitter card tags
  - Canonical URLs

- [ ] **Sitemap Generation**
  - Dynamique (pages principales)

- [ ] **Robots.txt**
  - Indexing rules

### Accessibilité (WCAG 2.1 AA)

- [ ] **Keyboard Navigation**
  - Tab order logique
  - Focus visible
  - Escape pour modales/menus

- [ ] **Screen Reader Support**
  - ARIA labels
  - ARIA live regions (pour updates dynamiques)
  - Form labels + descriptions
  - Skip to main content link

- [ ] **Color & Contrast**
  - Contraste min 4.5:1 (texte)
  - Pas dépendant couleur uniquement
  - Dark mode optionnel

- [ ] **Responsive & Zoom**
  - Mobile-first design
  - Support zoom jusqu'à 200%
  - Touch-friendly buttons (min 44x44px)

### Performance

- [ ] **Code Splitting**
  - Routes lazy-loaded
  - Components lazy-loaded
  - Heavy libraries deferred

- [ ] **Image Optimization**
  - WebP avec fallback
  - Responsive images (srcset)
  - Lazy loading images below fold
  - Image compression

- [ ] **Caching**
  - HTTP caching headers
  - Service Worker (optionnel, PWA)
  - Local storage pour user data

- [ ] **Monitoring**
  - Error tracking (Sentry optionnel)
  - Performance monitoring (Core Web Vitals)
  - Analytics (Google Analytics optionnel)

### Internationalisation (i18n) - Français seulement pour maintenant

- [ ] **Textes traduits**
  - Tous les strings en fichiers i18n
  - Easy to add autres langues later

- [ ] **Dates & Nombres**
  - Format locale (FR: 14 mai 2026)

---

## 🎨 Design System

### Colors

```css
/* Primary */
--primary: #2563EB (bleu)
--primary-dark: #1E40AF
--primary-light: #DBEAFE

/* Secondary */
--secondary: #7C3AED (violet)
--success: #10B981 (vert)
--warning: #F59E0B (orange)
--error: #EF4444 (rouge)

/* Neutral */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-500: #6B7280
--gray-900: #111827

/* Accessibility */
--disabled: #D1D5DB
--focus: #2563EB (80% opacity)
```

### Typography

```css
/* Headings */
h1: 36px | 1.2 line-height | 700 weight
h2: 28px | 1.3 line-height | 700 weight
h3: 24px | 1.4 line-height | 600 weight

/* Body */
body: 16px | 1.6 line-height | 400 weight
small: 14px | 1.5 line-height | 400 weight

/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Spacing Scale

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

### Breakpoints

```css
mobile: 320px
tablet: 768px
desktop: 1024px
wide: 1280px
```

---

## 🔐 Flux Utilisateur Complets

### Flux 1: Inscription → Connexion → Forum

1. Visiteur arrive sur Home
2. Clique "Racontez votre histoire" → Redirect login
3. Clique "S'inscrire" (pas de compte)
4. Remplir form (nom, prenom, email, password)
5. Submit → POST /api/auth/register
6. Success → Tokens stockés, redirect Home
7. Home affiché avec user connecté (dropdown profil)
8. Clique "Forum" → Lister posts
9. Lire post → Détail
10. Ajouter commentaire → Formulaire
11. Submit → POST /api/posts/{id}/commentaires
12. Success → Toast, commentaire affiché

### Flux 2: Chercher & Postuler Emploi

1. Utilisateur connecté
2. Navigate "Emplois"
3. Lister offres → GET /api/jobs
4. Filtre par type_contrat, lieu → affine résultats
5. Click offre → Page détail
6. Click "Postuler" → Modal/Page form
7. Select/Upload CV
8. Remplir lettre motivation (opt)
9. Submit → POST /api/jobs/{id}/candidatures
10. Success → Redirect "Mes candidatures"
11. Voir candidature en attente

### Flux 3: Publier Témoignage

1. Utilisateur connecté (profil complet)
2. Navigate "Témoignages"
3. Click "Soumettre mon histoire"
4. Remplir form (titre, contenu, photo, vidéo, audio)
5. Submit → POST /api/temoignages
6. Message "Merci! Votre témoignage est en attente de modération"
7. Redirect "Mes témoignages" → Voir en statut "En attente"
8. Plus tard: Modérateur approuve → Email notification

### Flux 4: Read Forum Post

1. Utilisateur non-connecté arrive Home
2. Scroll → Voit "Posts récents"
3. Click post → Page détail
4. Voit commentaires
5. Try ajouter commentaire → Message "Connectez-vous"
6. Clique login → Remplit credentials
7. Redirect back post détail
8. Ajoute commentaire → Success

---

## 📊 Wireframe Structure (Texto)

### Mobile (320px)

```
[≡] LOGO [👤]                           ← Header sticky
─────────────────────────────────────

HERO
[Image/Video full-width]
Title + CTA buttons (stacked)

─────────────────────────────────────

FEATURED PODCAST
[🎙️] [Cover] Title
"Écouter" button

─────────────────────────────────────

RECENT POSTS
[Post 1 card]
[Post 2 card]
[Voir tous >]

─────────────────────────────────────

ANNOUNCEMENTS
[Announce 1]
[Announce 2]

─────────────────────────────────────

EXPERTS
[Expert 1]
[Expert 2]

─────────────────────────────────────

CTAs (full-width buttons)

─────────────────────────────────────

FOOTER (collapsed)
[Links] [Social]
```

### Desktop (1024px+)

```
[LOGO] [MENU...] [Search] [Auth]       ← Header
─────────────────────────────────────

HERO (full-width)
Image/Video left | Text + CTAs right

─────────────────────────────────────

[Featured Podcast]     [Recent Posts]  [Stats]
[Large card]           [Stack 3]       [3 numbers]

─────────────────────────────────────

EXPERTS CAROUSEL (full-width)
[Exp 1] [Exp 2] [Exp 3] [Exp 4] →

─────────────────────────────────────

CTAs (3 columns)

─────────────────────────────────────

[FOOTER - 4 columns]
```

---

## ✅ Checklist Implémentation

### Phase 1: Foundation
- [ ] Setup projet Next.js (TypeScript)
- [ ] Layout principal (Header, Footer, Sidebar)
- [ ] Navigation (React Router setup)
- [ ] Styling setup (Tailwind CSS)
- [ ] Component library initialization

### Phase 2: Auth & Core Pages
- [ ] Auth pages (Login, Register)
- [ ] Auth flow (JWT tokens, protected routes)
- [ ] Home page
- [ ] Navigation principale
- [ ] Profil utilisateur

### Phase 3: Content Pages (Read-only)
- [ ] Forum (lister + détail posts)
- [ ] Podcasts (lister + player)
- [ ] Témoignages (lister + détail)
- [ ] Emplois (lister + détail)
- [ ] Experts (lister + détail)
- [ ] Articles (lister + détail)
- [ ] Galeries (lister + lightbox)

### Phase 4: Interactive Features
- [ ] Créer posts
- [ ] Commenter posts
- [ ] Postuler emplois
- [ ] Soumettre témoignage
- [ ] Éditer profil

### Phase 5: Polish
- [ ] Responsivité complète
- [ ] Accessibilité (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Testing (unit + integration)
- [ ] Error handling & edge cases

---

**Documents disponibles:**
- `SCHEMA_API_COMPLET.md` - Backend API details
- `FEUILLE_DE_ROUTE_BACKEND.md` - Backend timeline
- `FRONTEND_READY.md` - Quick start guide pour devs

