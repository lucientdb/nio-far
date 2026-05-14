# 🗺️ Plan de Site vs Backend - Alignement & Gaps

**Date:** 14 mai 2026  
**Client:** Hub interactif et inclusif  
**Équipe:** Backend + Frontend

---

## 📊 Matrice d'alignement Site / Backend

### ✅ Sections COUVERTES par le Backend

| Section du Site | Modèle/Endpoint Backend | État | Notes |
|---|---|---|---|
| **Forum de discussion** | `POST` / `Commentaire` | ✅ Complet | Général + Témoignages intégrés |
| **Podcasts** | `Podcast` | ✅ Complet | Audio + Vidéo supportés |
| **Témoignages** | `Temoignage` | ✅ Complet | Texte + photo |
| **Recrutement/Emplois** | `Job` | ✅ Complet | Offres d'emploi + annonces |
| **Experts** | `Expert` | ✅ Complet | Profils + spécialités |
| **Commentaires/Avis** | `Commentaire` (sur posts) | ✅ Partiel | Commentaires sur posts existants |

### ⚠️ Sections à DÉVELOPPER

| Section du Site | Besoin | Solution proposée | Priorité |
|---|---|---|---|
| **Page d'accueil** | Contenu mixte (featured) | Endpoint `/api/home` qui aggregate les derniers items | 🟡 MOYENNE |
| **Contenu éducatif** | Articles/Guides/Ressources | Nouveau modèle `Article` | 🔴 HAUTE |
| **Galerie multimédia** | Albums images/vidéos | Nouveau modèle `Galerie` | 🟡 MOYENNE |
| **Avis & feedback** | Ratings/Reviews | Nouveau modèle `Review` (distinct des commentaires) | 🟢 BASSE |
| **Notifications** | Email alerts | Système de notifications | 🔴 HAUTE |

---

## 📋 Plan détaillé par section

### 1️⃣ PAGE D'ACCUEIL

**Plan client:**
```
- Hero/Banner
- Podcast du jour (featured)
- Histoires/Témoignages récents
- Annonces et actualités
- CTAs (Call To Action)
```

**Backend requis:** ✅ Partiellement couvert

**Endpoint à créer:**
```
GET /api/home/feed
{
  "hero": {
    "title": "Bienvenue",
    "subtitle": "Plateforme inclusive",
    "image_url": "..."
  },
  "featured_podcast": {
    // Dernier podcast publié
  },
  "recent_testimonies": [
    // 3-5 derniers témoignages publiés
  ],
  "announcements": [
    // Annonces/actualités (à créer)
  ],
  "featured_experts": [
    // 3-4 experts en vedette
  ]
}
```

**À faire:**
- [ ] Créer modèle `Annonce` (news/events)
- [ ] Endpoint `/api/home/feed` qui aggregate tout
- [ ] Ajouter champs `is_featured` aux modèles (podcast, testimonies, experts, jobs)

---

### 2️⃣ FORUM DE DISCUSSION

**Plan client:**
```
- Général : discussions libres
- Témoignages : partager expériences
- Questions/Réponses : avec experts
- Sensibilisation : discussions éducatives
- Recherche avancée
- Modération
```

**Backend:** ✅ COUVERT

**Endpoints existants:**
- `GET /api/posts` - Lister tous les posts
- `POST /api/posts` - Créer post
- `PUT/DELETE /api/posts/{id}` - Modifier/Supprimer
- `POST /api/posts/{id}/commentaires` - Ajouter commentaire

**À ajouter:**
- [ ] Filtrer par catégorie de post : `GET /api/posts?category=general|testimonies|qa|sensibilization`
- [ ] Recherche avancée : `GET /api/posts/search?q=query&category=...&sort=...`
- [ ] Modération : endpoint admin pour publier/rejeter posts
- [ ] Notifications : email quand réponse à un post

---

### 3️⃣ PODCASTS (AUDIO + VIDÉO)

**Plan client:**
```
- Lecteur intégré (audio + vidéo)
- Flux RSS
- Catégorisation (thèmes)
- Téléchargement hors ligne
```

**Backend:** ✅ COUVERT

**Endpoints existants:**
- `GET /api/podcasts` - Lister
- `POST /api/podcasts` - Créer
- `DELETE /api/podcasts/{id}` - Supprimer

**À ajouter:**
- [ ] Catégorisation : `GET /api/podcasts?categorie=educatif|sensibilization|expert`
- [ ] Flux RSS : `GET /api/podcasts/feed.xml`
- [ ] Métadonnées : `duree_secondes`, `taille_fichier_bytes`, `format` (mp3, m4a, etc)

---

### 4️⃣ TÉMOIGNAGES ET HISTOIRES

**Plan client:**
```
- Formulaire (texte, image, audio, vidéo)
- Modération avant publication
- Catégorisation (handicap, inclusion, éducation, emploi)
```

**Backend:** ✅ COUVERT

**Endpoints existants:**
- `GET /api/temoignages` - Lister
- `POST /api/temoignages` - Créer
- `DELETE /api/temoignages/{id}` - Supprimer

**À ajouter:**
- [ ] Support multi-média : ajouter champs `video_url`, `audio_url`
- [ ] Catégorisation : `GET /api/temoignages?categorie=handicap|inclusion|education|emploi`
- [ ] Endpoint admin pour publier/rejeter

---

### 5️⃣ RECRUTEMENT ET ANNONCES

**Plan client:**
```
- Offres d'emploi
- CV upload + candidature
- Alertes email
- Annonces événements/formations/conférences
```

**Backend:** ⚠️ PARTIEL

**Endpoints existants:**
- `GET /api/jobs` - Lister emplois
- `POST /api/jobs` - Créer offre
- `PUT/DELETE /api/jobs/{id}` - Modifier/Supprimer

**À ajouter:**
- [ ] Modèle `Candidature` pour les candidatures
- [ ] Modèle `Annonce` (distinc de `Job` pour les événements/formations)
- [ ] Endpoint `POST /api/jobs/{id}/candidatures` - Postuler
- [ ] Endpoint `POST /api/jobs/{id}/candidatures/download-cv` - Télécharger CV
- [ ] Notifications : email pour nouvelles offres

---

### 6️⃣ CONTENU ÉDUCATIF ET SENSIBILISATION

**Plan client:**
```
- Articles et guides
- Infographies et images
- Vidéos éducatives et tutoriels
- Contenu pédagogique
```

**Backend:** ❌ NON COUVERT

**À créer:**
```
Modèle: Article
- id (primary key)
- titre (string)
- contenu (text - Markdown supporté)
- description_courte (string - 200 chars)
- image_featured_url (string - URL Cloudinary)
- auteur_id (FK vers User)
- categorie (enum: educatif | sensibilization | guide)
- tags (array - ou modèle Link)
- est_publie (boolean)
- vues (integer)
- cree_le, modifie_le (datetime)
```

**Endpoints:**
- `GET /api/articles` - Lister
- `GET /api/articles/{id}` - Détail
- `POST /api/articles` - Créer (Auth)
- `PUT /api/articles/{id}` - Modifier (Auth owner)
- `DELETE /api/articles/{id}` - Supprimer (Auth owner)
- `GET /api/articles?categorie=educatif&search=...` - Filtrer/Chercher

**Priorité:** 🔴 HAUTE (partie importante du site)

---

### 7️⃣ AVIS ET FEEDBACK

**Plan client:**
```
- Système de rating (1-5 étoiles)
- Commentaires
- Modération
- Réponses d'experts
```

**Backend:** ⚠️ PARTIEL (commentaires sur posts, mais pas de système de rating indépendant)

**À créer:**
```
Modèle: Review
- id (primary key)
- titre (string)
- contenu (text)
- rating (integer 1-5)
- categorie (string - sujet de la review)
- user_id (FK)
- modere_par_user_id (FK - qui a approuvé)
- est_approuve (boolean)
- cree_le (datetime)
```

**Endpoints:**
- `GET /api/reviews` - Lister reviews approuvées
- `POST /api/reviews` - Créer (Auth)
- `PUT /api/reviews/{id}` - Modifier (Auth owner)
- `PATCH /api/reviews/{id}/approve` - Approuver (Modérateur)

**Priorité:** 🟢 BASSE (peut venir plus tard)

---

### 8️⃣ EXPERTS ET INTERVIEWS

**Plan client:**
```
- Pages profils
- Bio, photo, contact
- Articles/vidéos d'interview
- Filtrage par domaine
```

**Backend:** ✅ COUVERT

**Endpoints existants:**
- `GET /api/experts` - Lister
- `GET /api/experts/{id}` - Détail
- `POST /api/experts` - Créer (Admin)

**À ajouter:**
- [ ] Lier des Articles/Interviews aux experts
- [ ] Endpoint `GET /api/experts/{id}/articles` - Articles de cet expert
- [ ] Endpoint `GET /api/experts/{id}/interviews` - Interviews
- [ ] Champ `website_url`, `linkedin_url`, `twitter_url`

---

### 9️⃣ GALERIE MULTIMÉDIA

**Plan client:**
```
- Albums photos
- Vidéos intégrées
- Lien vers contenus associés
- Filtrage par thème/événement
```

**Backend:** ❌ NON COUVERT

**À créer:**
```
Modèle: Galerie
- id (primary key)
- titre (string)
- description (text)
- theme (string: event | article | podcast | temoignage)
- images_urls (array of strings - URLs Cloudinary)
- videos_urls (array of strings - URLs YouTube/Vimeo)
- date_event (datetime - optionnel)
- user_id (FK)
- est_publie (boolean)
- cree_le (datetime)

Modèle: GalerieItem (si on veut plus de flexibilité)
- id, galerie_id, type (image|video), url, titre, ordre
```

**Endpoints:**
- `GET /api/galleries` - Lister
- `GET /api/galleries/{id}` - Détail
- `POST /api/galleries` - Créer (Auth)
- `POST /api/galleries/{id}/items` - Ajouter image/vidéo
- `DELETE /api/galleries/{id}/items/{item_id}` - Supprimer item

**Priorité:** 🟡 MOYENNE

---

### 🔟 NAVIGATION ET UX (Frontend)

**Backend nécessaire:**
- ✅ Menu principal : tous les endpoints sont prêts
- ✅ Recherche avancée : à améliorer avec filtres
- ✅ Pagination : incluse dans GET endpoints
- ✅ Notifications : système à créer

---

## 🚨 RÉCAPITULATIF DES GAPS

### Modèles à CRÉER

| Modèle | Urgence | Endpoints |
|--------|---------|-----------|
| **Article** | 🔴 HAUTE | CRUD (Create, Read, Update, Delete) + Filtrage |
| **Annonce** | 🟡 MOYENNE | CRUD |
| **Candidature** | 🔴 HAUTE | POST (créer), GET (lister ses candidatures) |
| **Galerie** | 🟡 MOYENNE | CRUD + gestion items |
| **Review** | 🟢 BASSE | CRUD + modération |

### Fonctionnalités CROSS-MODULE à AJOUTER

| Fonctionnalité | Modules affectés | Urgence |
|---|---|---|
| **Système de notifications** | Tous les modules | 🔴 HAUTE |
| **Système de search avancée** | Articles, Posts, Jobs, Experts | 🔴 HAUTE |
| **Système de tags/catégories** | Posts, Articles, Podcasts, Temoignages | 🔴 HAUTE |
| **Système de featured/featured items** | Podcasts, Jobs, Experts, Articles | 🟡 MOYENNE |
| **Flux RSS** | Podcasts, Articles, Temoignages | 🟡 MOYENNE |
| **Upload de fichiers** | CV pour Jobs, images pour Galerie, etc | 🔴 HAUTE |

---

## 📈 Nouvelle Feuille de Route (Alignée au Plan Client)

### **Phase 1 : Foundation (Semaines 1-2)** 🔴 HAUTE PRIORITÉ

✅ Auth + Users (semaine 1 - déjà en cours)
✅ Forum + Posts (semaine 2 - déjà en cours)
- [ ] Créer modèle `Article` (contenu éducatif)
- [ ] Créer modèle `Annonce` (news/events)
- [ ] Système de catégorisation (tags)
- [ ] Endpoint `/api/home/feed` (page d'accueil)
- [ ] Système de notifications basique

### **Phase 2 : Contenus (Semaines 3-4)** 🟡 PRIORITÉ MOYENNE

✅ Podcasts (semaine 3)
✅ Témoignages (semaine 4)
✅ Experts (semaine 2-3)
✅ Jobs (semaine 3)
- [ ] Modèle `Candidature` + endpoints
- [ ] Amélioration catégorisation
- [ ] Flux RSS

### **Phase 3 : Compléments (Semaine 5)**  🟢 BASSE PRIORITÉ

- [ ] Modèle `Galerie`
- [ ] Modèle `Review`
- [ ] Système de recherche avancée
- [ ] Optimisations performance

---

## 📞 Points de Synchronisation Frontend

### JSON Response Format
Tous les endpoints doivent respecter ce format standardisé:

```json
{
  "success": true,
  "data": [...],
  "message": "Description de l'action",
  "pagination": {
    "total": 100,
    "skip": 0,
    "limit": 10,
    "pages": 10
  }
}
```

### Codes HTTP Standards
- **200**: Success GET/PUT
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error

### Authentication
- Header: `Authorization: Bearer {token}`
- Tokens JWT valides 15 min (access) / 7j (refresh)

---

## ✨ Prochaines étapes

1. **Valider** ce mapping avec le client
2. **Prioriser** les gaps (Article + Annonce sont critiques)
3. **Créer** les modèles manquants dans le backend
4. **Intégrer** le système de notifications
5. **Documenter** les nouveaux endpoints
6. **Tester** l'intégration frontend/backend

---

**Questions?** Contacter @backend-dev
