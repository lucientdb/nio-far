from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import User, Forum, Post, PostStatut, Commentaire
from models.user import UserRole
from core.deps import get_current_user, get_optional_user
from core.permissions import require_roles, is_forum_moderator
from schemas.helpers import post_to_dict, initial_post_statut, auto_approve_post

router = APIRouter()


class ForumCreate(BaseModel):
    titre: str
    description: Optional[str] = None


class ForumUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    est_actif: Optional[bool] = None


class PostCreate(BaseModel):
    titre: str
    contenu: str


class PostUpdate(BaseModel):
    titre: Optional[str] = None
    contenu: Optional[str] = None


def _load_forum(db: Session, forum_id: int) -> Forum:
    forum = db.query(Forum).filter(Forum.id == forum_id, Forum.est_actif == True).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum non trouvé")
    return forum


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
def list_forums(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    forums = (
        db.query(Forum)
        .filter(Forum.est_actif == True)
        .order_by(Forum.cree_le.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": f.id,
            "titre": f.titre,
            "description": f.description,
            "createur": {
                "id": f.createur.id,
                "nom": f.createur.nom,
                "prenom": f.createur.prenom,
            },
            "posts_count": len(f.posts),
            "cree_le": f.cree_le.isoformat(),
        }
        for f in forums
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_forum(
    data: ForumCreate,
    current_user: User = Depends(require_roles(UserRole.expert, UserRole.admin)),
    db: Session = Depends(get_db),
):
    forum = Forum(
        titre=data.titre,
        description=data.description,
        createur_id=current_user.id,
    )
    db.add(forum)
    db.commit()
    db.refresh(forum)
    return {
        "id": forum.id,
        "titre": forum.titre,
        "description": forum.description,
        "createur_id": forum.createur_id,
        "cree_le": forum.cree_le.isoformat(),
    }


@router.get("/{forum_id}")
def get_forum(forum_id: int, db: Session = Depends(get_db)):
    forum = _load_forum(db, forum_id)
    return {
        "id": forum.id,
        "titre": forum.titre,
        "description": forum.description,
        "createur": {
            "id": forum.createur.id,
            "nom": forum.createur.nom,
            "prenom": forum.createur.prenom,
        },
        "posts_count": len([p for p in forum.posts if p.est_publie]),
        "cree_le": forum.cree_le.isoformat(),
    }


@router.put("/{forum_id}")
def update_forum(
    forum_id: int,
    data: ForumUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    forum = db.query(Forum).filter(Forum.id == forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum non trouvé")
    if not is_forum_moderator(current_user, forum.createur_id):
        raise HTTPException(status_code=403, detail="Accès refusé")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(forum, field, value)
    db.commit()
    db.refresh(forum)
    return {"message": "Forum mis à jour", "id": forum.id}


@router.get("/{forum_id}/posts")
def list_forum_posts(
    forum_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    _load_forum(db, forum_id)
    query = (
        db.query(Post)
        .options(
            joinedload(Post.auteur),
            joinedload(Post.forum),
            joinedload(Post.commentaires),
            joinedload(Post.likes),
            joinedload(Post.shares),
        )
        .filter(Post.forum_id == forum_id, Post.est_publie == True)
        .order_by(Post.cree_le.desc())
        .offset(skip)
        .limit(limit)
    )
    posts = query.all()
    return [post_to_dict(p, current_user) for p in posts]


@router.post("/{forum_id}/posts", status_code=status.HTTP_201_CREATED)
def create_forum_post(
    forum_id: int,
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    forum = _load_forum(db, forum_id)
    statut = initial_post_statut(current_user)
    post = Post(
        titre=data.titre,
        contenu=data.contenu,
        user_id=current_user.id,
        forum_id=forum.id,
        statut=statut,
        est_publie=auto_approve_post(current_user),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post = _load_post(db, post.id)
    return post_to_dict(post, current_user)


@router.get("/{forum_id}/posts/pending")
def list_pending_posts(
    forum_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    forum = db.query(Forum).filter(Forum.id == forum_id).first()
    if not forum:
        raise HTTPException(status_code=404, detail="Forum non trouvé")
    if not is_forum_moderator(current_user, forum.createur_id):
        raise HTTPException(status_code=403, detail="Seul l'expert du forum peut voir les demandes")

    posts = (
        db.query(Post)
        .options(joinedload(Post.auteur), joinedload(Post.forum), joinedload(Post.likes), joinedload(Post.shares))
        .filter(Post.forum_id == forum_id, Post.statut == PostStatut.en_attente)
        .order_by(Post.cree_le.asc())
        .all()
    )
    return [post_to_dict(p, current_user) for p in posts]


@router.get("/me/forums")
def my_forums(
    current_user: User = Depends(require_roles(UserRole.expert, UserRole.admin)),
    db: Session = Depends(get_db),
):
    forums = (
        db.query(Forum)
        .filter(Forum.createur_id == current_user.id)
        .order_by(Forum.cree_le.desc())
        .all()
    )
    return [
        {
            "id": f.id,
            "titre": f.titre,
            "description": f.description,
            "pending_count": len([p for p in f.posts if p.statut == PostStatut.en_attente]),
            "posts_count": len(f.posts),
            "cree_le": f.cree_le.isoformat(),
        }
        for f in forums
    ]
