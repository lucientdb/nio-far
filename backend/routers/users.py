from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Post, Like
from models.user import UserRole
from core.deps import get_current_user
from core.permissions import require_roles
from core.security import verify_password, hash_password
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()


class UserStats(BaseModel):
    publications: int = 0
    likesRecus: int = 0
    vues: int = 0


class UserProfile(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    username: Optional[str]
    role: str
    est_actif: bool
    avatar_url: Optional[str]
    bio: Optional[str]
    type_handicap: Optional[str]
    ville: Optional[str]
    # Champs entreprises / experts
    entreprise_nom: Optional[str] = None
    contact: Optional[str] = None
    domaine_intervention: Optional[str] = None
    specialite: Optional[str] = None
    is_verified: bool = False
    verification_type: Optional[str] = None
    verified_at: Optional[str] = None
    pro_email: Optional[str] = None
    stats: Optional[UserStats] = None
    cree_le: Optional[str]


class UserUpdate(BaseModel):
    nom: Optional[str] = None
    username: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    type_handicap: Optional[str] = None
    avatar_url: Optional[str] = None
    ville: Optional[str] = None
    # Champs modifiables pour entreprises / experts
    entreprise_nom: Optional[str] = None
    contact: Optional[str] = None
    domaine_intervention: Optional[str] = None
    specialite: Optional[str] = None


class RoleUpdate(BaseModel):
    role: str


class PasswordUpdate(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str


def _profile(user: User, db: Optional[Session] = None) -> UserProfile:
    stats = None
    if db:
        publications = db.query(func.count(Post.id)).filter(Post.user_id == user.id, Post.est_publie == True).scalar() or 0
        likes_recus = db.query(func.count(Like.id)).join(Post).filter(Post.user_id == user.id).scalar() or 0
        vues = db.query(func.sum(Post.vues)).filter(Post.user_id == user.id).scalar() or 0
        
        stats = UserStats(
            publications=publications,
            likesRecus=likes_recus,
            vues=vues
        )

    return UserProfile(
        id=user.id,
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        username=user.username,
        role=user.role.value,
        est_actif=user.est_actif,
        avatar_url=user.avatar_url,
        bio=user.bio,
        type_handicap=user.type_handicap,
        ville=user.ville,
        entreprise_nom=user.entreprise_nom,
        contact=user.contact,
        domaine_intervention=user.domaine_intervention,
        specialite=user.specialite,
        is_verified=bool(user.is_verified),
        verification_type=user.verification_type,
        verified_at=user.verified_at.isoformat() if user.verified_at else None,
        pro_email=user.pro_email,
        stats=stats,
        cree_le=user.cree_le.isoformat() if user.cree_le else None,
    )


@router.get("/me", response_model=UserProfile)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _profile(current_user, db)


@router.put("/me", response_model=UserProfile)
def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from sqlalchemy.exc import IntegrityError

    data = user_data.model_dump(exclude_unset=True)

    # Normalize optional blank strings
    if "username" in data and data["username"] is not None:
        data["username"] = data["username"].strip() or None

    # Org accounts often have empty nom/prenom — keep NOT NULL columns valid
    if current_user.role in (UserRole.entreprise, UserRole.ong):
        org_name = (data.get("entreprise_nom") or current_user.entreprise_nom or "").strip()
        if "nom" in data and not (data["nom"] or "").strip():
            data["nom"] = org_name or current_user.nom or ""
        if "prenom" in data and not (data["prenom"] or "").strip():
            data["prenom"] = org_name or current_user.prenom or ""
        if data.get("nom") is None:
            data["nom"] = org_name or current_user.nom or ""
        if data.get("prenom") is None:
            data["prenom"] = org_name or current_user.prenom or ""

    for required in ("nom", "prenom"):
        if required in data and data[required] is None:
            data[required] = current_user.nom if required == "nom" else current_user.prenom
            if data[required] is None:
                data[required] = ""

    if data.get("username"):
        taken = (
            db.query(User)
            .filter(
                func.lower(User.username) == data["username"].lower(),
                User.id != current_user.id,
            )
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris")
    if data.get("email"):
        taken = (
            db.query(User)
            .filter(
                func.lower(User.email) == str(data["email"]).lower(),
                User.id != current_user.id,
            )
            .first()
        )
        if taken:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    for field, value in data.items():
        setattr(current_user, field, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        err = str(getattr(exc, "orig", exc)).lower()
        if "username" in err:
            raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris")
        if "email" in err:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        if "not-null" in err or "null value" in err:
            raise HTTPException(status_code=400, detail="Le nom et le prénom sont obligatoires")
        raise HTTPException(status_code=400, detail="Impossible de mettre à jour le profil")
    db.refresh(current_user)
    return _profile(current_user, db)


@router.put("/me/password")
def update_password(
    data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.ancien_mot_de_passe, current_user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    
    current_user.mot_de_passe = hash_password(data.nouveau_mot_de_passe)
    db.commit()
    return {"message": "Mot de passe mis à jour"}


@router.get("/profile/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.est_actif == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return _profile(user, db)


@router.get("/search", response_model=list[dict])
def search_users(q: str = "", db: Session = Depends(get_db)):
    if not q.strip():
        return []
    query = f"%{q.strip().lower()}%"
    users = (
        db.query(User)
        .filter(
            User.est_actif == True,
            (func.lower(User.nom).like(query)) |
            (func.lower(User.prenom).like(query)) |
            (func.lower(User.username).like(query))
        )
        .limit(10)
        .all()
    )
    from schemas.helpers import user_brief
    return [user_brief(u) for u in users]


@router.put("/{user_id}/role", response_model=UserProfile)
def update_user_role(
    user_id: int,
    data: RoleUpdate,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    try:
        user.role = UserRole(data.role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Rôle invalide")

    db.commit()
    db.refresh(user)
    return _profile(user, db)
