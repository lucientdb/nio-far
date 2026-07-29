from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, Job
from models.user import UserRole
from core.deps import get_current_user
from core.permissions import require_roles, JOB_POSTER_ROLES, has_role
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class JobResponse(BaseModel):
    id: int
    titre: str
    entreprise: str
    description: str
    lieu: Optional[str]
    type_contrat: Optional[str]
    est_actif: bool
    auteur: dict
    expire_le: Optional[str]
    cree_le: str


class JobCreate(BaseModel):
    titre: str
    entreprise: str
    description: str
    lieu: Optional[str] = None
    type_contrat: Optional[str] = None
    expire_le: Optional[datetime] = None


class JobUpdate(BaseModel):
    titre: Optional[str] = None
    entreprise: Optional[str] = None
    description: Optional[str] = None
    lieu: Optional[str] = None
    type_contrat: Optional[str] = None
    est_actif: Optional[bool] = None
    expire_le: Optional[datetime] = None


def _job_dict(job: Job) -> dict:
    return {
        "id": job.id,
        "titre": job.titre,
        "entreprise": job.entreprise,
        "description": job.description,
        "lieu": job.lieu,
        "type_contrat": job.type_contrat,
        "est_actif": job.est_actif,
        "auteur": {
            "id": job.auteur.id,
            "nom": job.auteur.nom,
            "prenom": job.auteur.prenom,
            "avatar_url": job.auteur.avatar_url,
        },
        "expire_le": job.expire_le.isoformat() if job.expire_le else None,
        "cree_le": job.cree_le.isoformat(),
    }


@router.get("/", response_model=List[JobResponse])
def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    query = db.query(Job).options(joinedload(Job.auteur))
    if active_only:
        query = query.filter(Job.est_actif == True)

    jobs = query.order_by(Job.cree_le.desc()).offset(skip).limit(limit).all()
    return [_job_dict(j) for j in jobs]


@router.get("/me")
def my_jobs(
    current_user: User = Depends(require_roles(UserRole.entreprise, UserRole.ong, UserRole.admin)),
    db: Session = Depends(get_db),
):
    jobs = (
        db.query(Job)
        .options(joinedload(Job.auteur))
        .filter(Job.user_id == current_user.id)
        .order_by(Job.cree_le.desc())
        .all()
    )
    return [_job_dict(j) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).options(joinedload(Job.auteur)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    return _job_dict(job)


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(require_roles(UserRole.entreprise, UserRole.ong, UserRole.admin)),
    db: Session = Depends(get_db),
):
    job = Job(
        titre=job_data.titre,
        entreprise=job_data.entreprise,
        description=job_data.description,
        lieu=job_data.lieu,
        type_contrat=job_data.type_contrat,
        expire_le=job_data.expire_le,
        user_id=current_user.id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    job.auteur = current_user
    return _job_dict(job)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).options(joinedload(Job.auteur)).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    if job.user_id != current_user.id and not has_role(current_user, UserRole.admin):
        raise HTTPException(status_code=403, detail="Modification non autorisée")

    for field, value in job_data.model_dump(exclude_unset=True).items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return _job_dict(job)


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    if job.user_id != current_user.id and not has_role(current_user, UserRole.admin):
        raise HTTPException(status_code=403, detail="Suppression non autorisée")

    db.delete(job)
    db.commit()
    return {"message": "Offre supprimée"}
