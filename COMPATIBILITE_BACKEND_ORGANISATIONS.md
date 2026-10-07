# Compatibilité Backend - Fusion des Organisations

## Vue d'ensemble
Ce document détaille comment la fusion frontend des types "Association/ONG" et "Entreprise/Recruteur" en un seul type "Organisation" est compatible avec le backend et la base de données.

## Architecture actuelle

### 1. Base de données (PostgreSQL)

**Enum `userrole` :**
```sql
CREATE TYPE userrole AS ENUM (
    'user',
    'expert',
    'entreprise',
    'ong',
    'admin'
);
```

**Table `users` :**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role userrole DEFAULT 'user',
    ville VARCHAR(100),              -- ✅ Supporte saisie libre
    entreprise_nom VARCHAR(200),
    contact VARCHAR(100),
    domaine_intervention VARCHAR(300),
    -- ... autres champs
);
```

### 2. Modèle SQLAlchemy

**Fichier :** `backend/models/user.py`

```python
class UserRole(str, enum.Enum):
    user = "user"
    expert = "expert"
    entreprise = "entreprise"  # ✅ Rôle distinct
    ong = "ong"                # ✅ Rôle distinct
    admin = "admin"

class User(Base):
    ville = Column(String(100), nullable=True)  # ✅ Accepte toute ville
    entreprise_nom = Column(String(200), nullable=True)
    contact = Column(String(100), nullable=True)
    domaine_intervention = Column(String(300), nullable=True)
```

### 3. Schéma Pydantic

**Fichier :** `backend/routers/auth.py`

```python
class UserCreate(BaseModel):
    profil: Optional[Literal["personne", "association", "recruteur", "expert"]]
    ville: Optional[str] = None  # ✅ Accepte n'importe quelle chaîne
    entreprise_nom: Optional[str] = None
    contact: Optional[str] = None
    domaine_intervention: Optional[str] = None
```

### 4. Mapping Profil → Rôle

**Fichier :** `backend/core/permissions.py`

```python
PROFILE_TO_ROLE = {
    "personne": UserRole.user,
    "association": UserRole.ong,      # ✅ ONG/Association → ong
    "recruteur": UserRole.entreprise, # ✅ Entreprise → entreprise
    "expert": UserRole.expert,
}
```

## Flux complet : Frontend → Backend → Base de données

### Cas 1 : Entreprise / Recruteur

#### Frontend
```typescript
// Utilisateur sélectionne "Organisation" puis "Entreprise"
profil = "organisation"
type_organisation = "entreprise"

// Conversion frontend → backend
profil: "recruteur"  // Envoyé à l'API
```

#### Backend
```python
# Route /api/auth/register
user_data.profil = "recruteur"

# Conversion profil → rôle
role = PROFILE_TO_ROLE["recruteur"]  # → UserRole.entreprise
```

#### Base de données
```sql
INSERT INTO users (role, ...) VALUES ('entreprise', ...);
```

### Cas 2 : ONG / Association

#### Frontend
```typescript
// Utilisateur sélectionne "Organisation" puis "ONG" ou "Association"
profil = "organisation"
type_organisation = "ong" OU "association"

// Conversion frontend → backend
profil: "association"  // Envoyé à l'API (peu importe si ong ou association)
```

#### Backend
```python
# Route /api/auth/register
user_data.profil = "association"

# Conversion profil → rôle
role = PROFILE_TO_ROLE["association"]  # → UserRole.ong
```

#### Base de données
```sql
INSERT INTO users (role, ...) VALUES ('ong', ...);
```

## Gestion de la ville personnalisée

### Frontend
```typescript
// Utilisateur sélectionne "Autre" et saisit "Tambacounda"
ville = "Autre"
ville_autre = "Tambacounda"

// Logique d'envoi
body: {
  ville: form.ville === "Autre" ? form.ville_autre : form.ville
  // → ville: "Tambacounda"
}
```

### Backend
```python
# Route /api/auth/register
user_data.ville = "Tambacounda"  # String quelconque

# Création utilisateur
new_user = User(
    ville=user_data.ville,  # → "Tambacounda"
    ...
)
```

### Base de données
```sql
INSERT INTO users (ville, ...) VALUES ('Tambacounda', ...);
```

**Type de colonne :** `VARCHAR(100)` → Accepte n'importe quelle chaîne jusqu'à 100 caractères ✅

## Permissions et accès

### Publication d'offres d'emploi

```python
# Fichier: backend/core/permissions.py
JOB_POSTER_ROLES = {UserRole.entreprise, UserRole.ong, UserRole.admin}
```

**Résultat :**
- ✅ Entreprise (role='entreprise') → Peut publier des offres
- ✅ ONG (role='ong') → Peut publier des offres
- ✅ Association (role='ong') → Peut publier des offres

### Modération de forums

```python
MODERATOR_ROLES = {UserRole.expert, UserRole.admin}
```

Les organisations ne sont pas modérateurs (comportement attendu).

## Migrations Alembic

### Migration initiale
**Fichier :** `747fe4469fbc_initial_migration_create_all_tables.py`
```python
# Enum initial
sa.Enum('user', 'moderateur', 'admin', name='userrole')
```

### Migration des rôles
**Fichier :** `a1b2c3d4e5f6_add_roles_forums_likes_podcast_format.py`
```python
# Ajout des nouveaux rôles
op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'expert'")
op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'entreprise'")
op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ong'")

# Ajout du champ ville
op.add_column("users", sa.Column("ville", sa.String(length=100), nullable=True))
```

**Statut :** ✅ Migrations appliquées et compatibles

## Vérifications de compatibilité

### ✅ Base de données
- [x] Enum `userrole` contient `'entreprise'` et `'ong'`
- [x] Colonne `ville` de type `VARCHAR(100)` accepte toute chaîne
- [x] Colonne `entreprise_nom` pour le nom de l'organisation
- [x] Colonne `contact` pour le téléphone
- [x] Colonne `domaine_intervention` pour l'activité

### ✅ Backend
- [x] Schéma `UserCreate` accepte `profil` avec valeurs `"association"` et `"recruteur"`
- [x] Schéma `UserCreate` accepte `ville` comme `Optional[str]`
- [x] Mapping `PROFILE_TO_ROLE` convertit correctement les profils
- [x] Route `/api/auth/register` enregistre le rôle et la ville
- [x] Permissions `JOB_POSTER_ROLES` incluent `entreprise` et `ong`

### ✅ Frontend
- [x] Type `"organisation"` unifié à l'étape 1
- [x] Champ `type_organisation` pour préciser le sous-type
- [x] Conversion automatique `organisation` → `"recruteur"` ou `"association"`
- [x] Champ `ville_autre` pour saisie libre
- [x] Logique d'envoi `ville === "Autre" ? ville_autre : ville`

## Tableau récapitulatif

| Frontend (Étape 1) | Frontend (Étape 2) | Envoyé à l'API | Backend (Role) | Base de données |
|-------------------|-------------------|----------------|----------------|-----------------|
| Organisation      | Entreprise        | `"recruteur"`  | `entreprise`   | `'entreprise'`  |
| Organisation      | ONG               | `"association"`| `ong`          | `'ong'`         |
| Organisation      | Association       | `"association"`| `ong`          | `'ong'`         |
| Personne          | -                 | `"personne"`   | `user`         | `'user'`        |
| Expert            | -                 | `"expert"`     | `expert`       | `'expert'`      |

## Conclusion

### ✅ Compatibilité complète

1. **Base de données** : Les enums et colonnes supportent tous les cas
2. **Backend** : Le mapping et les permissions fonctionnent correctement
3. **Frontend** : La conversion est transparente pour l'utilisateur
4. **Ville personnalisée** : Prise en charge de bout en bout

### 🎯 Avantages de l'architecture actuelle

- **Séparation en base** : Les rôles `entreprise` et `ong` restent distincts pour les permissions
- **Unification UX** : Le frontend présente une interface simplifiée
- **Flexibilité** : Possibilité de différencier les permissions par la suite
- **Évolutivité** : Facile d'ajouter de nouveaux sous-types d'organisations

### 📝 Notes importantes

- Le backend **ne reçoit jamais** le type frontend `"organisation"` 
- La conversion se fait **côté frontend** avant l'envoi
- Les migrations existantes sont **suffisantes**, aucune nouvelle migration nécessaire
- La ville personnalisée est **directement stockée** sans transformation

## Fichiers impliqués

### Backend
- `backend/models/user.py` - Enum et modèle User
- `backend/core/permissions.py` - Mapping profil → rôle
- `backend/routers/auth.py` - Schémas et route d'inscription
- `backend/alembic/versions/a1b2c3d4e5f6_*.py` - Migration des rôles

### Frontend
- `frontend/app/inscription/page.tsx` - Interface et logique de conversion

## Statut

✅ **Entièrement compatible** - Aucune modification backend requise
✅ **Testé** - Flux complet validé
✅ **Documenté** - Architecture claire et maintenue
