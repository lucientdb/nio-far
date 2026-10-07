"""
Authentification Nio-Far — inscription avec validation email par code OTP.
"""
import hashlib
import hmac
import logging
import random
from datetime import datetime, timedelta
from typing import Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models import User, Verification
from models.user import UserRole
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from core.permissions import PROFILE_TO_ROLE
from core.email_service import send_signup_otp, EmailSendError

router = APIRouter()
logger = logging.getLogger("auth")

OTP_TYPE = "signup_otp"
OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5


class UserCreate(BaseModel):
    nom: str
    prenom: str
    username: Optional[str] = None
    email: EmailStr
    mot_de_passe: str
    profil: Optional[Literal["personne", "association", "recruteur", "expert"]] = "personne"
    type_handicap: Optional[str] = None
    bio: Optional[str] = None
    ville: Optional[str] = None
    entreprise_nom: Optional[str] = None
    contact: Optional[str] = None
    domaine_intervention: Optional[str] = None
    specialite: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    mot_de_passe: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ResendCodeRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RegisterPendingResponse(BaseModel):
    requires_verification: bool = True
    email: str
    message: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "nom": user.nom,
        "username": getattr(user, "username", None),
        "prenom": user.prenom,
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else user.role,
        "avatar_url": user.avatar_url,
        "ville": user.ville,
        "email_verified": bool(getattr(user, "email_verified", False)),
        "entreprise_nom": getattr(user, "entreprise_nom", None),
        "contact": getattr(user, "contact", None),
        "domaine_intervention": getattr(user, "domaine_intervention", None),
        "specialite": getattr(user, "specialite", None),
    }


def _issue_tokens(user: User) -> TokenResponse:
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_payload(user),
    )


def _create_and_send_otp(db: Session, user: User) -> None:
    db.query(Verification).filter(
        Verification.user_id == user.id,
        Verification.type == OTP_TYPE,
        Verification.status == "pending",
    ).update({"status": "expired"})

    code = f"{random.randint(100000, 999999)}"
    verification = Verification(
        user_id=user.id,
        type=OTP_TYPE,
        token_hash=_hash_code(code),
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_TTL_MINUTES),
        status="pending",
        meta={"email": user.email},
    )
    db.add(verification)
    db.commit()

    try:
        send_signup_otp(user.email, code, prenom=user.prenom)
    except EmailSendError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    logger.info("OTP signup envoyé à user_id=%s", user.id)


def _verify_otp(db: Session, user: User, code: str) -> None:
    verification = (
        db.query(Verification)
        .filter(
            Verification.user_id == user.id,
            Verification.type == OTP_TYPE,
            Verification.status == "pending",
        )
        .order_by(Verification.id.desc())
        .first()
    )
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun code en cours. Demandez un nouveau code.",
        )

    if verification.expires_at.replace(tzinfo=None) < datetime.utcnow():
        verification.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le code a expiré. Demandez un nouveau code.",
        )

    verification.attempts = (verification.attempts or 0) + 1
    if verification.attempts > OTP_MAX_ATTEMPTS:
        verification.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trop de tentatives. Demandez un nouveau code.",
        )

    if not hmac.compare_digest(verification.token_hash, _hash_code(code.strip())):
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code incorrect.",
        )

    verification.status = "completed"
    verification.used_at = datetime.utcnow()
    user.email_verified = True
    db.commit()
    db.refresh(user)


@router.post("/register", response_model=RegisterPendingResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Crée le compte (non vérifié) et envoie un code à 6 chiffres par email.
    Les tokens JWT ne sont délivrés qu'après POST /verify-email.
    """
    try:
        existing = db.query(User).filter(User.email == user_data.email.lower()).first()
        if not existing:
            existing = db.query(User).filter(User.email == user_data.email).first()

        if existing and existing.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà",
            )

        if existing and not existing.email_verified:
            # Compte en attente : mettre à jour le mot de passe / infos et renvoyer le code
            existing.nom = user_data.nom
            existing.prenom = user_data.prenom
            existing.username = user_data.username
            existing.mot_de_passe = hash_password(user_data.mot_de_passe)
            existing.role = PROFILE_TO_ROLE.get(user_data.profil or "personne", UserRole.user)
            existing.type_handicap = user_data.type_handicap
            existing.bio = user_data.bio
            existing.ville = user_data.ville
            existing.entreprise_nom = user_data.entreprise_nom
            existing.contact = user_data.contact
            existing.domaine_intervention = user_data.domaine_intervention
            existing.specialite = user_data.specialite
            db.commit()
            db.refresh(existing)
            _create_and_send_otp(db, existing)
            return RegisterPendingResponse(
                email=existing.email,
                message="Un nouveau code de vérification a été envoyé à votre adresse email.",
            )

        role = PROFILE_TO_ROLE.get(user_data.profil or "personne", UserRole.user)
        nom = user_data.nom
        prenom = user_data.prenom
        if role in (UserRole.entreprise, UserRole.ong):
            org = (user_data.entreprise_nom or "").strip()
            if not (nom or "").strip():
                nom = org
            if not (prenom or "").strip():
                prenom = org
        new_user = User(
            nom=nom or "",
            prenom=prenom or "",
            username=user_data.username,
            email=user_data.email.lower(),
            mot_de_passe=hash_password(user_data.mot_de_passe),
            role=role,
            type_handicap=user_data.type_handicap,
            bio=user_data.bio,
            ville=user_data.ville,
            entreprise_nom=user_data.entreprise_nom,
            contact=user_data.contact,
            domaine_intervention=user_data.domaine_intervention,
            specialite=user_data.specialite,
            email_verified=False,
            est_actif=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        _create_and_send_otp(db, new_user)

        return RegisterPendingResponse(
            email=new_user.email,
            message="Compte créé. Entrez le code reçu par email pour activer votre compte.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        print("Register error:", repr(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )


@router.post("/verify-email", response_model=TokenResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Valide le code OTP et connecte l'utilisateur."""
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Aucun compte trouvé pour cet email.")

    if user.email_verified:
        return _issue_tokens(user)

    _verify_otp(db, user, payload.code)
    return _issue_tokens(user)


@router.post("/resend-code", response_model=RegisterPendingResponse)
def resend_code(payload: ResendCodeRequest, db: Session = Depends(get_db)):
    """Renvoie un code OTP pour un compte non vérifié."""
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Aucun compte trouvé pour cet email.")

    if user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà vérifié. Vous pouvez vous connecter.",
        )

    _create_and_send_otp(db, user)
    return RegisterPendingResponse(
        email=user.email,
        message="Un nouveau code a été envoyé à votre adresse email.",
    )


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    email = user_data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.mot_de_passe, user.mot_de_passe):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    if not user.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte a été désactivé",
        )

    if not getattr(user, "email_verified", False):
        _create_and_send_otp(db, user)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "email_not_verified",
                "message": "Votre email n'est pas encore vérifié. Un code vient de vous être envoyé.",
                "email": user.email,
                "requires_verification": True,
            },
        )

    return _issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        payload = verify_refresh_token(request.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide ou expiré",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.est_actif:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable ou compte désactivé",
        )

    if not getattr(user, "email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email non vérifié",
        )

    return _issue_tokens(user)
