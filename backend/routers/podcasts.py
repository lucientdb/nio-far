from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Podcast
from routers.users import get_current_user
from pydantic import BaseModel
from typing import List, Optional

# Créer le router pour les routes des podcasts
router = APIRouter()

# Modèles Pydantic pour les requêtes et réponses

class PodcastResponse(BaseModel):
    """Modèle pour un podcast dans les réponses"""
    id: int
    titre: str
    description: Optional[str]
    audio_url: str
    couverture_url: Optional[str]
    duree_secondes: Optional[int]
    est_publie: bool
    auteur: dict  # {id, nom, prenom, avatar_url}
    cree_le: str

class PodcastCreate(BaseModel):
    """Modèle pour créer un nouveau podcast"""
    titre: str
    description: Optional[str] = None
    audio_url: str
    couverture_url: Optional[str] = None
    duree_secondes: Optional[int] = None

class PodcastUpdate(BaseModel):
    """Modèle pour mettre à jour un podcast"""
    titre: Optional[str] = None
    description: Optional[str] = None
    audio_url: Optional[str] = None
    couverture_url: Optional[str] = None
    duree_secondes: Optional[int] = None

# Routes des podcasts

@router.get("/", response_model=List[PodcastResponse])
def get_podcasts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    published_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des podcasts
    - skip: nombre de podcasts à sauter (pagination)
    - limit: nombre maximum de podcasts à retourner
    - published_only: si True, ne retourne que les podcasts publiés
    """
    query = db.query(Podcast)

    if published_only:
        query = query.filter(Podcast.est_publie == True)

    podcasts = query.order_by(Podcast.cree_le.desc()).offset(skip).limit(limit).all()

    result = []
    for podcast in podcasts:
        result.append(PodcastResponse(
            id=podcast.id,
            titre=podcast.titre,
            description=podcast.description,
            audio_url=podcast.audio_url,
            couverture_url=podcast.couverture_url,
            duree_secondes=podcast.duree_secondes,
            est_publie=podcast.est_publie,
            auteur={
                "id": podcast.auteur.id,
                "nom": podcast.auteur.nom,
                "prenom": podcast.auteur.prenom,
                "avatar_url": podcast.auteur.avatar_url
            },
            cree_le=podcast.cree_le.isoformat()
        ))

    return result

@router.get("/{podcast_id}", response_model=PodcastResponse)
def get_podcast(podcast_id: int, db: Session = Depends(get_db)):
    """
    Récupérer un podcast spécifique
    """
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast non trouvé"
        )

    return PodcastResponse(
        id=podcast.id,
        titre=podcast.titre,
        description=podcast.description,
        audio_url=podcast.audio_url,
        couverture_url=podcast.couverture_url,
        duree_secondes=podcast.duree_secondes,
        est_publie=podcast.est_publie,
        auteur={
            "id": podcast.auteur.id,
            "nom": podcast.auteur.nom,
            "prenom": podcast.auteur.prenom,
            "avatar_url": podcast.auteur.avatar_url
        },
        cree_le=podcast.cree_le.isoformat()
    )

@router.post("/", response_model=PodcastResponse)
def create_podcast(
    podcast_data: PodcastCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer un nouveau podcast
    """
    new_podcast = Podcast(
        titre=podcast_data.titre,
        description=podcast_data.description,
        audio_url=podcast_data.audio_url,
        couverture_url=podcast_data.couverture_url,
        duree_secondes=podcast_data.duree_secondes,
        user_id=current_user.id,
        est_publie=False  # Les nouveaux podcasts sont en attente de modération
    )

    db.add(new_podcast)
    db.commit()
    db.refresh(new_podcast)

    return PodcastResponse(
        id=new_podcast.id,
        titre=new_podcast.titre,
        description=new_podcast.description,
        audio_url=new_podcast.audio_url,
        couverture_url=new_podcast.couverture_url,
        duree_secondes=new_podcast.duree_secondes,
        est_publie=new_podcast.est_publie,
        auteur={
            "id": current_user.id,
            "nom": current_user.nom,
            "prenom": current_user.prenom,
            "avatar_url": current_user.avatar_url
        },
        cree_le=new_podcast.cree_le.isoformat()
    )

@router.put("/{podcast_id}", response_model=PodcastResponse)
def update_podcast(
    podcast_id: int,
    podcast_data: PodcastUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un podcast (seulement l'auteur ou un modérateur/admin)
    """
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast non trouvé"
        )

    # Vérifier les permissions : auteur ou modérateur/admin
    if podcast.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de modifier ce podcast"
        )

    # Mettre à jour les champs fournis
    update_data = podcast_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(podcast, field, value)

    db.commit()
    db.refresh(podcast)

    return PodcastResponse(
        id=podcast.id,
        titre=podcast.titre,
        description=podcast.description,
        audio_url=podcast.audio_url,
        couverture_url=podcast.couverture_url,
        duree_secondes=podcast.duree_secondes,
        est_publie=podcast.est_publie,
        auteur={
            "id": podcast.auteur.id,
            "nom": podcast.auteur.nom,
            "prenom": podcast.auteur.prenom,
            "avatar_url": podcast.auteur.avatar_url
        },
        cree_le=podcast.cree_le.isoformat()
    )

@router.delete("/{podcast_id}")
def delete_podcast(
    podcast_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un podcast (seulement l'auteur ou un modérateur/admin)
    """
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast non trouvé"
        )

    # Vérifier les permissions
    if podcast.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer ce podcast"
        )

    db.delete(podcast)
    db.commit()

    return {"message": "Podcast supprimé avec succès"}

@router.put("/{podcast_id}/publish")
def publish_podcast(
    podcast_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Publier un podcast (seulement modérateur/admin)
    """
    # Vérifier les permissions
    if current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de publier des podcasts"
        )

    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Podcast non trouvé"
        )

    podcast.est_publie = True
    db.commit()

    return {"message": "Podcast publié avec succès"}