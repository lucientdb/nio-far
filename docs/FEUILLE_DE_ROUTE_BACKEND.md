# 🚀 Feuille de Route Backend - Inclusion Sénégal

**Dernière mise à jour:** 14 mai 2026  
**Développeur:** @backend-dev  
**Pour:** Équipe Frontend (@dev1, @dev2)

---

## 📋 Vue d'ensemble du projet

**Plateforme:** API REST FastAPI pour le handicap et l'inclusion  
**Base de données:** PostgreSQL  
**Hébergement:** Railway/Render  
**Frontend:** Next.js (React)

---

## ✅ État d'avancement global

### Aligné au plan du site client: "Hub interactif et inclusif"

| Section du Site | Module Backend | État | Priorité | Livraison |
|---|---|---|---|---|
| **Page d'accueil** | Feed agregé + Featured | 🔴 À FAIRE | 🔴 CRITIQUE | Semaine 1 |
| **Forum de discussion** | Posts + Commentaires | 🔄 En cours | 🔴 HAUTE | Semaine 1 |
| **Authentification** | Auth + Users | 🔄 En cours | 🔴 HAUTE | Semaine 1 |
| **Podcasts (audio/vidéo)** | Podcasts | ⏳ À démarrer | 🔴 HAUTE | Semaine 2 |
| **Témoignages & histoires** | Temoignages | ⏳ À démarrer | 🔴 HAUTE | Semaine 2 |
| **Recrutement & annonces** | Jobs + Candidatures | 🔴 À FAIRE | 🔴 HAUTE | Semaine 2 |
| **Contenu éducatif** | Articles | 🔴 À CRÉER | 🔴 HAUTE | Semaine 2 |
| **Experts & interviews** | Experts | ⏳ À démarrer | 🟡 MOYENNE | Semaine 3 |
| **Avis & feedback** | Reviews | ⏳ À démarrer | 🟡 MOYENNE | Semaine 3 |
| **Galerie multimédia** | Galeries | 🔴 À CRÉER | 🟡 MOYENNE | Semaine 3 |
| **Notifications** | Email/Push alerts | 🔴 À FAIRE | 🔴 HAUTE | Semaine 3 |
| **Recherche avancée** | Search endpoints | 🔴 À FAIRE | 🟡 MOYENNE | Semaine 4 |

---

## 🎯 Roadmap par Phase (Alignée au Plan Client)

### Timeline Frontend: "Commencer à développer"

```
Semaine 1     Semaine 2      Semaine 3       Semaine 4
Auth ✅       Forum ✅       Podcasts ✅     Experts ✅
Users ✅      Jobs/Candid.   Témoignages     Reviews
Home Feed     Articles ✅    Galeries        Search
              Annonces ✅    Notifs
```

---

## 🔐 Phase 1 : Authentification & Utilisateurs (Semaine 1)

### Auth - Endpoints à implémenter

#### 1. Inscription (POST /api/auth/register)
```
✅ ENVIRON FAIT - À tester
- Validation email unique
- Hash mot de passe
- Création tokens JWT (access + refresh)
- Retour user info + tokens
```

**À compléter:**
- [ ] Validation email (vérification existence)
- [ ] Email de confirmation (optionnel mais recommandé)
- [ ] Gestion CORS frontend

#### 2. Connexion (POST /api/auth/login)
```
✅ ENVIRON FAIT - À tester
- Vérification email/mot de passe
- Génération tokens
- Retour tokens + user info
```

#### 3. Rafraîchir Token (POST /api/auth/refresh)
```
🔄 EN COURS
- Validation refresh token
- Génération nouveau access token
```

#### 4. Déconnexion (POST /api/auth/logout)
```
⏳ À FAIRE
- Blacklist token (optionnel)
- Retour succès
```

---

### Utilisateurs - Endpoints à implémenter

#### 1. Mon Profil (GET /api/users/me)
```
✅ ENVIRON FAIT
- Récupère profile utilisateur connecté
- Retourne tous les champs (id, email, nom, prenom, avatar, bio, type_handicap, role)
```

#### 2. Mettre à jour Profil (PUT /api/users/me)
```
✅ ENVIRON FAIT
- Modifier: nom, prenom, bio, type_handicap, avatar_url
- Validation données
```

#### 3. Profil Public d'un Utilisateur (GET /api/users/{user_id})
```
⏳ À FAIRE
- Récupère profil publique (sans email, sans role)
- Affiche les posts de cet utilisateur
- Affiche les témoignages de cet utilisateur
```

#### 4. Changer Mot de Passe (POST /api/users/change-password)
```
⏳ À FAIRE
- Demande ancien mot de passe + nouveau
- Validation + update
```

#### 5. Réinitialiser Mot de Passe (POST /api/users/forgot-password)
```
⏳ À FAIRE
- Envoyer email reset
- Générer token temporaire
```

#### 6. Lister Utilisateurs (GET /api/users - Admin seulement)
```
⏳ À FAIRE
- Pagination
- Filtrage par rôle
```

---

### Endpoint Page d'Accueil (Nouveau - PRIORITAIRE)

#### GET /apForum (Plan client: "Forum de discussion")

#### 1. Lister Posts (GET /api/posts)
```
✅ ENVIRON FAIT
- Retourne tous les posts publiés
- Pagination (skip, limit)
- Include commentaires
- Tri par date (plus récent en premier)
- NOUVEAU: Filtrage par categorie (general|testimonies|qa|sensibilization)
```

#### 2. Créer Post (POST /api/posts)
```
⏳ À FAIRE
- Authentification requise
- Titre + Contenu + Catégorie
- est_publie = false par défaut (attente modération)
- Retour post créé
```

#### 3. Détail Post (GET /api/posts/{post_id})
```
⏳ À FAIRE
- Récupère 1 post avec tous ses commentaires
- Increment vues +1
```

#### 4. Mettre à jour Post (PUT /api/posts/{post_id})
```
⏳ À FAIRE
- Seul auteur peut modifier
- Peut changer titre/contenu/est_publie/categorie
```

#### 5. Supprimer Post (DELETE /api/posts/{post_id})
```
⏳ À FAIRE
- Seul auteur ou modérateur peut supprimer
- Supprime aussi les commentaires
```

#### 6. Rechercher Posts (GET /api/posts/search)
```
⏳ À FAIRE
- Paramètres: q (query), categorie, sort_by (recent|popular)
- Retourne posts matchant la recherche
#### 2. Créer Post (POST /api/posts)
```
⏳ À FAIRE
- Authentification requise
- Titre + Contenu
- est_publie = false par défaut (attente modération)
- Retour post créé
```

#### 3. Détail Post (GET /api/posts/{post_id})
```
⏳ À FAIRE
- Récupère 1 post avec tous ses commentaires
- Increment vues +1
```

#### 4. Mettre à jour Post (PUT /api/posts/{post_id})
```
⏳ À FAIRE
- Seul auteur peut modifier
- Peut changer titre/contenu/est_publie
```

#### 5. Supprimer Post (DELETE /api/posts/{post_id})
```
⏳ À FAIRE
- Seul auteur ou modérateur peut supprimer
- Supprime aussi les commentaires
```

### Commentaires - Endpoints à implémenter

#### 1. Ajouter Commentaire (POST /api/posts/{post_id}/commentaires)
```
⏳ À FAIRE
- Authentification requise
- Contenu du commentaire
- Retour commentaire créé
```

### Articles (Nouveau - Plan client: "Contenu éducatif et sensibilisation")

**Modèle à créer:**
```python
class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True)
    titre = Column(String(300), nullable=False)
    description_courte = Column(String(500))
    contenu = Column(Text, nullable=False)
    image_featured_url = Column(String(500), nullable=True)
    categorie = Column(Enum(ArticleCategorie), default=ArticleCategorie.educatif)
    # ArticleCategorie: educatif | sensibilization | guide
    est_publie = Column(Boolean, default=False)
    vues = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    modifie_le = Column(DateTime(timezone=True), onupdate=func.now())
    
    auteur = relationship("User")
```

#### 1. Lister Articles (GET /api/articles)
```
⏳ À CRÉER - Semaine 2
- Tous les articles publiés
- Pagination
- Filtrer par categorie: educatif|sensibilization|guide
- Tri par date (plus récent d'abord)
```

#### 2. Créer Article (POST /api/articles)
```
⏳ À CRÉER - Semaine 2
- Authentification requise
- Titre, description courte, contenu, image_featured_url
- Catégorie (educatif, sensibilization, guide)
- est_publie = false par défaut
```

#### 3. Détail Article (GET /api/articles/{article_id})
```
⏳ À CRÉER - Semaine 2
- Récupère 1 article complet
- Increment vues +1
```

#### 4. Rechercher Articles (GET /api/articles/search)
```
⏳ À CRÉER - Semaine 2
- Query search + categorie filter
```

---

## 👨‍⚕️ Phase 3 : Experts (Semaine 2-3 /api/posts/{post_id}/commentaires/{comment_id})
```
⏳ À FAIRE
- Seul auteur ou modérateur
```

---

## 👨‍⚕️ Phase 3 : Experts (Semaine 2)

### Experts - Endpoints à implémenter

#### 1. Lister Experts (GET /api/experts)
```
⏳ À FAIRE
- Tous les experts (publique)
### Candidatures (Nouveau - Plan client: "Recrutement et annonces")

**Modèle à créer:**
```python
class Candidature(Base):
    __tablename__ = "candidatures"
    
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cv_url = Column(String(500), nullable=True)  # URL Cloudinary
    lettre_motivation = Column(Text, nullable=True)
    statut = Column(Enum(StatutCandidature), default=StatutCandidature.en_attente)
    # StatutCandidature: en_attente | accepte | refuse
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    
    job = relationship("Job")
    candidat = relationship("User")
```

#### 1. Postuler à un emploi (POST /api/jobs/{job_id}/candidatures)
```
⏳ À CRÉER - Semaine 2
- Authentification requise
- Upload CV (fichier)
- Lettre de motivation (optionnel)
- Retour candidature créée
```

#### 2. Lister ses candidatures (GET /api/users/candidatures)
```
⏳ À CRÉER - Semaine 2
- Utilisateur voit ses candidatures
- Filtrer par statut
- Include job details
```

#### 3. Lister candidatures pour une offre (GET /api/jobs/{job_id}/candidatures - Créateur/Admin)
```
⏳ À CRÉER - Semaine 2
- Créateur de l'offre voit les candidatures
- Avec statuts
```
#### 5. Flux RSS Podcasts (GET /api/podcasts/feed.xml)
```
⏳ À CRÉER - Semaine 3
- Flux RSS standard pour Apple Podcasts, Spotify
```

---

## 📣 Phase 6 : Témoignages (Semaine 2-3
⏳ À CRÉER - Semaine 2
- Créateur de l'offre change le statut
- Email au candidat
```

---

### Annonces & Actualités (Nouveau - Plan client: "Annonces et actualités")

**Modèle à créer:**
```python
class Annonce(Base):
    __tablename__ = "annonces"
    
    id = Column(Integer, primary_key=True)
    titre = Column(String(300), nullable=False)
    contenu = Column(Text, nullable=False)
    type_annonce = Column(Enum(TypeAnnonce), default=TypeAnnonce.actualite)
    # TypeAnnonce: actualite | evenement | formation | conference
    image_url = Column(String(500), nullable=True)
    date_event = Column(DateTime, nullable=True)
    lieu = Column(String(200), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    est_publie = Column(Boolean, default=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    
    auteur = relationship("User")
```

#### 1. Lister Annonces (GET /api/annonces)
```
⏳ À CRÉER - Semaine 2
- Toutes les annonces publiées
- Pagination
- Filtrer par type (actualite|evenement|formation|conference)
```

#### 2. Créer Annonce (POST /api/annonces - Admin)
```
⏳ À CRÉER - Semaine 2
- Titre, contenu, type, image_url
- Optionnel: date_event, lieu
```

#### 3. Détail Annonce (GET /api/annonces/{annonce_id})
```
⏳ À CRÉER - Semaine 2
```

---

## 🎙️ Phase 5 : Podcasts (Semaine 2-sation, email, telephone, ville, photo_url
```

#### 2. Détail Expert (GET /api/experts/{expert_id})
```
⏳ À FAIRE
- 1 seul expert avec tous ses détails
```

#### 3. Créer Expert (POST /api/experts - Admin)
```
⏳ À FAIRE
- Admin uniquement
- Tous les champs
```

#### 4. Mettre à jour Expert (PUT /api/experts/{expert_id} - Admin)
```
⏳ À FAIRE
- Modification champs
```

#### 5. Supprimer Expert (DELETE /api/experts/{expert_id} - Admin)
```
⏳ À FAIRE
```

---

#### 5. Améliorer Témoignages (Semaine 2)
```
À FAIRE:
- Ajouter: video_url, audio_url (optionnel)
- Ajouter: categorie (handicap|inclusion|education|emploi)
- Ajouter: is_featured (pour home page)
```

---

## ⭐ Phase 7 : Galeries & Reviews (Semaine 3-4)

### Galeries (Plan client: "Galerie multimédia")

**Modèle à créer:**
```python
class Galerie(Base):
    __tablename__ = "galeries"
    
    id = Column(Integer, primary_key=True)
    titre = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    theme = Column(Enum(ThemeGalerie), default=ThemeGalerie.autre)
    # ThemeGalerie: event | article | podcast | temoignage | autre
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    est_publie = Column(Boolean, default=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    
    auteur = relationship("User")
    items = relationship("GalerieItem", cascade="all, delete")

class GalerieItem(Base):
    __tablename__ = "galerie_items"
    
    id = Column(Integer, primary_key=True)
    galerie_id = Column(Integer, ForeignKey("galeries.id"), nullable=False)
    type_item = Column(Enum(TypeItem), default=TypeItem.image)
    # TypeItem: image | video
    url = Column(String(500), nullable=False)
    titre = Column(String(300), nullable=True)
    ordre = Column(Integer, default=0)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
```

#### 1. Lister Galeries (GET /api/galleries)
```
⏳ À CRÉER - Semaine 3
- Toutes les galeries publiées
- Pagination
- Filtrer par theme
```

#### 2. Créer Galerie (POST /api/galleries)
```� Upload de Fichiers

**Pour toutes les uploads:**
- [ ] Intégrer SDK Cloudinary
- [ ] CV upload: `/api/upload/cv`
- [ ] Image upload: `/api/upload/image`
- [ ] Audio upload: `/api/upload/audio`
- [ ] Validation: type, taille max (10MB images, 100MB videos)

---

## 🔍 Recherche Avancée (Semaine 4)

```
À IMPLÉMENTER:
- GET /api/search?q=query&type=posts|jobs|articles|experts
- Filtrage multi-critères
- Tri: relevance, date, populaire
```

---

## 📊 Featured Items (Semaine 2-3)

**À ajouter à chaque modèle:**
```
is_featured: Boolean (default False)
featured_until: DateTime (optionnel, pour durée limitée)
```

**Endpoints:**
- Modérateurs peuvent marquer comme featured
- `/api/home/feed` agrège les featured

---

## �
⏳ À CRÉER - Semaine 3
- Titre, description, theme
```

#### 3. Ajouter Items (POST /api/galleries/{gallery_id}/items)
```
⏳ À CRÉER - Semaine 3
- Type (image|video), URL, titre, ordre
```

---

### Reviews & Avis (Plan client: "Avis et feedback")

**Modèle à créer:**
```python
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True)
    titre = Column(String(300), nullable=False)
    contenu = Column(Text, nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5 étoiles
    categorie = Column(String(200), nullable=False)  # sujet de la review
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    est_approuve = Column(Boolean, default=False)
    approuve_par_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    
    auteur = relationship("User", foreign_keys=[user_id])
    approuve_par = relationship("User", foreign_keys=[approuve_par_user_id])
```

#### 1. Lister Reviews (GET /api/reviews)
```
⏳ À CRÉER - Semaine 3-4
- Reviews approuvées seulement
- Pagination
- Filtrer par categorie, rating
```

#### 2. Créer Review (POST /api/reviews)
```
⏳ À CRÉER - Semaine 3-4
- Titre, contenu (opt), rating (1-5), categorie
- est_approuve = false par défaut
```

#### 3. Approuver Review (PATCH /api/reviews/{review_id}/approve - Modérateur)
```
⏳ À CRÉER - Semaine 3-4
- Modérateur approuve la review
```

---

## 🔔 Phase 8 : Notifications (Semaine 3)

### Système de Notifications

**Mo🎯 PRIORITÉ ABSOLUE (Semaine 1-2)

1. ✅ **Auth + Users** → Semaine 1 (en cours)
2. ✅ **Forum + Posts** → Semaine 1 (en cours)
3. 🔴 **Articles** → Semaine 2 (CRITIQUE pour home)
4. 🔴 **Annonces** → Semaine 2 (CRITIQUE pour home)
5. 📞 Points de synchronisation Frontend/Backend
- ✅ Noms des champs exactement comme en BD (snake_case JSON)
- ✅ Format des dates: ISO 8601 (YYYY-MM-DDTHH:MM:SS)
- ✅ Codes HTTP standardisés
- ✅ Structure des réponses d'erreur
- ✅ Pagination: skip, limit, total
- ✅ Response wrapper: `{success, data, message, pagination}`
- ✅ Images/vidéos: URLs Cloudinary uniquement
7. Tests des endpoints - Postman/Insomnia
8. Validation des données - Plus stricte
9. Gestion erreurs - Messages clairs au frontend
10. Documentation Swagger
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type_notification = Column(String(100))  # new_post, new_job, reply, etc
    titre = Column(String(300))
    message = Column(Text)
    lien_url = Column(String(500), nullable=True)
    est_lu = Column(Boolean, default=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
```

#### 1. Récupérer notifications (GET /api/notifications)
```
⏳ À CRÉER - Semaine 3
- Utilisateur voit ses notifications
- Filtrer: non-lues, toutes
```

#### 2. Marquer comme lu (PATCH /api/notifications/{id})
```
⏳ À CRÉER - Semaine 3
```

#### 3. Email notifications
```
⏳ À IMPLÉMENTER - Semaine 3
- Envoyer email quand:
  * Réponse à un post
  * Nouvelle offre d'emploi (matching critères)
  * Réponse à candidature
  * New expert added
```

## 💼 Phase 4 : Emplois (Semaine 3)

### Jobs - Endpoints à implémenter

#### 1. Lister Emplois (GET /api/jobs)
```
⏳ À FAIRE
- Tous les emplois actifs
- Filtrage par type_contrat, lieu
- Pagination
- Tri par date création (plus récent d'abord)
```

#### 2. Créer Emploi (POST /api/jobs)
```
⏳ À FAIRE
- Authentification requise
- Remplir: titre, entreprise, description, lieu, type_contrat, expire_le
- est_actif = true par défaut
```

#### 3. Mettre à jour Emploi (PUT /api/jobs/{job_id})
```
⏳ À FAIRE
- Seul créateur peut modifier
```

#### 4. Supprimer Emploi (DELETE /api/jobs/{job_id})
```
⏳ À FAIRE
- Seul créateur ou admin
```

---

## 🎙️ Phase 5 : Podcasts (Semaine 3)

### Podcasts - Endpoints à implémenter

#### 1. Lister Podcasts (GET /api/podcasts)
```
⏳ À FAIRE
- Tous les podcasts publiés
- Pagination
- Tri par date (plus récent)
```

#### 2. Créer Podcast (POST /api/podcasts)
```
⏳ À FAIRE
- Authentification requise
- Titre, description, audio_url (Cloudinary), couverture_url
- duree_secondes (optionnel)
- est_publie = false (attente admin)
```

#### 3. Supprimer Podcast (DELETE /api/podcasts/{podcast_id})
```
⏳ À FAIRE
- Seul auteur ou admin
```

#### 4. Publier/Dépublier (PATCH /api/podcasts/{podcast_id})
```
⏳ À FAIRE
- Admin change est_publie
```

---

## 📣 Phase 6 : Témoignages (Semaine 4)

### Temoignages - Endpoints à implémenter

#### 1. Lister Témoignages (GET /api/temoignages)
```
⏳ À FAIRE
- Tous les témoignages publiés
- Pagination
```

#### 2. Créer Témoignage (POST /api/temoignages)
```
⏳ À FAIRE
- Authentification requise
- Titre, contenu, photo_url (optionnel)
- est_publie = false (attente modération)
```

#### 3. Supprimer Témoignage (DELETE /api/temoignages/{temoignage_id})
```
⏳ À FAIRE
- Seul auteur ou modérateur
```

#### 4. Publier Témoignage (PATCH /api/temoignages/{temoignage_id} - Modérateur)
```
⏳ À FAIRE
- Modérateur valide et publie
```

---

## 🛡️ Fonctionnalités transversales

### Authentification JWT
```
✅ STRUCTURE DÉFINIE
- Access Token : 15 minutes de durée
- Refresh Token : 7 jours de durée
- Header: Authorization: Bearer {token}
```

### Middleware CORS
```
✅ CONFIGURÉ
- Frontend local: http://localhost:3000
- Production: https://ton-site.vercel.app (à adapter)
```

### Gestion des erreurs
```
⏳ À FINALISER
- 400 Bad Request : données invalides
- 401 Unauthorized : pas de token ou token invalide
- 403 Forbidden : pas de permission
- 404 Not Found : ressource inexistante
- 500 Internal Server Error : erreur serveur
```

### Pagination
```
⏳ À IMPLÉMENTER PARTOUT
- Paramètres: skip (défaut 0), limit (défaut 10, max 100)
- Retourner total count dans response
```

---

## 🔑 Permissions & Rôles

| Action | User | Modérateur | Admin |
|--------|------|-----------|-------|
| Créer post | ✅ | ✅ | ✅ |
| Modifier son post | ✅ | ✅ | ✅ |
| Supprimer post | ❌ | ✅ | ✅ |
| Publier un post | ❌ | ✅ | ✅ |
| Voir tous posts | ✅ | ✅ | ✅ |
| Gérer experts | ❌ | ❌ | ✅ |
| Gérer utilisateurs | ❌ | ❌ | ✅ |
| Accès admin panel | ❌ | ❌ | ✅ |

---

## 🐛 Points d'attention & Notes

### À faire prioritairement
1. **Tests des endpoints** - Postman/Insomnia
2. **Validation des données** - Plus stricte
3. **Gestion erreurs** - Messages clairs au frontend
4. **Documentation Swagger** - Auto-généré par FastAPI (/docs)

### Points de synchronisation Frontend/Backend
- ✅ Noms des champs exactement comme en BD (camelCase JSON ↔ snake_case Python)
- ✅ Format des dates: ISO 8601 (YYYY-MM-DDTHH:MM:SS)
- ✅ Codes HTTP standardisés
- ✅ Structure des réponses d'erreur

### Base de données
- Migrations: Alembic configuré
- Version initiale: `747fe4469fbc_initial_migration_create_all_tables.py`

---

## 📞 Communication

- **Issues:** Ouvrir une issue GitHub
- **Questions backend:** @backend-dev
- **Sync hebdo:** Mercredi 10h (à confirmer)

---

**Dernier update code:** [Date du commit]  
**Prochaine sync:** [À définir]
