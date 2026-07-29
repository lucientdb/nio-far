# 🚀 Démarrage Rapide - Nio Far

Guide complet pour lancer le projet backend + frontend

---

## 📋 Prérequis

### Backend (Python)
- Python 3.10+
- PostgreSQL (Supabase configuré)
- pip ou uv

### Frontend (Node.js)
- Node.js 18+
- npm ou yarn

---

## 🔧 Installation

### 1. Backend

```bash
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Vérifier que le .env est correct
cat .env  # ou notepad .env sur Windows

# Appliquer les migrations
alembic upgrade head

# Créer un admin (optionnel)
python create_admin.py
```

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local
```

---

## ▶️ Lancement

### Terminal 1 : Backend
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Serveur disponible** :
- 🌐 API : http://127.0.0.1:8000
- 📚 Documentation : http://127.0.0.1:8000/docs
- 🔍 API alternative : http://127.0.0.1:8000/redoc

### Terminal 2 : Frontend
```bash
cd frontend
npm run dev
```

**Application disponible** :
- 🌐 Site : http://localhost:3000

---

## 🧪 Vérification

### Backend fonctionne ?
```bash
curl http://127.0.0.1:8000/health
# Réponse attendue: {"status":"ok"}
```

### Frontend fonctionne ?
Ouvrir http://localhost:3000 dans le navigateur

---

## 👤 Comptes de test

### Créer un admin :
```bash
cd backend
python create_admin.py
```

Suivre les instructions pour créer un compte administrateur.

### Rôles disponibles :
- **user** : Utilisateur standard
- **expert** : Expert vérifié (médecin, juriste, etc.)
- **organisation** : Entreprise/ONG
- **moderateur** : Modérateur de contenu
- **admin** : Administrateur complet

---

## 🐛 Problèmes courants

### Backend ne démarre pas

**Erreur : "Python-dotenv could not parse"**
```bash
# Vérifier le fichier .env
cat backend/.env
# Assurez-vous qu'il n'y a pas de ligne bizarre au début
```

**Erreur : "ImportError: cannot import name"**
```bash
# Vérifier que tous les packages sont installés
cd backend
pip install -r requirements.txt
```

**Erreur : Database connection**
```bash
# Vérifier que DATABASE_URL est correct dans .env
# Vérifier que Supabase est accessible
```

### Frontend ne démarre pas

**Erreur : "Module not found"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Erreur : "CORS"**
```bash
# Vérifier que le backend est bien lancé sur :8000
# Vérifier que NEXT_PUBLIC_API_URL est correct dans .env.local
```

### Timeout sur les requêtes

**Le timeout est maintenant à 30 secondes**
- Vérifier que le backend répond sur http://127.0.0.1:8000/health
- Vérifier la connexion à Supabase

---

## 📚 Structure du projet

```
nio-far/
├── backend/           # API FastAPI
│   ├── alembic/      # Migrations database
│   ├── core/         # Auth & permissions
│   ├── models/       # Modèles SQLAlchemy
│   ├── routers/      # Endpoints API
│   ├── .env          # Config (DATABASE_URL, SECRET_KEY, etc.)
│   └── main.py       # Point d'entrée
│
├── frontend/         # Application Next.js
│   ├── app/          # Pages (App Router)
│   ├── components/   # Composants réutilisables
│   ├── services/     # Appels API
│   ├── lib/          # Utilitaires
│   └── hooks/        # Hooks personnalisés
│
└── docs/             # Documentation
```

---

## 🔑 Variables d'environnement

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=votre_clé_secrète_longue
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 🎯 Pages principales

### Publiques (accessibles sans compte) :
- `/` - Page d'accueil
- `/forum` - Forum communautaire (lecture seule)
- `/emploi` - Offres d'emploi
- `/education` - Ressources éducatives
- `/services` - Annuaire des services
- `/medias` - Podcasts et médias
- `/temoignages` - Témoignages

### Protégées (nécessitent un compte) :
- `/dashboard` - Tableau de bord personnalisé
- `/profil` - Profil utilisateur
- `/messages` - Messagerie privée
- `/dashboard/admin` - Admin uniquement
- `/dashboard/expert` - Experts uniquement
- `/dashboard/recruteur` - Organisations uniquement

---

## 📖 Documentation API

Une fois le backend lancé, accéder à :
- **Swagger UI** : http://127.0.0.1:8000/docs
- **ReDoc** : http://127.0.0.1:8000/redoc

---

## 🔐 Authentification

Le système utilise JWT (JSON Web Tokens) :
1. POST `/api/auth/register` - Créer un compte
2. POST `/api/auth/login` - Se connecter
3. Le token est stocké dans localStorage
4. Header automatique : `Authorization: Bearer <token>`

---

## 🎨 Design System

### Couleurs principales :
- **Primaire** : Vert émeraude (`emerald-600`, `emerald-700`)
- **Succès** : Vert (`green-600`)
- **Erreur** : Rouge (`red-500`, `red-600`)
- **Warning** : Ambre (`amber-600`)

### Composants utilitaires créés :
- `AuthPrompt` - Invitation à l'inscription
- `ErrorDisplay` - Affichage d'erreurs
- `LoadingSpinner` - Chargement
- `EmptyState` - État vide

---

## 📞 Support

**Erreurs backend** : Consulter `backend/FIXES.md`
**Erreurs frontend** : Consulter `frontend/CHANGELOG.md`
**Documentation composants** : Consulter `frontend/components/README.md`

---

**Version** : 1.3.0  
**Dernière mise à jour** : 2026-07-08
