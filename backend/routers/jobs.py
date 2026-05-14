from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Job
from routers.users import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Créer le router pour les routes des offres d'emploi
router = APIRouter()

# Modèles Pydantic pour les requêtes et réponses

class JobResponse(BaseModel):
    """Modèle pour une offre d'emploi dans les réponses"""
    id: int
    titre: str
    entreprise: str
    description: str
    lieu: Optional[str]
    type_contrat: Optional[str]
    est_actif: bool
    auteur: dict  # {id, nom, prenom, avatar_url}
    expire_le: Optional[str]
    cree_le: str

class JobCreate(BaseModel):
    """Modèle pour créer une nouvelle offre d'emploi"""
    titre: str
    entreprise: str
    description: str
    lieu: Optional[str] = None
    type_contrat: Optional[str] = None
    expire_le: Optional[datetime] = None

class JobUpdate(BaseModel):
    """Modèle pour mettre à jour une offre d'emploi"""
    titre: Optional[str] = None
    entreprise: Optional[str] = None
    description: Optional[str] = None
    lieu: Optional[str] = None
    type_contrat: Optional[str] = None
    est_actif: Optional[bool] = None
    expire_le: Optional[datetime] = None

# Routes des offres d'emploi

@router.get("/", response_model=List[JobResponse])
def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des offres d'emploi
    - skip: nombre d'offres à sauter (pagination)
    - limit: nombre maximum d'offres à retourner
    - active_only: si True, ne retourne que les offres actives
    """
    query = db.query(Job)

    if active_only:
        query = query.filter(Job.est_actif == True)

    jobs = query.order_by(Job.cree_le.desc()).offset(skip).limit(limit).all()

    result = []
    for job in jobs:
        result.append(JobResponse(
            id=job.id,
            titre=job.titre,
            entreprise=job.entreprise,
            description=job.description,
            lieu=job.lieu,
            type_contrat=job.type_contrat,
            est_actif=job.est_actif,
            auteur={
                "id": job.auteur.id,
                "nom": job.auteur.nom,
                "prenom": job.auteur.prenom,
                "avatar_url": job.auteur.avatar_url
            },
            expire_le=job.expire_le.isoformat() if job.expire_le else None,
            cree_le=job.cree_le.isoformat()
        ))

    return result

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Récupérer une offre d'emploi spécifique
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre d'emploi non trouvée"
        )

    return JobResponse(
        id=job.id,
        titre=job.titre,
        entreprise=job.entreprise,
        description=job.description,
        lieu=job.lieu,
        type_contrat=job.type_contrat,
        est_actif=job.est_actif,
        auteur={
            "id": job.auteur.id,
            "nom": job.auteur.nom,
            "prenom": job.auteur.prenom,
            "avatar_url": job.auteur.avatar_url
        },
        expire_le=job.expire_le.isoformat() if job.expire_le else None,
        cree_le=job.cree_le.isoformat()
    )

@router.post("/", response_model=JobResponse)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer une nouvelle offre d'emploi
    """
    new_job = Job(
        titre=job_data.titre,
        entreprise=job_data.entreprise,
        description=job_data.description,
        lieu=job_data.lieu,
        type_contrat=job_data.type_contrat,
        expire_le=job_data.expire_le,
        user_id=current_user.id
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return JobResponse(
        id=new_job.id,
        titre=new_job.titre,
        entreprise=new_job.entreprise,
        description=new_job.description,
        lieu=new_job.lieu,
        type_contrat=new_job.type_contrat,
        est_actif=new_job.est_actif,
        auteur={
            "id": current_user.id,
            "nom": current_user.nom,
            "prenom": current_user.prenom,
            "avatar_url": current_user.avatar_url
        },
        expire_le=new_job.expire_le.isoformat() if new_job.expire_le else None,
        cree_le=new_job.cree_le.isoformat()
    )

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour une offre d'emploi (seulement l'auteur ou un modérateur/admin)
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre d'emploi non trouvée"
        )

    # Vérifier les permissions : auteur ou modérateur/admin
    if job.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de modifier cette offre d'emploi"
        )

    # Mettre à jour les champs fournis
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return JobResponse(
        id=job.id,
        titre=job.titre,
        entreprise=job.entreprise,
        description=job.description,
        lieu=job.lieu,
        type_contrat=job.type_contrat,
        est_actif=job.est_actif,
        auteur={
            "id": job.auteur.id,
            "nom": job.auteur.nom,
            "prenom": job.auteur.prenom,
            "avatar_url": job.auteur.avatar_url
        },
        expire_le=job.expire_le.isoformat() if job.expire_le else None,
        cree_le=job.cree_le.isoformat()
    )

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer une offre d'emploi (seulement l'auteur ou un modérateur/admin)
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offre d'emploi non trouvée"
        )

    # Vérifier les permissions
    if job.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer cette offre d'emploi"
        )

    db.delete(job)
    db.commit()

    return {"message": "Offre d'emploi supprimée avec succès"}