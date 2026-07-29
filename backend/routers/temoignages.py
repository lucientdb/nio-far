from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

from database import get_db
from models import User, Temoignage
from models.user import UserRole
from core.deps import get_current_user
from core.permissions import require_roles

router = APIRouter()

SERVICES = ("forum", "emploi", "education", "medias", "services")


class TemoignageResponse(BaseModel):
    id: int
    titre: str
    contenu: str
    note: Optional[int]
    service: Optional[str]
    photo_url: Optional[str]
    est_publie: bool
    auteur: dict
    cree_le: str


class TemoignageCreate(BaseModel):
    titre: str
    contenu: str
    note: int = Field(ge=1, le=5)
    service: Literal["forum", "emploi", "education", "medias", "services"]
    photo_url: Optional[str] = None


class TemoignageUpdate(BaseModel):
    titre: Optional[str] = None
    contenu: Optional[str] = None
    note: Optional[int] = Field(default=None, ge=1, le=5)
    service: Optional[str] = None
    photo_url: Optional[str] = None


def _temoignage_dict(t: Temoignage) -> dict:
    return {
        "id": t.id,
        "titre": t.titre,
        "contenu": t.contenu,
        "note": t.note,
        "service": t.service,
        "photo_url": t.photo_url,
        "est_publie": t.est_publie,
        "auteur": {
            "id": t.auteur.id,
            "nom": t.auteur.nom,
            "prenom": t.auteur.prenom,
            "avatar_url": t.auteur.avatar_url,
        },
        "cree_le": t.cree_le.isoformat(),
    }


@router.get("/services")
def list_services():
    return [
        {"id": "forum", "label": "Forum communautaire"},
        {"id": "emploi", "label": "Offres d'emploi"},
        {"id": "education", "label": "Ressources éducatives"},
        {"id": "medias", "label": "Podcasts & Médias"},
        {"id": "services", "label": "Annuaire de services"},
    ]


@router.get("/", response_model=List[TemoignageResponse])
def get_temoignages(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    service: Optional[str] = None,
    published_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    query = db.query(Temoignage).options(joinedload(Temoignage.auteur))
    if published_only:
        query = query.filter(Temoignage.est_publie == True)
    if service:
        query = query.filter(Temoignage.service == service)

    items = query.order_by(Temoignage.cree_le.desc()).offset(skip).limit(limit).all()
    return [_temoignage_dict(t) for t in items]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Moyenne des notes par service."""
    from sqlalchemy import func

    rows = (
        db.query(Temoignage.service, func.avg(Temoignage.note), func.count(Temoignage.id))
        .filter(Temoignage.est_publie == True, Temoignage.note.isnot(None))
        .group_by(Temoignage.service)
        .all()
    )
    return {
        "par_service": [
            {"service": r[0], "moyenne": round(float(r[1]), 1), "count": r[2]}
            for r in rows if r[0]
        ]
    }


@router.get("/me")
def my_temoignages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Temoignage)
        .options(joinedload(Temoignage.auteur))
        .filter(Temoignage.user_id == current_user.id)
        .order_by(Temoignage.cree_le.desc())
        .all()
    )
    return [_temoignage_dict(t) for t in items]


@router.get("/{temoignage_id}", response_model=TemoignageResponse)
def get_temoignage(temoignage_id: int, db: Session = Depends(get_db)):
    t = (
        db.query(Temoignage)
        .options(joinedload(Temoignage.auteur))
        .filter(Temoignage.id == temoignage_id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    return _temoignage_dict(t)


@router.post("/", response_model=TemoignageResponse, status_code=status.HTTP_201_CREATED)
def create_temoignage(
    data: TemoignageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Tout utilisateur connecté peut témoigner et noter un service."""
    t = Temoignage(
        titre=data.titre,
        contenu=data.contenu,
        note=data.note,
        service=data.service,
        photo_url=data.photo_url,
        user_id=current_user.id,
        est_publie=True,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    t.auteur = current_user
    return _temoignage_dict(t)


@router.put("/{temoignage_id}", response_model=TemoignageResponse)
def update_temoignage(
    temoignage_id: int,
    data: TemoignageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Temoignage).options(joinedload(Temoignage.auteur)).filter(Temoignage.id == temoignage_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    if t.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Modification non autorisée")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(t, field, value)
    db.commit()
    db.refresh(t)
    return _temoignage_dict(t)


@router.delete("/{temoignage_id}")
def delete_temoignage(
    temoignage_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    if t.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Suppression non autorisée")

    db.delete(t)
    db.commit()
    return {"message": "Témoignage supprimé"}


@router.put("/{temoignage_id}/publish")
def publish_temoignage(
    temoignage_id: int,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    t = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    t.est_publie = True
    db.commit()
    return {"message": "Témoignage publié"}
