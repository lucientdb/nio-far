"""
Router pour l'administration
Gestion complète de la plateforme (utilisateurs, contenu, statistiques)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.user import User, UserRole
from models.post import Post
from models.content import Temoignage, Podcast, Job, Expert, Signalement
from core.deps import require_admin

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Statistiques globales de la plateforme"""
    stats = {
        "users": {
            "total": db.query(User).count(),
            "users": db.query(User).filter(User.role == UserRole.USER).count(),
            "experts": db.query(User).filter(User.role == UserRole.EXPERT).count(),
            "organisations": db.query(User).filter(User.role == UserRole.ORGANISATION).count(),
            "moderateurs": db.query(User).filter(User.role == UserRole.MODERATEUR).count(),
            "admins": db.query(User).filter(User.role == UserRole.ADMIN).count(),
            "actifs": db.query(User).filter(User.est_actif == True).count(),
            "en_attente_verification": db.query(User).filter(
                User.est_expert_verifie == False,
                User.role.in_([UserRole.EXPERT, UserRole.ORGANISATION])
            ).count()
        },
        "contenu": {
            "posts_total": db.query(Post).count(),
            "posts_publies": db.query(Post).filter(Post.est_publie == True).count(),
            "posts_en_attente": db.query(Post).filter(Post.est_publie == False).count(),
            "temoignages_total": db.query(Temoignage).count(),
            "temoignages_publies": db.query(Temoignage).filter(Temoignage.est_publie == True).count(),
            "temoignages_en_attente": db.query(Temoignage).filter(Temoignage.est_publie == False).count(),
            "podcasts_total": db.query(Podcast).count(),
            "podcasts_publies": db.query(Podcast).filter(Podcast.est_publie == True).count(),
            "podcasts_en_attente": db.query(Podcast).filter(Podcast.est_publie == False).count(),
        },
        "emploi": {
            "jobs_total": db.query(Job).count(),
            "jobs_actifs": db.query(Job).filter(Job.est_actif == True).count(),
        },
        "moderation": {
            "signalements_total": db.query(Signalement).count(),
            "signalements_non_traites": db.query(Signalement).filter(Signalement.est_traite == False).count(),
        }
    }
    return stats


@router.get("/users")
def get_all_users(
    role: str = None,
    actif: bool = None,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Liste tous les utilisateurs avec filtres"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if actif is not None:
        query = query.filter(User.est_actif == actif)
    if search:
        query = query.filter(
            (User.nom.ilike(f"%{search}%")) | 
            (User.prenom.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )
    
    users = query.all()
    return [
        {
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.email,
            "role": u.role.value,
            "est_actif": u.est_actif,
            "est_verifie": u.est_expert_verifie,
            "cree_le": u.cree_le.isoformat()
        }
        for u in users
    ]


@router.get("/users/pending")
def get_pending_verifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Utilisateurs en attente de vérification (experts/organisations)"""
    users = db.query(User).filter(
        User.est_expert_verifie == False,
        User.role.in_([UserRole.EXPERT, UserRole.ORGANISATION])
    ).all()
    
    return [
        {
            "id": u.id,
            "nom": u.nom,
            "prenom": u.prenom,
            "email": u.email,
            "role": u.role.value,
            "specialite": u.specialite,
            "entreprise_nom": u.nom_organisation,
            "cree_le": u.cree_le.isoformat()
        }
        for u in users
    ]


@router.put("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Vérifier un expert ou une organisation"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if user.role not in [UserRole.EXPERT, UserRole.ORGANISATION]:
        raise HTTPException(status_code=400, detail="Seuls les experts et organisations peuvent être vérifiés")
    
    user.est_expert_verifie = True
    db.commit()
    return {"message": f"Utilisateur {user.prenom} {user.nom} vérifié", "user_id": user_id}


@router.put("/users/{user_id}/unverify")
def unverify_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Retirer la vérification d'un utilisateur"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user.est_expert_verifie = False
    db.commit()
    return {"message": "Vérification retirée", "user_id": user_id}


@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Changer le rôle d'un utilisateur"""
    if user_id == current_user.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas modifier votre propre rôle")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    try:
        user.role = UserRole(new_role)
        # Reset vérification si changement de rôle
        if new_role not in [UserRole.EXPERT.value, UserRole.ORGANISATION.value]:
            user.est_expert_verifie = False
        db.commit()
        return {"message": f"Rôle changé vers {new_role}", "user_id": user_id}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Rôle invalide: {new_role}")


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Activer/désactiver un utilisateur"""
    if user_id == current_user.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas vous désactiver vous-même")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user.est_actif = not user.est_actif
    db.commit()
    status = "activé" if user.est_actif else "désactivé"
    return {"message": f"Utilisateur {status}", "user_id": user_id, "est_actif": user.est_actif}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Supprimer définitivement un utilisateur"""
    if user_id == current_user.id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas vous supprimer vous-même")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    db.delete(user)
    db.commit()
    return {"message": f"Utilisateur {user.prenom} {user.nom} supprimé", "user_id": user_id}


@router.delete("/content/post/{post_id}")
def force_delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Supprimer n'importe quel post (admin force delete)"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")
    
    db.delete(post)
    db.commit()
    return {"message": "Post supprimé", "post_id": post_id}


@router.delete("/content/temoignage/{temoignage_id}")
def force_delete_temoignage(
    temoignage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Supprimer n'importe quel témoignage (admin force delete)"""
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    
    db.delete(temoignage)
    db.commit()
    return {"message": "Témoignage supprimé", "temoignage_id": temoignage_id}


@router.delete("/content/podcast/{podcast_id}")
def force_delete_podcast(
    podcast_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Supprimer n'importe quel podcast (admin force delete)"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")
    
    db.delete(podcast)
    db.commit()
    return {"message": "Podcast supprimé", "podcast_id": podcast_id}


@router.delete("/content/job/{job_id}")
def force_delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Supprimer n'importe quelle offre d'emploi (admin force delete)"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre d'emploi non trouvée")
    
    db.delete(job)
    db.commit()
    return {"message": "Offre d'emploi supprimée", "job_id": job_id}
