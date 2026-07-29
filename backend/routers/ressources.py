from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models import Ressource
from models.user import UserRole
from core.permissions import require_roles

router = APIRouter()


class RessourceResponse(BaseModel):
    id: int
    titre: str
    description: str
    categorie: str
    duree: Optional[str]
    niveau: Optional[str]
    lien: Optional[str]
    cree_le: str


class RessourceCreate(BaseModel):
    titre: str
    description: str
    categorie: str
    duree: Optional[str] = None
    niveau: Optional[str] = None
    lien: Optional[str] = None


@router.get("/")
def list_ressources(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    categorie: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Ressource).filter(Ressource.est_actif == True)
    if categorie:
        query = query.filter(Ressource.categorie == categorie)
    items = query.order_by(Ressource.cree_le.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "titre": r.titre,
            "description": r.description,
            "categorie": r.categorie,
            "duree": r.duree,
            "niveau": r.niveau,
            "lien": r.lien,
            "cree_le": r.cree_le.isoformat(),
        }
        for r in items
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_ressource(
    data: RessourceCreate,
    current_user=Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    r = Ressource(**data.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"id": r.id, "message": "Ressource créée"}


@router.delete("/{ressource_id}")
def delete_ressource(
    ressource_id: int,
    current_user=Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    r = db.query(Ressource).filter(Ressource.id == ressource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Ressource non trouvée")
    db.delete(r)
    db.commit()
    return {"message": "Ressource supprimée"}
