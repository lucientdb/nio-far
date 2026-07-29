from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Expert
from core.deps import get_current_user
from core.permissions import require_roles
from models.user import UserRole
from pydantic import BaseModel
from typing import List, Optional

# Créer le router pour les routes des experts
router = APIRouter()

# Modèles Pydantic pour les requêtes et réponses

class ExpertResponse(BaseModel):
    """Modèle pour un expert dans les réponses"""
    id: int
    nom: str
    specialite: str
    organisation: Optional[str]
    email: Optional[str]
    telephone: Optional[str]
    ville: Optional[str]
    photo_url: Optional[str]
    est_actif: bool
    cree_le: str

class ExpertCreate(BaseModel):
    """Modèle pour créer un nouvel expert"""
    nom: str
    specialite: str
    organisation: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    ville: Optional[str] = None
    photo_url: Optional[str] = None

class ExpertUpdate(BaseModel):
    """Modèle pour mettre à jour un expert"""
    nom: Optional[str] = None
    specialite: Optional[str] = None
    organisation: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    ville: Optional[str] = None
    photo_url: Optional[str] = None
    est_actif: Optional[bool] = None

# Routes des experts

@router.get("/", response_model=List[ExpertResponse])
def get_experts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = Query(True),
    specialite: Optional[str] = Query(None),
    ville: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des experts
    - skip: nombre d'experts à sauter (pagination)
    - limit: nombre maximum d'experts à retourner
    - active_only: si True, ne retourne que les experts actifs
    - specialite: filtrer par spécialité
    - ville: filtrer par ville
    """
    query = db.query(Expert)

    if active_only:
        query = query.filter(Expert.est_actif == True)

    if specialite:
        query = query.filter(Expert.specialite.ilike(f"%{specialite}%"))

    if ville:
        query = query.filter(Expert.ville.ilike(f"%{ville}%"))

    experts = query.order_by(Expert.nom).offset(skip).limit(limit).all()

    result = []
    for expert in experts:
        result.append(ExpertResponse(
            id=expert.id,
            nom=expert.nom,
            specialite=expert.specialite,
            organisation=expert.organisation,
            email=expert.email,
            telephone=expert.telephone,
            ville=expert.ville,
            photo_url=expert.photo_url,
            est_actif=expert.est_actif,
            cree_le=expert.cree_le.isoformat()
        ))

    return result

@router.get("/{expert_id}", response_model=ExpertResponse)
def get_expert(expert_id: int, db: Session = Depends(get_db)):
    """
    Récupérer un expert spécifique
    """
    expert = db.query(Expert).filter(Expert.id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert non trouvé"
        )

    return ExpertResponse(
        id=expert.id,
        nom=expert.nom,
        specialite=expert.specialite,
        organisation=expert.organisation,
        email=expert.email,
        telephone=expert.telephone,
        ville=expert.ville,
        photo_url=expert.photo_url,
        est_actif=expert.est_actif,
        cree_le=expert.cree_le.isoformat()
    )

@router.post("/", response_model=ExpertResponse)
def create_expert(
    expert_data: ExpertCreate,
    current_user = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db)
):
    new_expert = Expert(
        nom=expert_data.nom,
        specialite=expert_data.specialite,
        organisation=expert_data.organisation,
        email=expert_data.email,
        telephone=expert_data.telephone,
        ville=expert_data.ville,
        photo_url=expert_data.photo_url
    )

    db.add(new_expert)
    db.commit()
    db.refresh(new_expert)

    return ExpertResponse(
        id=new_expert.id,
        nom=new_expert.nom,
        specialite=new_expert.specialite,
        organisation=new_expert.organisation,
        email=new_expert.email,
        telephone=new_expert.telephone,
        ville=new_expert.ville,
        photo_url=new_expert.photo_url,
        est_actif=new_expert.est_actif,
        cree_le=new_expert.cree_le.isoformat()
    )

@router.put("/{expert_id}", response_model=ExpertResponse)
def update_expert(
    expert_id: int,
    expert_data: ExpertUpdate,
    current_user = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db)
):
    expert = db.query(Expert).filter(Expert.id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert non trouvé"
        )

    # Mettre à jour les champs fournis
    update_data = expert_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expert, field, value)

    db.commit()
    db.refresh(expert)

    return ExpertResponse(
        id=expert.id,
        nom=expert.nom,
        specialite=expert.specialite,
        organisation=expert.organisation,
        email=expert.email,
        telephone=expert.telephone,
        ville=expert.ville,
        photo_url=expert.photo_url,
        est_actif=expert.est_actif,
        cree_le=expert.cree_le.isoformat()
    )

@router.delete("/{expert_id}")
def delete_expert(
    expert_id: int,
    current_user = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db)
):
    expert = db.query(Expert).filter(Expert.id == expert_id).first()
    if not expert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expert non trouvé"
        )

    db.delete(expert)
    db.commit()

    return {"message": "Expert supprimé avec succès"}