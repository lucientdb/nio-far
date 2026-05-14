from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Temoignage
from routers.users import get_current_user
from pydantic import BaseModel
from typing import List, Optional

# Créer le router pour les routes des témoignages
router = APIRouter()

# Modèles Pydantic pour les requêtes et réponses

class TemoignageResponse(BaseModel):
    """Modèle pour un témoignage dans les réponses"""
    id: int
    titre: str
    contenu: str
    photo_url: Optional[str]
    est_publie: bool
    auteur: dict  # {id, nom, prenom, avatar_url}
    cree_le: str

class TemoignageCreate(BaseModel):
    """Modèle pour créer un nouveau témoignage"""
    titre: str
    contenu: str
    photo_url: Optional[str] = None

class TemoignageUpdate(BaseModel):
    """Modèle pour mettre à jour un témoignage"""
    titre: Optional[str] = None
    contenu: Optional[str] = None
    photo_url: Optional[str] = None

# Routes des témoignages

@router.get("/", response_model=List[TemoignageResponse])
def get_temoignages(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    published_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des témoignages
    - skip: nombre de témoignages à sauter (pagination)
    - limit: nombre maximum de témoignages à retourner
    - published_only: si True, ne retourne que les témoignages publiés
    """
    query = db.query(Temoignage)

    if published_only:
        query = query.filter(Temoignage.est_publie == True)

    temoignages = query.order_by(Temoignage.cree_le.desc()).offset(skip).limit(limit).all()

    result = []
    for temoignage in temoignages:
        result.append(TemoignageResponse(
            id=temoignage.id,
            titre=temoignage.titre,
            contenu=temoignage.contenu,
            photo_url=temoignage.photo_url,
            est_publie=temoignage.est_publie,
            auteur={
                "id": temoignage.auteur.id,
                "nom": temoignage.auteur.nom,
                "prenom": temoignage.auteur.prenom,
                "avatar_url": temoignage.auteur.avatar_url
            },
            cree_le=temoignage.cree_le.isoformat()
        ))

    return result

@router.get("/{temoignage_id}", response_model=TemoignageResponse)
def get_temoignage(temoignage_id: int, db: Session = Depends(get_db)):
    """
    Récupérer un témoignage spécifique
    """
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )

    return TemoignageResponse(
        id=temoignage.id,
        titre=temoignage.titre,
        contenu=temoignage.contenu,
        photo_url=temoignage.photo_url,
        est_publie=temoignage.est_publie,
        auteur={
            "id": temoignage.auteur.id,
            "nom": temoignage.auteur.nom,
            "prenom": temoignage.auteur.prenom,
            "avatar_url": temoignage.auteur.avatar_url
        },
        cree_le=temoignage.cree_le.isoformat()
    )

@router.post("/", response_model=TemoignageResponse)
def create_temoignage(
    temoignage_data: TemoignageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer un nouveau témoignage
    """
    new_temoignage = Temoignage(
        titre=temoignage_data.titre,
        contenu=temoignage_data.contenu,
        photo_url=temoignage_data.photo_url,
        user_id=current_user.id,
        est_publie=False  # Les nouveaux témoignages sont en attente de modération
    )

    db.add(new_temoignage)
    db.commit()
    db.refresh(new_temoignage)

    return TemoignageResponse(
        id=new_temoignage.id,
        titre=new_temoignage.titre,
        contenu=new_temoignage.contenu,
        photo_url=new_temoignage.photo_url,
        est_publie=new_temoignage.est_publie,
        auteur={
            "id": current_user.id,
            "nom": current_user.nom,
            "prenom": current_user.prenom,
            "avatar_url": current_user.avatar_url
        },
        cree_le=new_temoignage.cree_le.isoformat()
    )

@router.put("/{temoignage_id}", response_model=TemoignageResponse)
def update_temoignage(
    temoignage_id: int,
    temoignage_data: TemoignageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un témoignage (seulement l'auteur ou un modérateur/admin)
    """
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )

    # Vérifier les permissions : auteur ou modérateur/admin
    if temoignage.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de modifier ce témoignage"
        )

    # Mettre à jour les champs fournis
    update_data = temoignage_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(temoignage, field, value)

    db.commit()
    db.refresh(temoignage)

    return TemoignageResponse(
        id=temoignage.id,
        titre=temoignage.titre,
        contenu=temoignage.contenu,
        photo_url=temoignage.photo_url,
        est_publie=temoignage.est_publie,
        auteur={
            "id": temoignage.auteur.id,
            "nom": temoignage.auteur.nom,
            "prenom": temoignage.auteur.prenom,
            "avatar_url": temoignage.auteur.avatar_url
        },
        cree_le=temoignage.cree_le.isoformat()
    )

@router.delete("/{temoignage_id}")
def delete_temoignage(
    temoignage_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un témoignage (seulement l'auteur ou un modérateur/admin)
    """
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )

    # Vérifier les permissions
    if temoignage.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer ce témoignage"
        )

    db.delete(temoignage)
    db.commit()

    return {"message": "Témoignage supprimé avec succès"}

@router.put("/{temoignage_id}/publish")
def publish_temoignage(
    temoignage_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Publier un témoignage (seulement modérateur/admin)
    """
    # Vérifier les permissions
    if current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de publier des témoignages"
        )

    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Témoignage non trouvé"
        )

    temoignage.est_publie = True
    db.commit()

    return {"message": "Témoignage publié avec succès"}