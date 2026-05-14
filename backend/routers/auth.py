from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_refresh_token
from jose import JWTError
from pydantic import BaseModel, EmailStr
from typing import Optional

# Créer le router pour les routes d'authentification
router = APIRouter()

# Modèles Pydantic pour les requêtes et réponses

class UserCreate(BaseModel):
    """Modèle pour l'inscription d'un nouvel utilisateur"""
    nom: str
    prenom: str
    email: EmailStr
    mot_de_passe: str
    type_handicap: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    """Modèle pour la connexion"""
    email: EmailStr
    mot_de_passe: str

class TokenResponse(BaseModel):
    """Modèle pour la réponse avec tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict  # Informations de base de l'utilisateur

class RefreshTokenRequest(BaseModel):
    """Modèle pour rafraîchir un token"""
    refresh_token: str

# Routes d'authentification

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Inscrire un nouvel utilisateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )

    # Créer le nouvel utilisateur
    hashed_password = hash_password(user_data.mot_de_passe)
    new_user = User(
        nom=user_data.nom,
        prenom=user_data.prenom,
        email=user_data.email,
        mot_de_passe=hashed_password,
        type_handicap=user_data.type_handicap,
        bio=user_data.bio
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Créer les tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": new_user.id,
            "nom": new_user.nom,
            "prenom": new_user.prenom,
            "email": new_user.email,
            "role": new_user.role.value,
            "avatar_url": new_user.avatar_url
        }
    )

@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Connecter un utilisateur existant
    """
    # Trouver l'utilisateur par email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    # Vérifier le mot de passe
    if not verify_password(user_data.mot_de_passe, user.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    # Vérifier si le compte est actif
    if not user.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte a été désactivé"
        )

    # Créer les tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role.value,
            "avatar_url": user.avatar_url
        }
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Rafraîchir un token d'accès avec un refresh token
    """
    try:
        # Vérifier et décoder le refresh token
        payload = verify_refresh_token(request.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide ou expiré"
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.est_actif:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable ou compte désactivé"
        )

    # Créer de nouveaux tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role.value,
            "avatar_url": user.avatar_url
        }
    )