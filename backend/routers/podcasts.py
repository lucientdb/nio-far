from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, Podcast, MediaFormat
from models.user import UserRole
from core.deps import get_current_user
from core.permissions import require_roles
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class PodcastResponse(BaseModel):
    id: int
    titre: str
    description: Optional[str]
    format: str
    media_url: str
    couverture_url: Optional[str]
    duree_secondes: Optional[int]
    est_publie: bool
    auteur: dict
    cree_le: str


class PodcastCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    format: str = "audio"
    media_url: str
    couverture_url: Optional[str] = None
    duree_secondes: Optional[int] = None


class PodcastUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    format: Optional[str] = None
    media_url: Optional[str] = None
    couverture_url: Optional[str] = None
    duree_secondes: Optional[int] = None


def _podcast_dict(podcast: Podcast) -> dict:
    return {
        "id": podcast.id,
        "titre": podcast.titre,
        "description": podcast.description,
        "format": podcast.format.value,
        "media_url": podcast.media_url,
        "couverture_url": podcast.couverture_url,
        "duree_secondes": podcast.duree_secondes,
        "est_publie": podcast.est_publie,
        "auteur": {
            "id": podcast.auteur.id,
            "nom": podcast.auteur.nom,
            "prenom": podcast.auteur.prenom,
            "avatar_url": podcast.auteur.avatar_url,
        },
        "cree_le": podcast.cree_le.isoformat(),
    }


@router.get("/", response_model=List[PodcastResponse])
def get_podcasts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    format: Optional[str] = None,
    published_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    query = db.query(Podcast).options(joinedload(Podcast.auteur))
    if published_only:
        query = query.filter(Podcast.est_publie == True)
    if format:
        query = query.filter(Podcast.format == format)

    podcasts = query.order_by(Podcast.cree_le.desc()).offset(skip).limit(limit).all()
    return [_podcast_dict(p) for p in podcasts]


@router.get("/admin/all")
def admin_list_podcasts(
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    podcasts = db.query(Podcast).options(joinedload(Podcast.auteur)).order_by(Podcast.cree_le.desc()).all()
    return [_podcast_dict(p) for p in podcasts]


@router.get("/{podcast_id}", response_model=PodcastResponse)
def get_podcast(podcast_id: int, db: Session = Depends(get_db)):
    podcast = db.query(Podcast).options(joinedload(Podcast.auteur)).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")
    return _podcast_dict(podcast)


@router.post("/", response_model=PodcastResponse, status_code=status.HTTP_201_CREATED)
def create_podcast(
    podcast_data: PodcastCreate,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    try:
        media_format = MediaFormat(podcast_data.format)
    except ValueError:
        raise HTTPException(status_code=400, detail="Format invalide (audio ou video)")

    podcast = Podcast(
        titre=podcast_data.titre,
        description=podcast_data.description,
        format=media_format,
        media_url=podcast_data.media_url,
        couverture_url=podcast_data.couverture_url,
        duree_secondes=podcast_data.duree_secondes,
        user_id=current_user.id,
        est_publie=True,
    )
    db.add(podcast)
    db.commit()
    db.refresh(podcast)
    podcast.auteur = current_user
    return _podcast_dict(podcast)


@router.put("/{podcast_id}", response_model=PodcastResponse)
def update_podcast(
    podcast_id: int,
    podcast_data: PodcastUpdate,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    podcast = db.query(Podcast).options(joinedload(Podcast.auteur)).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")

    updates = podcast_data.model_dump(exclude_unset=True)
    if "format" in updates:
        try:
            updates["format"] = MediaFormat(updates["format"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Format invalide")

    for field, value in updates.items():
        setattr(podcast, field, value)

    db.commit()
    db.refresh(podcast)
    return _podcast_dict(podcast)


@router.delete("/{podcast_id}")
def delete_podcast(
    podcast_id: int,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
):
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")

    db.delete(podcast)
    db.commit()
    return {"message": "Podcast supprimé"}
