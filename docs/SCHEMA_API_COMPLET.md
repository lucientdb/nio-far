# 📚 Schéma Complet de l'API Backend

**Document technique pour l'équipe Frontend**  
**Version:** 1.0  
**Dernière mise à jour:** 14 mai 2026

---

## Table des matières
1. [Configuration API](#configuration-api)
2. [Modèles de données](#modèles-de-données)
3. [Endpoints complets](#endpoints-complets)
4. [Codes de réponse](#codes-de-réponse)
5. [Exemples requêtes/réponses](#exemples-requêtesréponses)

---

## Configuration API

### URL de base
- **Dev:** `http://localhost:8000`
- **Production:** `https://api.inclusion-senegal.vercel.app` (à confirmer)

### Headers requis
```
Content-Type: application/json
Authorization: Bearer {access_token}  // pour les routes protégées
```

### Documentation interactive
- **Swagger UI:** `GET /docs`
- **ReDoc:** `GET/redoc`

---

## Modèles de données

### 📦 Modèle User

**Table:** `users`

```json
{
  "id": 1,
  "nom": "Diallo",
  "prenom": "Ahmed",
  "email": "ahmed.diallo@example.com",
  "role": "user",
  "est_actif": true,
  "avatar_url": "https://cloudinary.com/...",
  "bio": "Développeur web passionné",
  "type_handicap": "Malvoyant",
  "cree_le": "2026-05-10T14:30:00",
  "modifie_le": "2026-05-14T09:15:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `nom` | string(100) | ✅ | Nom de famille |
| `prenom` | string(100) | ✅ | Prénom |
| `email` | string(200) | ✅ | Unique, validé |
| `mot_de_passe` | string(255) | ✅ | Hashé (jamais en response) |
| `role` | enum | ✅ | `user` / `moderateur` / `admin` |
| `est_actif` | boolean | ✅ | Défaut: `true` |
| `avatar_url` | string(500) | ❌ | URL Cloudinary |
| `bio` | string(500) | ❌ | Biographie personnelle |
| `type_handicap` | string(200) | ❌ | Ex: "Malvoyant", "Sourd", etc. |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |
| `modifie_le` | datetime | ✅ (auto) | Mis à jour auto |

**Relations:**
- `posts` : Une liste de tous les posts créés par cet utilisateur
- `commentaires` : Tous ses commentaires

---

### 📝 Modèle Post

**Table:** `posts`

```json
{
  "id": 42,
  "titre": "Comment trouver un emploi accessible?",
  "contenu": "Voici mes conseils après 2 ans de recherche...",
  "est_publie": true,
  "vues": 128,
  "auteur": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed",
    "avatar_url": "https://cloudinary.com/..."
  },
  "commentaires": [
    {
      "id": 101,
      "contenu": "Très utile merci!",
      "auteur": {
        "id": 2,
        "nom": "Ba",
        "prenom": "Marie",
        "avatar_url": "https://cloudinary.com/..."
      },
      "cree_le": "2026-05-14T10:20:00"
    }
  ],
  "cree_le": "2026-05-12T15:45:00",
  "modifie_le": "2026-05-13T08:30:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `titre` | string(300) | ✅ | Titre du post |
| `contenu` | text | ✅ | Contenu long (peut avoir du markdown) |
| `est_publie` | boolean | ✅ | Défaut: `true` (public) |
| `vues` | integer | ✅ | Défaut: `0` |
| `user_id` | integer FK | ✅ | Vers `users.id` |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |
| `modifie_le` | datetime | ✅ (auto) | Mis à jour auto |

**Relations:**
- `auteur` : Objet User complet
- `commentaires` : Liste de Commentaires

---

### 💬 Modèle Commentaire

**Table:** `commentaires`

```json
{
  "id": 101,
  "contenu": "Très utile merci!",
  "auteur": {
    "id": 2,
    "nom": "Ba",
    "prenom": "Marie",
    "avatar_url": "https://cloudinary.com/..."
  },
  "post_id": 42,
  "cree_le": "2026-05-14T10:20:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `contenu` | text | ✅ | Texte du commentaire |
| `user_id` | integer FK | ✅ | Vers `users.id` |
| `post_id` | integer FK | ✅ | Vers `posts.id` |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |

**Relations:**
- `auteur` : Objet User
- `post` : Objet Post

---

### 👨‍⚕️ Modèle Expert

**Table:** `experts`

```json
{
  "id": 5,
  "nom": "Dr Youssou Tall",
  "specialite": "Droit du handicap",
  "organisation": "ASAPSU",
  "email": "youssou@asapsu.sn",
  "telephone": "+221 77 123 45 67",
  "ville": "Dakar",
  "photo_url": "https://cloudinary.com/...",
  "est_actif": true,
  "cree_le": "2026-05-01T10:00:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `nom` | string(200) | ✅ | Nom complet |
| `specialite` | string(200) | ✅ | Ex: "Droit", "Médecine", "Kinésithérapie" |
| `organisation` | string(200) | ❌ | Nom d'organisation |
| `email` | string(200) | ❌ | Contact |
| `telephone` | string(50) | ❌ | Numéro avec code pays |
| `ville` | string(100) | ❌ | Localisation |
| `photo_url` | string(500) | ❌ | URL Cloudinary de la photo |
| `est_actif` | boolean | ✅ | Défaut: `true` |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |

---

### 💼 Modèle Job

**Table:** `jobs`

```json
{
  "id": 3,
  "titre": "Développeur Full-Stack",
  "entreprise": "TechStartup Dakar",
  "description": "Nous cherchons un développeur passionné pour rejoindre notre équipe...",
  "lieu": "Dakar, Sénégal",
  "type_contrat": "CDI",
  "est_actif": true,
  "auteur": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed"
  },
  "expire_le": "2026-06-30T23:59:59",
  "cree_le": "2026-05-10T11:20:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `titre` | string(300) | ✅ | Titre du poste |
| `entreprise` | string(200) | ✅ | Nom entreprise |
| `description` | text | ✅ | Description complète |
| `lieu` | string(200) | ❌ | Localisation (ex: Dakar, Thiès) |
| `type_contrat` | string(100) | ❌ | CDI, CDD, Stage, Bénévolat |
| `est_actif` | boolean | ✅ | Défaut: `true` |
| `user_id` | integer FK | ✅ | Vers `users.id` (créateur) |
| `expire_le` | datetime | ❌ | Quand l'offre expire |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |

**Relations:**
- `auteur` : Objet User (créateur de l'offre)

---

### 🎙️ Modèle Podcast

**Table:** `podcasts`

```json
{
  "id": 2,
  "titre": "Episode 5 - L'accessibilité numérique",
  "description": "Dans ce podcast, nous parlons d'accessibilité web et mobile...",
  "audio_url": "https://res.cloudinary.com/.../audio.mp3",
  "couverture_url": "https://res.cloudinary.com/.../cover.jpg",
  "duree_secondes": 1845,
  "est_publie": true,
  "auteur": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed"
  },
  "cree_le": "2026-05-08T14:30:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `titre` | string(300) | ✅ | Titre de l'épisode |
| `description` | text | ❌ | Description complète |
| `audio_url` | string(500) | ✅ | URL fichier MP3 (Cloudinary) |
| `couverture_url` | string(500) | ❌ | URL image couverture (Cloudinary) |
| `duree_secondes` | integer | ❌ | Durée en secondes (ex: 1845 = 30min45s) |
| `est_publie` | boolean | ✅ | Défaut: `false` (attente admin) |
| `user_id` | integer FK | ✅ | Vers `users.id` (créateur) |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |

**Relations:**
- `auteur` : Objet User (créateur du podcast)

---

### 📣 Modèle Temoignage

**Table:** `temoignages`

```json
{
  "id": 8,
  "titre": "Mon parcours vers l'emploi",
  "contenu": "J'ai eu mon diplôme en 2021 mais c'était très difficile de trouver un emploi...",
  "photo_url": "https://res.cloudinary.com/.../photo.jpg",
  "est_publie": true,
  "auteur": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed"
  },
  "cree_le": "2026-05-05T09:15:00"
}
```

**Champs:**

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| `id` | integer | ✅ (auto) | Clé primaire |
| `titre` | string(300) | ✅ | Titre du témoignage |
| `contenu` | text | ✅ | Contenu long |
| `photo_url` | string(500) | ❌ | Photo profil (Cloudinary) |
| `est_publie` | boolean | ✅ | Défaut: `false` (attente modération) |
| `user_id` | integer FK | ✅ | Vers `users.id` (auteur) |
| `cree_le` | datetime | ✅ (auto) | Timezone aware |

**Relations:**
- `auteur` : Objet User

---

## Endpoints complets

### 🔐 Authentication - `/api/auth`

#### POST /api/auth/register
**Inscription d'un nouvel utilisateur**

Requête:
```json
{
  "nom": "Diallo",
  "prenom": "Ahmed",
  "email": "ahmed@example.com",
  "mot_de_passe": "SecurePass123!",
  "type_handicap": "Malvoyant",
  "bio": "Développeur web"
}
```

Réponse (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed",
    "email": "ahmed@example.com",
    "role": "user",
    "avatar_url": null
  }
}
```

Erreurs:
- `400 Bad Request` : Email déjà existant ou données invalides
- `422 Unprocessable Entity` : Validation échouée (email invalide, mot de passe faible)

---

#### POST /api/auth/login
**Connexion utilisateur**

Requête:
```json
{
  "email": "ahmed@example.com",
  "mot_de_passe": "SecurePass123!"
}
```

Réponse (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed",
    "email": "ahmed@example.com",
    "role": "user",
    "avatar_url": null
  }
}
```

Erreurs:
- `401 Unauthorized` : Email/mot de passe incorrect

---

#### POST /api/auth/refresh
**Rafraîchir l'access token**

Requête:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Réponse (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Erreurs:
- `401 Unauthorized` : Refresh token invalide/expiré

---

### 👤 Utilisateurs - `/api/users`

#### GET /api/users/me
**Récupérer son profil (authentification requise)**

Header:
```
Authorization: Bearer {access_token}
```

Réponse (200 OK):
```json
{
  "id": 1,
  "nom": "Diallo",
  "prenom": "Ahmed",
  "email": "ahmed@example.com",
  "role": "user",
  "est_actif": true,
  "avatar_url": "https://cloudinary.com/...",
  "bio": "Développeur web passionné",
  "type_handicap": "Malvoyant",
  "cree_le": "2026-05-10T14:30:00"
}
```

---

#### PUT /api/users/me
**Mettre à jour son profil (authentification requise)**

Requête:
```json
{
  "nom": "Diallo",
  "prenom": "Ahmed",
  "bio": "Développeur web et designer",
  "type_handicap": "Malvoyant",
  "avatar_url": "https://cloudinary.com/new-avatar.jpg"
}
```

Réponse (200 OK): Retourne l'objet User mis à jour (voir GET /api/users/me)

Erreurs:
- `401 Unauthorized` : Pas authentifié
- `422 Unprocessable Entity` : Données invalides

---

#### GET /api/users/{user_id}
**Récupérer le profil public d'un utilisateur**

Réponse (200 OK):
```json
{
  "id": 1,
  "nom": "Diallo",
  "prenom": "Ahmed",
  "avatar_url": "https://cloudinary.com/...",
  "bio": "Développeur web passionné",
  "type_handicap": "Malvoyant",
  "posts_count": 5,
  "temoignages_count": 1
}
```

Note: N'expose pas l'email ou le rôle

---

### 💬 Posts - `/api/posts`

#### GET /api/posts
**Lister tous les posts publiés**

Paramètres query:
```
skip=0
limit=10
published_only=true
```

Réponse (200 OK):
```json
[
  {
    "id": 42,
    "titre": "Comment trouver un emploi accessible?",
    "contenu": "Voici mes conseils après 2 ans de recherche...",
    "est_publie": true,
    "vues": 128,
    "auteur": {
      "id": 1,
      "nom": "Diallo",
      "prenom": "Ahmed",
      "avatar_url": "https://cloudinary.com/..."
    },
    "commentaires": [
      {
        "id": 101,
        "contenu": "Très utile merci!",
        "auteur": {
          "id": 2,
          "nom": "Ba",
          "prenom": "Marie",
          "avatar_url": "https://cloudinary.com/..."
        },
        "cree_le": "2026-05-14T10:20:00"
      }
    ],
    "cree_le": "2026-05-12T15:45:00",
    "modifie_le": "2026-05-13T08:30:00"
  }
]
```

---

#### POST /api/posts
**Créer un nouveau post (authentification requise)**

Requête:
```json
{
  "titre": "Comment trouver un emploi accessible?",
  "contenu": "Voici mes conseils après 2 ans de recherche..."
}
```

Réponse (201 Created):
```json
{
  "id": 42,
  "titre": "Comment trouver un emploi accessible?",
  "contenu": "Voici mes conseils après 2 ans de recherche...",
  "est_publie": false,
  "vues": 0,
  "auteur": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed",
    "avatar_url": "https://cloudinary.com/..."
  },
  "commentaires": [],
  "cree_le": "2026-05-14T15:45:00"
}
```

Erreurs:
- `401 Unauthorized` : Pas authentifié
- `422 Unprocessable Entity` : Titre/contenu manquant

---

#### GET /api/posts/{post_id}
**Récupérer le détail d'un post**

Réponse (200 OK): Retourne l'objet Post complet avec commentaires

---

#### PUT /api/posts/{post_id}
**Mettre à jour un post (authentification requise)**

Requête:
```json
{
  "titre": "Comment trouver un emploi accessible? (UPDATED)",
  "contenu": "Mes conseils mis à jour...",
  "est_publie": true
}
```

Restrictions:
- Seul l'auteur peut modifier
- Modérateur/Admin peuvent aussi modifier

---

#### DELETE /api/posts/{post_id}
**Supprimer un post (authentification requise)**

Réponse (204 No Content)

Restrictions:
- Seul l'auteur peut supprimer
- Modérateur/Admin peuvent aussi supprimer

---

### 👨‍⚕️ Experts - `/api/experts`

#### GET /api/experts
**Lister tous les experts**

Paramètres query:
```
skip=0
limit=10
specialite=Droit (optionnel)
```

Réponse (200 OK):
```json
[
  {
    "id": 5,
    "nom": "Dr Youssou Tall",
    "specialite": "Droit du handicap",
    "organisation": "ASAPSU",
    "email": "youssou@asapsu.sn",
    "telephone": "+221 77 123 45 67",
    "ville": "Dakar",
    "photo_url": "https://cloudinary.com/...",
    "est_actif": true,
    "cree_le": "2026-05-01T10:00:00"
  }
]
```

---

#### GET /api/experts/{expert_id}
**Récupérer un expert**

Réponse (200 OK): Retourne l'objet Expert

---

### 💼 Emplois - `/api/jobs`

#### GET /api/jobs
**Lister tous les emplois actifs**

Paramètres query:
```
skip=0
limit=10
type_contrat=CDI (optionnel)
lieu=Dakar (optionnel)
```

Réponse (200 OK):
```json
[
  {
    "id": 3,
    "titre": "Développeur Full-Stack",
    "entreprise": "TechStartup Dakar",
    "description": "Nous cherchons un développeur...",
    "lieu": "Dakar, Sénégal",
    "type_contrat": "CDI",
    "est_actif": true,
    "auteur": {
      "id": 1,
      "nom": "Diallo",
      "prenom": "Ahmed"
    },
    "expire_le": "2026-06-30T23:59:59",
    "cree_le": "2026-05-10T11:20:00"
  }
]
```

---

#### POST /api/jobs
**Créer une offre d'emploi (authentification requise)**

Requête:
```json
{
  "titre": "Développeur Full-Stack",
  "entreprise": "TechStartup Dakar",
  "description": "Nous cherchons un développeur passionné...",
  "lieu": "Dakar, Sénégal",
  "type_contrat": "CDI",
  "expire_le": "2026-06-30T23:59:59"
}
```

Réponse (201 Created): Retourne l'objet Job créé

---

### 🎙️ Podcasts - `/api/podcasts`

#### GET /api/podcasts
**Lister tous les podcasts publiés**

Paramètres query:
```
skip=0
limit=10
```

Réponse (200 OK):
```json
[
  {
    "id": 2,
    "titre": "Episode 5 - L'accessibilité numérique",
    "description": "Dans ce podcast, nous parlons d'accessibilité web...",
    "audio_url": "https://res.cloudinary.com/.../audio.mp3",
    "couverture_url": "https://res.cloudinary.com/.../cover.jpg",
    "duree_secondes": 1845,
    "est_publie": true,
    "auteur": {
      "id": 1,
      "nom": "Diallo",
      "prenom": "Ahmed"
    },
    "cree_le": "2026-05-08T14:30:00"
  }
]
```

---

### 📣 Témoignages - `/api/temoignages`

#### GET /api/temoignages
**Lister tous les témoignages publiés**

Paramètres query:
```
skip=0
limit=10
```

Réponse (200 OK):
```json
[
  {
    "id": 8,
    "titre": "Mon parcours vers l'emploi",
    "contenu": "J'ai eu mon diplôme en 2021 mais c'était très difficile...",
    "photo_url": "https://res.cloudinary.com/.../photo.jpg",
    "est_publie": true,
    "auteur": {
      "id": 1,
      "nom": "Diallo",
      "prenom": "Ahmed"
    },
    "cree_le": "2026-05-05T09:15:00"
  }
]
```

---

## Codes de réponse

| Code | Signification | Exemple |
|------|---------------|---------|
| **200** | OK - Requête réussie | GET, PUT réussis |
| **201** | Created - Ressource créée | POST réussi |
| **204** | No Content - Succès sans contenu | DELETE réussi |
| **400** | Bad Request - Données invalides | JSON malformé, champs manquants |
| **401** | Unauthorized - Authentification requise | Token manquant/invalide |
| **403** | Forbidden - Permission refusée | Utilisateur n'est pas admin |
| **404** | Not Found - Ressource inexistante | POST inexistant |
| **422** | Unprocessable Entity - Validation échouée | Email invalide, mot de passe faible |
| **500** | Server Error - Erreur serveur | Bug backend |

---

## Exemples requêtes/réponses

### Flux complet : Inscription → Connexion → Créer Post

#### 1. Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diallo",
    "prenom": "Ahmed",
    "email": "ahmed@example.com",
    "mot_de_passe": "SecurePass123!",
    "type_handicap": "Malvoyant"
  }'
```

Réponse:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nom": "Diallo",
    "prenom": "Ahmed",
    "email": "ahmed@example.com",
    "role": "user",
    "avatar_url": null
  }
}
```

Sauvegarder le `access_token` et `refresh_token` en localStorage/sessionStorage.

---

#### 2. Récupérer son profil
```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer {access_token}"
```

---

#### 3. Créer un post
```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Comment trouver un emploi accessible?",
    "contenu": "Voici mes conseils après 2 ans de recherche..."
  }'
```

---

## Notes importantes

### Tokens JWT
- **Access Token**: 15 minutes de durée de vie
- **Refresh Token**: 7 jours de durée de vie
- Passer dans le header: `Authorization: Bearer {token}`

### Validation des données
- Emails doivent être en format valide (RFC 5322)
- Mots de passe: minimum 8 caractères recommandé
- Tous les champs `nullable=True` peuvent être `null`

### Pagination
- Défaut: `skip=0, limit=10`
- Maximum limit: 100
- Réponses toujours des arrays

### Dates et heures
- Format: ISO 8601 avec timezone (ex: `2026-05-14T15:45:00`)
- Serveur utilise UTC
- Frontend doit convertir en timezone local

### Cloudinary
- URLs des images/audios hébergées sur Cloudinary
- Format: `https://res.cloudinary.com/{cloudinary_account}/...`
- Dimensionner automatiquement via paramètres URL

### CORS
- Frontend autorisé sur: `http://localhost:3000` (dev) et domaine production
- Cookies/tokens autorisés via `allow_credentials=true`

---

**Questions?** Ouvrir une issue ou contacter @backend-dev
