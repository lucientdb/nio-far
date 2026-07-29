from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

from database import get_db
from models import User, Post, Commentaire, PostStatut, Like, Share, Forum, Message, Notification
from models.user import UserRole
from core.deps import get_current_user, get_optional_user
from core.permissions import is_forum_moderator, MODERATOR_ROLES
from schemas.helpers import post_to_dict, commentaire_to_dict, user_brief, initial_post_statut, auto_approve_post, get_default_forum_id

router = APIRouter()


class PostUpdate(BaseModel):
    titre: Optional[str] = None
    contenu: Optional[str] = None


class PostCreate(BaseModel):
    titre: str
    contenu: str
    forum_id: Optional[int] = None


class CommentaireCreate(BaseModel):
    contenu: str


def _load_post(db: Session, post_id: int) -> Post:
    post = (
        db.query(Post)
        .options(
            joinedload(Post.auteur),
            joinedload(Post.forum),
            joinedload(Post.commentaires).joinedload(Commentaire.auteur),
            joinedload(Post.likes),
            joinedload(Post.shares),
        )
        .filter(Post.id == post_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")
    return post


@router.get("/")
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    forum_id: Optional[int] = None,
    published_only: bool = Query(True),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    query = db.query(Post).options(
        joinedload(Post.auteur),
        joinedload(Post.forum),
        joinedload(Post.commentaires),
        joinedload(Post.likes),
        joinedload(Post.shares),
    )
    if published_only:
        query = query.filter(Post.est_publie == True)
    if forum_id:
        query = query.filter(Post.forum_id == forum_id)

    posts = query.order_by(Post.cree_le.desc()).offset(skip).limit(limit).all()
    return [post_to_dict(p, current_user) for p in posts]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_classic_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Post classique : tout utilisateur connecté peut publier dans un forum."""
    forum_id = data.forum_id
    if forum_id is None:
        forum_id = get_default_forum_id(db)
    else:
        forum = db.query(Forum).filter(Forum.id == forum_id, Forum.est_actif == True).first()
        if not forum:
            raise HTTPException(status_code=404, detail="Forum non trouvé")

    statut = initial_post_statut(current_user)
    post = Post(
        titre=data.titre,
        contenu=data.contenu,
        user_id=current_user.id,
        forum_id=forum_id,
        statut=statut,
        est_publie=auto_approve_post(current_user),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post_to_dict(_load_post(db, post.id), current_user)


@router.get("/me")
def my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    posts = (
        db.query(Post)
        .options(joinedload(Post.auteur), joinedload(Post.forum), joinedload(Post.likes), joinedload(Post.shares))
        .filter(Post.user_id == current_user.id)
        .order_by(Post.cree_le.desc())
        .all()
    )
    return [post_to_dict(p, current_user) for p in posts]


@router.get("/{post_id}")
def get_post(
    post_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    post = _load_post(db, post_id)
    if not post.est_publie:
        is_author = current_user and current_user.id == post.user_id
        is_mod = current_user and (
            current_user.role in MODERATOR_ROLES
            or is_forum_moderator(current_user, post.forum.createur_id)
        )
        if not is_author and not is_mod:
            raise HTTPException(status_code=404, detail="Post non trouvé")

    post.vues = (post.vues or 0) + 1
    db.commit()
    return post_to_dict(post, current_user)


@router.put("/{post_id}")
def update_post(
    post_id: int,
    data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = _load_post(db, post_id)
    can_edit = (
        post.user_id == current_user.id
        or current_user.role == UserRole.admin
        or is_forum_moderator(current_user, post.forum.createur_id)
    )
    if not can_edit:
        raise HTTPException(status_code=403, detail="Modification non autorisée")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    post.modifie_le = datetime.utcnow()
    db.commit()
    return post_to_dict(_load_post(db, post_id), current_user)


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = _load_post(db, post_id)
    can_delete = (
        post.user_id == current_user.id
        or current_user.role == UserRole.admin
        or is_forum_moderator(current_user, post.forum.createur_id)
    )
    if not can_delete:
        raise HTTPException(status_code=403, detail="Suppression non autorisée")

    db.delete(post)
    db.commit()
    return {"message": "Post supprimé"}


@router.put("/{post_id}/approve")
def approve_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = _load_post(db, post_id)
    if not is_forum_moderator(current_user, post.forum.createur_id):
        raise HTTPException(status_code=403, detail="Seul l'expert du forum peut approuver")

    post.statut = PostStatut.approuve
    post.est_publie = True
    db.commit()
    return {"message": "Post approuvé", "id": post.id}


@router.put("/{post_id}/reject")
def reject_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = _load_post(db, post_id)
    if not is_forum_moderator(current_user, post.forum.createur_id):
        raise HTTPException(status_code=403, detail="Seul l'expert du forum peut refuser")

    post.statut = PostStatut.refuse
    post.est_publie = False
    db.commit()
    return {"message": "Post refusé", "id": post.id}


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    data: CommentaireCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id, Post.est_publie == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")

    comment = Commentaire(contenu=data.contenu, user_id=current_user.id, post_id=post_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    comment.auteur = current_user
    return commentaire_to_dict(comment)


@router.delete("/{post_id}/comments/{comment_id}")
def delete_comment(
    post_id: int,
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = (
        db.query(Commentaire)
        .filter(Commentaire.id == comment_id, Commentaire.post_id == post_id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Commentaire non trouvé")

    post = db.query(Post).options(joinedload(Post.forum)).filter(Post.id == post_id).first()
    can_delete = (
        comment.user_id == current_user.id
        or current_user.role == UserRole.admin
        or (post and is_forum_moderator(current_user, post.forum.createur_id))
    )
    if not can_delete:
        raise HTTPException(status_code=403, detail="Suppression non autorisée")

    db.delete(comment)
    db.commit()
    return {"message": "Commentaire supprimé"}


@router.post("/{post_id}/like")
def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id, Post.est_publie == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")

    existing = (
        db.query(Like)
        .filter(Like.user_id == current_user.id, Like.post_id == post_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(Like(user_id=current_user.id, post_id=post_id))
        db.commit()
        liked = True

    count = db.query(Like).filter(Like.post_id == post_id).count()
    return {"liked": liked, "likes_count": count}


class ShareRequest(BaseModel):
    type: Literal["internal", "message", "external"] = "external"
    receiver_id: Optional[int] = None
    message: Optional[str] = None
    confirmed: Optional[bool] = True  # False = préparer seulement, True = enregistrer le partage


@router.post("/{post_id}/share")
def share_post(
    post_id: int,
    data: Optional[ShareRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id, Post.est_publie == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouvé")

    request_data = data or ShareRequest()
    receiver_id = None

    if request_data.type == "message":
        if not request_data.receiver_id:
            raise HTTPException(status_code=400, detail="ID du destinataire requis")
        receiver = db.query(User).filter(User.id == request_data.receiver_id).first()
        if not receiver:
            raise HTTPException(status_code=404, detail="Destinataire introuvable")
        receiver_id = receiver.id

        message_record = Message(
            sender_id=current_user.id,
            receiver_id=receiver_id,
            post_id=post_id,
            contenu=request_data.message or f"Je partage ce post avec vous : /forum/post/{post_id}",
        )
        db.add(message_record)

        notification = Notification(
            user_id=receiver_id,
            type="share",
            title="Nouveau partage de post",
            content=f"{current_user.prenom} {current_user.nom} vous a partagé un post.",
            data=f"/forum/post/{post_id}",
        )
        db.add(notification)

    elif request_data.type == "internal":
        receiver_id = current_user.id

    # Pour le type "external", on n'enregistre que si confirmed=True
    # (le frontend confirme après que l'utilisateur a réellement partagé)
    if request_data.confirmed:
        share = Share(
            user_id=current_user.id,
            post_id=post_id,
            receiver_id=receiver_id,
            type=request_data.type,
        )
        db.add(share)

    db.commit()

    count = db.query(Share).filter(Share.post_id == post_id).count()
    return {"shares_count": count, "message": "Post partagé"}
