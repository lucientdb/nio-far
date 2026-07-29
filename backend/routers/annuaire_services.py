from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import AnnuaireService
from models.user import UserRole
from core.permissions import require_roles

router = APIRouter()


class ServiceCreate(BaseModel):
    nom: str
    sigle: Optional[str] = None
    categorie: str
    description: str
    missions: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    site: Optional[str] = None
    adresse: Optional[str] = None
    villes: Optional[str] = None
    horaires: Optional[str] = None
    gratuit: bool = True


def _service_dict(s: AnnuaireService) -> dict:
    return {
        "id": s.id,
        "nom": s.nom,
        "sigle": s.sigle,
        "categorie": s.categorie,
        "description": s.description,
        "missions": [m.strip() for m in (s.missions or "").split("\n") if m.strip()],
        "contact": {
            "telephone": s.telephone,
            "email": s.email,
            "site": s.site,
            "adresse": s.adresse,
        },
        "villes": [v.strip() for v in (s.villes or "").split(",") if v.strip()],
        "horaires": s.horaires,
        "gratuit": s.gratuit,
        "cree_le": s.cree_le.isoformat(),
    }


@router.get("/")
def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    categorie: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(AnnuaireService).filter(AnnuaireService.est_actif == True)
    if categorie and categorie != "tous":
        query = query.filter(AnnuaireService.categorie == categorie)
    items = query.order_by(AnnuaireService.nom).offset(skip).limit(limit).all()
    return [_service_dict(s) for s in items]


@router.get("/{service_id}")
def get_service(service_id: int, db: Session = Depends(get_db)):
    s = db.query(AnnuaireService).filter(AnnuaireService.id == service_id, AnnuaireService.est_actif == True).first()
    if not s:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    return _service_dict(s)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_service(
    data: ServiceCreate,
    current_user=Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    s = AnnuaireService(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return _service_dict(s)


@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    current_user=Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    s = db.query(AnnuaireService).filter(AnnuaireService.id == service_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    db.delete(s)
    db.commit()
    return {"message": "Service supprimé"}
