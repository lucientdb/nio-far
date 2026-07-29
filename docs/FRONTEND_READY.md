# 🚀 Frontend - Par où commencer ?

**Pour l'équipe Frontend**  
**Généré:** 14 mai 2026  
**Plan du client:** "Hub interactif et inclusif"

---

## ⏱️ Timeline : Ce qui sera prêt quand

```
📅 SEMAINE 1 (IMMÉDIAT - 21 mai)
├─ ✅ Auth (Register, Login, Refresh)
├─ ✅ Users (Mon profil, Mettre à jour profil)
├─ ✅ Forum - Posts publiés (Lister)
├─ ✅ Home Feed (Aggréé: podcast + posts + annonces + experts)
└─ 🔄 Articles (Lister, Détail - peut être prêt fin semaine 1)

📅 SEMAINE 2 (21-28 mai)
├─ ✅ Forum - Créer/Modifier Posts
├─ ✅ Commentaires (Lister, Ajouter)
├─ ✅ Articles (Complet: CRUD)
├─ ✅ Annonces (Complet: Lister)
├─ ✅ Emplois (Lister, Détail)
└─ ✅ Candidatures (Postuler, Voir ses candidatures)

📅 SEMAINE 3 (28 mai - 4 juin)
├─ ✅ Podcasts (CRUD)
├─ ✅ Témoignages (CRUD)
├─ ✅ Experts (CRUD)
├─ ✅ Galeries (Lister, Ajouter items)
├─ ✅ Reviews (Créer, Lister)
└─ ✅ Notifications (Récupérer, Marquer comme lu)

📅 SEMAINE 4 (4-11 juin)
├─ ✅ Recherche avancée
├─ ✅ Flux RSS Podcasts
├─ ✅ Optimisations performance
└─ 🎉 LANCEMENT
```

---

## 🎯 Commencer MAINTENANT (Semaine 1)

### ✅ Endpoints PRÊTS À UTILISER (ou presque)

#### 1. Authentification
```bash
# Inscription
POST /api/auth/register
Body: {nom, prenom, email, mot_de_passe, type_handicap?, bio?}
Response: {access_token, refresh_token, token_type, user}

# Connexion
POST /api/auth/login
Body: {email, mot_de_passe}
Response: {access_token, refresh_token, token_type, user}

# Rafraîchir token
POST /api/auth/refresh
Body: {refresh_token}
Response: {access_token}
```

**Frontend peut faire:**
- ✅ Page d'inscription
- ✅ Page de connexion
- ✅ Gestion tokens (localStorage)
- ✅ Redirect si pas authentifié

---

#### 2. Mon Profil & Paramètres
```bash
# Récupérer profil
GET /api/users/me
Header: Authorization: Bearer {token}
Response: User complet

# Mettre à jour profil
PUT /api/users/me
Body: {nom?, prenom?, bio?, type_handicap?, avatar_url?}
Response: User mis à jour
```

**Frontend peut faire:**
- ✅ Page profil
- ✅ Page paramètres/édition profil
- ✅ Upload avatar (via Cloudinary)

---

#### 3. Forum - Posts (Lister)
```bash
# Lister posts publiés
GET /api/posts?skip=0&limit=10&published_only=true
Response: [{id, titre, contenu, auteur, commentaires, ...}]

# Détail un post
GET /api/posts/{post_id}
Response: Post complet avec commentaires
```

**Frontend peut faire:**
- ✅ Page forum - Lister les posts
- ✅ Page détail post + commentaires
- ✅ Pagination

---

#### 4. Experts
```bash
# Lister experts
GET /api/experts?skip=0&limit=10
Response: [Expert]

# Détail expert
GET /api/experts/{expert_id}
Response: Expert complet
```

**Frontend peut faire:**
- ✅ Page annuaire experts
- ✅ Page détail expert

---

#### 5. Podcasts (Lister)
```bash
# Lister podcasts publiés
GET /api/podcasts?skip=0&limit=10
Response: [{id, titre, audio_url, couverture_url, ...}]
```

**Frontend peut faire:**
- ✅ Page podcasts
- ✅ Lecteur audio intégré
- ✅ Affichage couvertures

---

#### 6. Témoignages (Lister)
```bash
# Lister témoignages publiés
GET /api/temoignages?skip=0&limit=10
Response: [{id, titre, contenu, photo_url, auteur, ...}]
```

**Frontend peut faire:**
- ✅ Page témoignages
- ✅ Affichage avec photos

---

#### 7. Emplois (Lister)
```bash
# Lister emplois
GET /api/jobs?skip=0&limit=10
Response: [Job]
```

**Frontend peut faire:**
- ✅ Page emplois
- ✅ Filtrage par type_contrat, lieu
- ✅ Détail offre

---

### ⚠️ Endpoints À VENIR (Cette semaine 1)

#### A. Home Feed (Agregé)
```bash
# Endpoint NOUVEAU - Semaine 1
GET /api/home/feed
Response: {
  hero: {title, subtitle, image_url},
  featured_podcast: {Podcast},
  recent_posts: [3 posts],
  announcements: [2 annonces],
  featured_testimonies: [2 témoignages],
  featured_experts: [3 experts]
}
```

**Frontend peut préparer:**
- Composant Hero
- Carrousel "Podcast du jour"
- Derniers posts (preview)
- Cards annonces/actualités
- Featured experts

---

#### B. Articles (Semaine 2)
```bash
# Lister articles publiés
GET /api/articles?skip=0&limit=10&categorie=educatif
Response: [Article]

# Détail article
GET /api/articles/{id}
Response: Article
```

**Frontend peut préparer:**
- Page articles/ressources éducatives
- Composants articles

---

#### C. Annonces (Semaine 2)
```bash
# Lister annonces publiées
GET /api/annonces?skip=0&limit=10&type=actualite
Response: [Annonce]
```

---

## 💡 Recommandations Frontend (Semaine 1)

### Architecture recommandée

```typescript
// src/api/endpoints.ts
const API_BASE = 'http://localhost:8000/api'

// Auth
export const auth = {
  register: (data) => POST('/auth/register', data),
  login: (data) => POST('/auth/login', data),
  refresh: (token) => POST('/auth/refresh', {refresh_token: token}),
}

// Users
export const users = {
  getMe: (token) => GET('/users/me', {Authorization: `Bearer ${token}`}),
  updateMe: (data, token) => PUT('/users/me', data, {Authorization: `Bearer ${token}`}),
}

// Posts
export const posts = {
  list: (skip = 0, limit = 10) => GET(`/posts?skip=${skip}&limit=${limit}`),
  detail: (id) => GET(`/posts/${id}`),
  create: (data, token) => POST('/posts', data, {Authorization: `Bearer ${token}`}),
  // ... etc
}
```

### Stockage tokens

```typescript
// En localStorage ou sessionStorage
localStorage.setItem('access_token', response.access_token)
localStorage.setItem('refresh_token', response.refresh_token)

// Extraire info user du token (optionnel)
const payload = JSON.parse(atob(token.split('.')[1]))
```

### Gestion erreurs standard

```typescript
// Tous les endpoints retournent:
// 200: Succès
// 401: Token expiré → Rafraîchir avec refresh_token
// 403: Pas de permission
// 404: Ressource inexistante
// 422: Données invalides (Afficher erreurs de validation)
// 500: Erreur serveur
```

---

## 📋 Checklist pour Commencer (Semaine 1)

### Phase 1 : Foundation (Jours 1-3)

- [ ] **Layout principal**
  - [ ] Navigation header (Accueil, Forum, Podcasts, Témoignages, Emplois, À propos)
  - [ ] Footer
  - [ ] Responsive mobile

- [ ] **Auth Pages**
  - [ ] Page d'inscription (Register)
  - [ ] Page de connexion (Login)
  - [ ] Gestion tokens + localStorage
  - [ ] Redirect si pas connecté

- [ ] **Profil**
  - [ ] Page profil (GET /api/users/me)
  - [ ] Page édition profil (PUT /api/users/me)
  - [ ] Upload avatar

### Phase 2 : Contenus (Jours 3-5)

- [ ] **Home Page**
  - [ ] Hero section
  - [ ] Podcast featured (placeholder en attendant /api/home/feed)
  - [ ] Derniers posts (GET /api/posts)
  - [ ] Featured experts (GET /api/experts?limit=3)
  - [ ] CTA "Racontez votre histoire"

- [ ] **Forum**
  - [ ] Lister posts (GET /api/posts)
  - [ ] Détail post + commentaires (GET /api/posts/{id})
  - [ ] Pagination
  - [ ] (Créer post → Semaine 2)

- [ ] **Autres pages "read-only"**
  - [ ] Podcasts (GET /api/podcasts) + lecteur audio
  - [ ] Témoignages (GET /api/temoignages)
  - [ ] Experts (GET /api/experts)
  - [ ] Emplois (GET /api/jobs)

### Phase 3 : Tests (Jours 5-7)

- [ ] Tester tous les endpoints avec Postman/Insomnia
- [ ] Vérifier pagination
- [ ] Vérifier gestion erreurs
- [ ] Tests sur mobile

---

## 🔗 API Base URL

| Env | URL |
|-----|-----|
| **Dev** | http://localhost:8000 |
| **Prod** | À définir (Railway/Render) |

### Swagger Docs
- **Dev:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📞 Support

- **Issues Backend:** Ouvrir issue ou Slack
- **Backend Dev:** @backend-dev
- **Sync quotidienne:** Slack #dev-sync

---

## ✨ Anticipez la Semaine 2

Pendant que vous développez semaine 1, je vais créer:

- ✅ Articles (Modèle + CRUD)
- ✅ Annonces (Modèle + CRUD)
- ✅ Candidatures (Postuler aux jobs)
- ✅ Home Feed (Endpoint agregé)

**Donc préparez:**
- Composants Articles 
- Formulaire créer post
- Formulaire ajouter article
- Formulaire postuler job

---

## 🎨 UI/Design

Vous pouvez commencer le design sans attendre le backend!

**Utiliser les modèles de données fournis** pour structurer les composants:

```typescript
// Post Card Component
interface PostCardProps {
  id: number
  titre: string
  contenu: string
  auteur: {id: number, nom: string, prenom: string, avatar_url: string}
  vues: number
  cree_le: string
  commentaires_count: number
}
```

Mockez les données et utilisez les endpoints réels quand ils seront prêts!

---

**Bon développement! 🚀**
