from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from core.security import decode_token
from jose import JWTError
from pydantic import BaseModel, EmailStr
from typing import Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Créer le router pour les routes utilisateurs
router = APIRouter()

# Sécurité : vérification du token JWT
security = HTTPBearer()

# Modèles Pydantic pour les requêtes et réponses

class UserProfile(BaseModel):
    """Modèle pour les informations de profil utilisateur"""
    id: int
    nom: str
    prenom: str
    email: EmailStr
    role: str
    est_actif: bool
    avatar_url: Optional[str]
    bio: Optional[str]
    type_handicap: Optional[str]
    cree_le: Optional[str]  # Date en string pour la sérialisation JSON

class UserUpdate(BaseModel):
    """Modèle pour mettre à jour le profil utilisateur"""
    nom: Optional[str] = None
    prenom: Optional[str] = None
    bio: Optional[str] = None
    type_handicap: Optional[str] = None
    avatar_url: Optional[str] = None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    """
    Dépendance FastAPI : récupère l'utilisateur actuel depuis le token JWT
    """
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload.get("sub"))

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé"
            )

        if not user.est_actif:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce compte a été désactivé"
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré"
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token malformé"
        )

# Routes utilisateurs

@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Récupérer son propre profil
    """
    return UserProfile(
        id=current_user.id,
        nom=current_user.nom,
        prenom=current_user.prenom,
        email=current_user.email,
        role=current_user.role.value,
        est_actif=current_user.est_actif,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
        type_handicap=current_user.type_handicap,
        cree_le=current_user.cree_le.isoformat() if current_user.cree_le else None
    )

@router.put("/me", response_model=UserProfile)
def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour son propre profil
    """
    # Mettre à jour seulement les champs fournis
    update_data = user_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return UserProfile(
        id=current_user.id,
        nom=current_user.nom,
        prenom=current_user.prenom,
        email=current_user.email,
        role=current_user.role.value,
        est_actif=current_user.est_actif,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
        type_handicap=current_user.type_handicap,
        cree_le=current_user.cree_le.isoformat() if current_user.cree_le else None
    )

@router.get("/profile/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Récupérer le profil public d'un utilisateur (sans informations sensibles)
    """
    user = db.query(User).filter(User.id == user_id, User.est_actif == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    return UserProfile(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        role=user.role.value,
        est_actif=user.est_actif,
        avatar_url=user.avatar_url,
        bio=user.bio,
        type_handicap=user.type_handicap,
        cree_le=user.cree_le.isoformat() if user.cree_le else None
    )