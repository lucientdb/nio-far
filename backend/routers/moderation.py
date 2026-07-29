"""
Router pour la modération de contenu
Permet aux modérateurs et admins de gérer le contenu en attente
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.post import Post
from models.content import Temoignage, Podcast, Signalement
from core.deps import require_moderateur

router = APIRouter(prefix="/moderation", tags=["Modération"])


@router.get("/queue")
def get_moderation_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """
    Récupère tout le contenu en attente de modération
    """
    posts_pending = db.query(Post).filter(Post.est_publie == False).all()
    temoignages_pending = db.query(Temoignage).filter(Temoignage.est_publie == False).all()
    podcasts_pending = db.query(Podcast).filter(Podcast.est_publie == False).all()
    
    return {
        "posts": [
            {
                "id": p.id,
                "type": "post",
                "titre": p.titre,
                "contenu": p.contenu[:200],
                "auteur": {"id": p.auteur.id, "nom": p.auteur.nom, "prenom": p.auteur.prenom},
                "cree_le": p.cree_le.isoformat()
            }
            for p in posts_pending
        ],
        "temoignages": [
            {
                "id": t.id,
                "type": "temoignage",
                "titre": t.titre,
                "contenu": t.contenu[:200],
                "auteur": {"id": t.auteur.id, "nom": t.auteur.nom, "prenom": t.auteur.prenom},
                "cree_le": t.cree_le.isoformat()
            }
            for t in temoignages_pending
        ],
        "podcasts": [
            {
                "id": p.id,
                "type": "podcast",
                "titre": p.titre,
                "description": p.description[:200] if p.description else "",
                "auteur": {"id": p.auteur.id, "nom": p.auteur.nom, "prenom": p.auteur.prenom},
                "cree_le": p.cree_le.isoformat()
            }
            for p in podcasts_pending
        ]
    }


@router.put("/posts/{post_id}/approve")
def approve_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Approuver un post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")
    
    post.est_publie = True
    db.commit()
    return {"message": "Post approuvé", "post_id": post_id}


@router.put("/posts/{post_id}/reject")
def reject_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Rejeter/supprimer un post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")
    
    db.delete(post)
    db.commit()
    return {"message": "Post rejeté et supprimé", "post_id": post_id}


@router.put("/temoignages/{temoignage_id}/approve")
def approve_temoignage(
    temoignage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Approuver un témoignage"""
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    
    temoignage.est_publie = True
    db.commit()
    return {"message": "Témoignage approuvé", "temoignage_id": temoignage_id}


@router.put("/temoignages/{temoignage_id}/reject")
def reject_temoignage(
    temoignage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Rejeter/supprimer un témoignage"""
    temoignage = db.query(Temoignage).filter(Temoignage.id == temoignage_id).first()
    if not temoignage:
        raise HTTPException(status_code=404, detail="Témoignage non trouvé")
    
    db.delete(temoignage)
    db.commit()
    return {"message": "Témoignage rejeté et supprimé", "temoignage_id": temoignage_id}


@router.put("/podcasts/{podcast_id}/approve")
def approve_podcast(
    podcast_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Approuver un podcast"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")
    
    podcast.est_publie = True
    db.commit()
    return {"message": "Podcast approuvé", "podcast_id": podcast_id}


@router.put("/podcasts/{podcast_id}/reject")
def reject_podcast(
    podcast_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Rejeter/supprimer un podcast"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast non trouvé")
    
    db.delete(podcast)
    db.commit()
    return {"message": "Podcast rejeté et supprimé", "podcast_id": podcast_id}


@router.get("/signalements")
def get_signalements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Récupère tous les signalements"""
    signalements = db.query(Signalement).filter(Signalement.est_traite == False).all()
    return [
        {
            "id": s.id,
            "cible_type": s.cible_type,
            "cible_id": s.cible_id,
            "raison": s.raison,
            "auteur": {"id": s.auteur.id, "nom": s.auteur.nom, "prenom": s.auteur.prenom},
            "cree_le": s.cree_le.isoformat()
        }
        for s in signalements
    ]


@router.post("/signaler")
def signaler_contenu(
    cible_type: str,
    cible_id: int,
    raison: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Signaler du contenu inapproprié"""
    signalement = Signalement(
        cible_type=cible_type,
        cible_id=cible_id,
        raison=raison,
        auteur_id=current_user.id
    )
    db.add(signalement)
    db.commit()
    return {"message": "Contenu signalé", "signalement_id": signalement.id}


@router.put("/signalements/{signalement_id}/traiter")
def traiter_signalement(
    signalement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Marquer un signalement comme traité"""
    signalement = db.query(Signalement).filter(Signalement.id == signalement_id).first()
    if not signalement:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    
    signalement.est_traite = True
    db.commit()
    return {"message": "Signalement traité", "signalement_id": signalement_id}


@router.delete("/signalements/{signalement_id}")
def supprimer_signalement(
    signalement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderateur)
):
    """Supprimer un signalement"""
    signalement = db.query(Signalement).filter(Signalement.id == signalement_id).first()
    if not signalement:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    
    db.delete(signalement)
    db.commit()
    return {"message": "Signalement supprimé", "signalement_id": signalement_id}
