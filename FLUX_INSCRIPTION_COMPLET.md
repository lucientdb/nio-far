# Flux d'inscription complet - Frontend → Backend → Base de données

## Vue d'ensemble
Ce document décrit le flux complet d'une inscription utilisateur depuis le frontend jusqu'à la base de données PostgreSQL.

## Schéma du flux

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Next.js)                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            Étape 1: Sélection            Étape 2: Formulaire
                    │                             │
          ┌─────────┴─────────┐         ┌────────┴────────┐
          │   Personne        │         │  Informations   │
          │   Organisation ───┼────────▶│  - Type org     │
          │   Expert          │         │  - Nom          │
          └───────────────────┘         │  - Email        │
                                        │  - Ville        │
                                        │  - Contact      │
                                        └────────┬────────┘
                                                 │
                                    Conversion frontend
                                                 │
                            ┌────────────────────┴────────────────────┐
                            │                                         │
                    organisation +        ville === "Autre"          │
                    type_organisation     ? ville_autre : ville       │
                            │                                         │
                            ▼                                         │
                    "recruteur" OU                                   │
                    "association"                                     │
                            │                                         │
                            └─────────────────┬─────────────────────┘
                                              │
                                        POST /api/auth/register
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI/Python)                       │
└─────────────────────────────────────────────────────────────────────┘
                                              │
                                    Validation Pydantic
                                              │
                                    UserCreate(BaseModel)
                                              │
                            ┌─────────────────┴─────────────────┐
                            │                                   │
                    profil: "recruteur"              ville: "Tambacounda"
                            │                                   │
                            ▼                                   │
                    PROFILE_TO_ROLE                            │
                            │                                   │
                    "recruteur" → UserRole.entreprise          │
                    "association" → UserRole.ong               │
                            │                                   │
                            └─────────────────┬─────────────────┘
                                              │
                                    Création objet User
                                              │
                                    SQLAlchemy ORM
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES (PostgreSQL)                      │
└─────────────────────────────────────────────────────────────────────┘
                                              │
                            INSERT INTO users (
                                role,            -- 'entreprise' ou 'ong'
                                ville,           -- 'Tambacounda'
                                entreprise_nom,  -- 'Mon Entreprise'
                                contact,         -- '+221 77 123 45 67'
                                ...
                            )
                                              │
                                              ▼
                                    ✅ Utilisateur créé
```

## Exemple concret : Inscription d'une entreprise

### 1️⃣ Frontend - Étape 1
```typescript
// Utilisateur clique sur "Organisation"
profil = "organisation"
```

### 2️⃣ Frontend - Étape 2
```typescript
// Utilisateur remplit le formulaire
{
  profil: "organisation",
  type_organisation: "entreprise",
  username: "tech_solutions",
  entreprise_nom: "Tech Solutions Sénégal",
  contact: "+221 77 123 45 67",
  email: "contact@techsolutions.sn",
  ville: "Autre",          // Sélection dropdown
  ville_autre: "Tambacounda",  // Saisie libre
  domaine_intervention: "Inclusion numérique",
  mot_de_passe: "SecurePass123!",
  confirm: "SecurePass123!",
  cgu: true
}
```

### 3️⃣ Frontend - Conversion avant envoi
```typescript
// Logique de conversion
const body = {
  profil: form.type_organisation === "entreprise" 
    ? "recruteur"      // ← Conversion ici
    : "association",
  username: "tech_solutions",
  entreprise_nom: "Tech Solutions Sénégal",
  contact: "+221 77 123 45 67",
  email: "contact@techsolutions.sn",
  ville: form.ville === "Autre" 
    ? form.ville_autre  // ← "Tambacounda"
    : form.ville,
  domaine_intervention: "Inclusion numérique",
  mot_de_passe: "SecurePass123!",
  // ... autres champs
}
```

### 4️⃣ API Request
```http
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "profil": "recruteur",
  "username": "tech_solutions",
  "entreprise_nom": "Tech Solutions Sénégal",
  "contact": "+221 77 123 45 67",
  "email": "contact@techsolutions.sn",
  "ville": "Tambacounda",
  "domaine_intervention": "Inclusion numérique",
  "mot_de_passe": "SecurePass123!",
  "nom": "",
  "prenom": "",
  "bio": ""
}
```

### 5️⃣ Backend - Validation
```python
# Schéma Pydantic valide les données
user_data = UserCreate(
    profil="recruteur",
    username="tech_solutions",
    entreprise_nom="Tech Solutions Sénégal",
    contact="+221 77 123 45 67",
    email="contact@techsolutions.sn",
    ville="Tambacounda",  # ✅ Accepte n'importe quelle chaîne
    domaine_intervention="Inclusion numérique",
    mot_de_passe="SecurePass123!",
    # ...
)
```

### 6️⃣ Backend - Mapping
```python
# Conversion profil → rôle
role = PROFILE_TO_ROLE.get("recruteur", UserRole.user)
# role = UserRole.entreprise

# Si organisation: utilise entreprise_nom pour nom/prenom
if role in (UserRole.entreprise, UserRole.ong):
    nom = user_data.entreprise_nom or ""
    prenom = user_data.entreprise_nom or ""
```

### 7️⃣ Backend - Création utilisateur
```python
new_user = User(
    nom="Tech Solutions Sénégal",
    prenom="Tech Solutions Sénégal",
    username="tech_solutions",
    email="contact@techsolutions.sn",
    mot_de_passe=hash_password("SecurePass123!"),
    role=UserRole.entreprise,  # ← Enum Python
    ville="Tambacounda",       # ← Ville personnalisée
    entreprise_nom="Tech Solutions Sénégal",
    contact="+221 77 123 45 67",
    domaine_intervention="Inclusion numérique",
    email_verified=False,
    est_actif=True,
)
db.add(new_user)
db.commit()
```

### 8️⃣ Base de données - SQL généré
```sql
INSERT INTO users (
    nom,
    prenom,
    username,
    email,
    mot_de_passe,
    role,                    -- Type: userrole (ENUM)
    ville,                   -- Type: VARCHAR(100)
    entreprise_nom,
    contact,
    domaine_intervention,
    email_verified,
    est_actif,
    cree_le
) VALUES (
    'Tech Solutions Sénégal',
    'Tech Solutions Sénégal',
    'tech_solutions',
    'contact@techsolutions.sn',
    '$2b$12$...',           -- Hash bcrypt
    'entreprise',            -- ← Valeur ENUM
    'Tambacounda',          -- ← Ville personnalisée
    'Tech Solutions Sénégal',
    '+221 77 123 45 67',
    'Inclusion numérique',
    false,
    true,
    NOW()
);
```

### 9️⃣ Résultat en base
```sql
-- Requête: SELECT * FROM users WHERE email = 'contact@techsolutions.sn'

id: 42
nom: "Tech Solutions Sénégal"
prenom: "Tech Solutions Sénégal"
username: "tech_solutions"
email: "contact@techsolutions.sn"
role: "entreprise"               -- ✅ Enum correct
ville: "Tambacounda"             -- ✅ Ville libre acceptée
entreprise_nom: "Tech Solutions Sénégal"
contact: "+221 77 123 45 67"
domaine_intervention: "Inclusion numérique"
email_verified: false
est_actif: true
cree_le: "2026-08-11 14:30:00+00"
```

## Cas d'usage : Tous les types

### Personne avec ville prédéfinie
```
Frontend:
  profil = "personne"
  ville = "Dakar"
  
→ Backend:
  role = UserRole.user
  ville = "Dakar"
  
→ Base de données:
  role = 'user'
  ville = 'Dakar'
```

### Expert avec ville personnalisée
```
Frontend:
  profil = "expert"
  ville = "Autre"
  ville_autre = "Kolda"
  
→ Backend:
  role = UserRole.expert
  ville = "Kolda"
  
→ Base de données:
  role = 'expert'
  ville = 'Kolda'
```

### Organisation (ONG) avec ville prédéfinie
```
Frontend:
  profil = "organisation"
  type_organisation = "ong"
  ville = "Saint-Louis"
  
→ Backend (conversion):
  profil = "association"
  role = UserRole.ong
  ville = "Saint-Louis"
  
→ Base de données:
  role = 'ong'
  ville = 'Saint-Louis'
```

### Organisation (Entreprise) avec ville personnalisée
```
Frontend:
  profil = "organisation"
  type_organisation = "entreprise"
  ville = "Autre"
  ville_autre = "Kédougou"
  
→ Backend (conversion):
  profil = "recruteur"
  role = UserRole.entreprise
  ville = "Kédougou"
  
→ Base de données:
  role = 'entreprise'
  ville = 'Kédougou'
```

## Points clés de validation

### ✅ Ville
- **Frontend** : Liste de 8 villes + "Autre"
- **Conversion** : `ville === "Autre" ? ville_autre : ville`
- **Backend** : `Optional[str]` - accepte toute chaîne
- **Base de données** : `VARCHAR(100)` - 100 caractères max

### ✅ Type d'organisation
- **Frontend** : Sélection dropdown (entreprise, ong, association)
- **Conversion** : `type_organisation === "entreprise" ? "recruteur" : "association"`
- **Backend** : Profil `"recruteur"` ou `"association"`
- **Mapping** : `"recruteur"` → `UserRole.entreprise`, `"association"` → `UserRole.ong`
- **Base de données** : Enum `'entreprise'` ou `'ong'`

## Sécurité

### Hashing du mot de passe
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Au moment de l'inscription
hashed = pwd_context.hash("SecurePass123!")
# → "$2b$12$K8JxU4..."

# Stocké en base
mot_de_passe = "$2b$12$K8JxU4..."  # VARCHAR(255)
```

### Validation email
```python
from pydantic import EmailStr

# Pydantic valide automatiquement le format
email: EmailStr = "contact@techsolutions.sn"  # ✅
email: EmailStr = "invalid-email"             # ❌ ValidationError
```

## Gestion des erreurs

### Email déjà utilisé
```python
existing = db.query(User).filter(User.email == user_data.email).first()
if existing and existing.email_verified:
    raise HTTPException(
        status_code=400,
        detail="Un utilisateur avec cet email existe déjà"
    )
```

### Compte en attente
```python
if existing and not existing.email_verified:
    # Mise à jour des informations et renvoi du code OTP
    existing.mot_de_passe = hash_password(user_data.mot_de_passe)
    existing.ville = user_data.ville
    # ...
    db.commit()
```

## Vérification email (Étape suivante)

Après l'inscription, l'utilisateur doit vérifier son email avec un code OTP :

```
POST /api/auth/verify-email
{
  "email": "contact@techsolutions.sn",
  "code": "123456"
}

→ Si code valide:
  - email_verified = true
  - Génération JWT tokens
  - Connexion automatique
```

## Statut final

✅ **Flux complet validé**
✅ **Compatibilité frontend → backend → BDD**
✅ **Saisie libre de ville supportée**
✅ **Fusion organisations transparente**
✅ **Sécurité implémentée (hash, validation)**

## Fichiers impliqués

### Frontend
- `app/inscription/page.tsx` - Interface et logique

### Backend
- `routers/auth.py` - Routes et schémas
- `models/user.py` - Modèle SQLAlchemy
- `core/permissions.py` - Mapping profil → rôle
- `core/security.py` - Hash mot de passe

### Base de données
- `alembic/versions/a1b2c3d4e5f6_*.py` - Migration rôles + ville
