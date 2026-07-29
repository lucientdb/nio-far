from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import Photo
from models.user import UserRole
from core.permissions import require_roles

router = APIRouter()


class PhotoCreate(BaseModel):
    titre: str
    lieu: Optional[str] = None
    image_url: str


@router.get("/")
def list_photos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    photos = (
        db.query(Photo)
        .filter(Photo.est_publie == True)
        .order_by(Photo.cree_le.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": p.id,
            "titre": p.titre,
            "lieu": p.lieu,
            "image_url": p.image_url,
            "cree_le": p.cree_le.isoformat(),
        }
        for p in photos
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_photo(
    data: PhotoCreate,
    current_user=Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    p = Photo(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "message": "Photo ajoutée"}


@router.delete("/{photo_id}")
def delete_photo(
    photo_id: int,
    current_user=Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    p = db.query(Photo).filter(Photo.id == photo_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Photo non trouvée")
    db.delete(p)
    db.commit()
    return {"message": "Photo supprimée"}
