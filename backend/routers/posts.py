from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Post, Commentaire
from routers.users import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Créer le router pour les routes des posts
router = APIRouter()

# Modèles Pydantic pour les requêtes et réponses

class CommentaireResponse(BaseModel):
    """Modèle pour un commentaire dans les réponses"""
    id: int
    contenu: str
    auteur: dict  # {id, nom, prenom, avatar_url}
    cree_le: str

class PostResponse(BaseModel):
    """Modèle pour un post dans les réponses"""
    id: int
    titre: str
    contenu: str
    est_publie: bool
    vues: int
    auteur: dict  # {id, nom, prenom, avatar_url}
    commentaires: List[CommentaireResponse]
    cree_le: str
    modifie_le: Optional[str]

class PostCreate(BaseModel):
    """Modèle pour créer un nouveau post"""
    titre: str
    contenu: str

class PostUpdate(BaseModel):
    """Modèle pour mettre à jour un post"""
    titre: Optional[str] = None
    contenu: Optional[str] = None
    est_publie: Optional[bool] = None

class CommentaireCreate(BaseModel):
    """Modèle pour créer un commentaire"""
    contenu: str

# Routes des posts

@router.get("/", response_model=List[PostResponse])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    published_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des posts du forum
    - skip: nombre de posts à sauter (pagination)
    - limit: nombre maximum de posts à retourner
    - published_only: si True, ne retourne que les posts publiés
    """
    query = db.query(Post)

    if published_only:
        query = query.filter(Post.est_publie == True)

    posts = query.order_by(Post.cree_le.desc()).offset(skip).limit(limit).all()

    result = []
    for post in posts:
        commentaires = []
        for comm in post.commentaires:
            commentaires.append(CommentaireResponse(
                id=comm.id,
                contenu=comm.contenu,
                auteur={
                    "id": comm.auteur.id,
                    "nom": comm.auteur.nom,
                    "prenom": comm.auteur.prenom,
                    "avatar_url": comm.auteur.avatar_url
                },
                cree_le=comm.cree_le.isoformat()
            ))

        result.append(PostResponse(
            id=post.id,
            titre=post.titre,
            contenu=post.contenu,
            est_publie=post.est_publie,
            vues=post.vues or 0,
            auteur={
                "id": post.auteur.id,
                "nom": post.auteur.nom,
                "prenom": post.auteur.prenom,
                "avatar_url": post.auteur.avatar_url
            },
            commentaires=commentaires,
            cree_le=post.cree_le.isoformat(),
            modifie_le=post.modifie_le.isoformat() if post.modifie_le else None
        ))

    return result

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """
    Récupérer un post spécifique et incrémenter le compteur de vues
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post non trouvé"
        )

    # Incrémenter les vues
    post.vues = (post.vues or 0) + 1
    db.commit()

    # Construire la réponse
    commentaires = []
    for comm in post.commentaires:
        commentaires.append(CommentaireResponse(
            id=comm.id,
            contenu=comm.contenu,
            auteur={
                "id": comm.auteur.id,
                "nom": comm.auteur.nom,
                "prenom": comm.auteur.prenom,
                "avatar_url": comm.auteur.avatar_url
            },
            cree_le=comm.cree_le.isoformat()
        ))

    return PostResponse(
        id=post.id,
        titre=post.titre,
        contenu=post.contenu,
        est_publie=post.est_publie,
        vues=post.vues,
        auteur={
            "id": post.auteur.id,
            "nom": post.auteur.nom,
            "prenom": post.auteur.prenom,
            "avatar_url": post.auteur.avatar_url
        },
        commentaires=commentaires,
        cree_le=post.cree_le.isoformat(),
        modifie_le=post.modifie_le.isoformat() if post.modifie_le else None
    )

@router.post("/", response_model=PostResponse)
def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Créer un nouveau post dans le forum
    """
    new_post = Post(
        titre=post_data.titre,
        contenu=post_data.contenu,
        user_id=current_user.id,
        est_publie=False  # Les nouveaux posts sont en attente de modération
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return PostResponse(
        id=new_post.id,
        titre=new_post.titre,
        contenu=new_post.contenu,
        est_publie=new_post.est_publie,
        vues=0,
        auteur={
            "id": current_user.id,
            "nom": current_user.nom,
            "prenom": current_user.prenom,
            "avatar_url": current_user.avatar_url
        },
        commentaires=[],
        cree_le=new_post.cree_le.isoformat(),
        modifie_le=None
    )

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un post (seulement l'auteur ou un modérateur/admin)
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post non trouvé"
        )

    # Vérifier les permissions : auteur ou modérateur/admin
    if post.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de modifier ce post"
        )

    # Mettre à jour les champs fournis
    update_data = post_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    post.modifie_le = datetime.utcnow()
    db.commit()
    db.refresh(post)

    # Recharger avec les commentaires pour la réponse
    db.refresh(post)
    commentaires = []
    for comm in post.commentaires:
        commentaires.append(CommentaireResponse(
            id=comm.id,
            contenu=comm.contenu,
            auteur={
                "id": comm.auteur.id,
                "nom": comm.auteur.nom,
                "prenom": comm.auteur.prenom,
                "avatar_url": comm.auteur.avatar_url
            },
            cree_le=comm.cree_le.isoformat()
        ))

    return PostResponse(
        id=post.id,
        titre=post.titre,
        contenu=post.contenu,
        est_publie=post.est_publie,
        vues=post.vues,
        auteur={
            "id": post.auteur.id,
            "nom": post.auteur.nom,
            "prenom": post.auteur.prenom,
            "avatar_url": post.auteur.avatar_url
        },
        commentaires=commentaires,
        cree_le=post.cree_le.isoformat(),
        modifie_le=post.modifie_le.isoformat() if post.modifie_le else None
    )

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un post (seulement l'auteur ou un modérateur/admin)
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post non trouvé"
        )

    # Vérifier les permissions
    if post.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer ce post"
        )

    db.delete(post)
    db.commit()

    return {"message": "Post supprimé avec succès"}

# Routes des commentaires

@router.post("/{post_id}/comments", response_model=CommentaireResponse)
def create_comment(
    post_id: int,
    comment_data: CommentaireCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ajouter un commentaire à un post
    """
    # Vérifier que le post existe
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post non trouvé"
        )

    new_comment = Commentaire(
        contenu=comment_data.contenu,
        user_id=current_user.id,
        post_id=post_id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentaireResponse(
        id=new_comment.id,
        contenu=new_comment.contenu,
        auteur={
            "id": current_user.id,
            "nom": current_user.nom,
            "prenom": current_user.prenom,
            "avatar_url": current_user.avatar_url
        },
        cree_le=new_comment.cree_le.isoformat()
    )

@router.delete("/{post_id}/comments/{comment_id}")
def delete_comment(
    post_id: int,
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un commentaire (seulement l'auteur ou un modérateur/admin)
    """
    comment = db.query(Commentaire).filter(
        Commentaire.id == comment_id,
        Commentaire.post_id == post_id
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commentaire non trouvé"
        )

    # Vérifier les permissions
    if comment.user_id != current_user.id and current_user.role.value not in ["moderateur", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas le droit de supprimer ce commentaire"
        )

    db.delete(comment)
    db.commit()

    return {"message": "Commentaire supprimé avec succès"}