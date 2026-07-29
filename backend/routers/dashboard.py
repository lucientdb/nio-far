from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import User, Post, PostStatut, Forum, Job, Podcast
from models.user import UserRole
from core.deps import get_current_user

router = APIRouter()

DASHBOARD_ROUTES = {
    UserRole.admin: "/dashboard/admin",
    UserRole.expert: "/dashboard/expert",
    UserRole.entreprise: "/dashboard/recruteur",
    UserRole.ong: "/dashboard/recruteur",
    UserRole.user: "/dashboard",
}


@router.get("/me")
def my_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = current_user.role
    base = {
        "role": role.value,
        "dashboard_path": DASHBOARD_ROUTES.get(role, "/dashboard"),
        "user": {
            "id": current_user.id,
            "nom": current_user.nom,
            "prenom": current_user.prenom,
            "email": current_user.email,
            "avatar_url": current_user.avatar_url,
        },
    }

    if role == UserRole.admin:
        base["stats"] = {
            "users_count": db.query(func.count(User.id)).scalar(),
            "forums_count": db.query(func.count(Forum.id)).scalar(),
            "posts_pending": db.query(func.count(Post.id)).filter(Post.statut == PostStatut.en_attente).scalar(),
            "podcasts_count": db.query(func.count(Podcast.id)).scalar(),
            "jobs_count": db.query(func.count(Job.id)).scalar(),
        }
    elif role == UserRole.expert:
        my_forums = db.query(Forum).filter(Forum.createur_id == current_user.id).all()
        pending = sum(len([p for p in f.posts if p.statut == PostStatut.en_attente]) for f in my_forums)
        base["stats"] = {
            "forums_count": len(my_forums),
            "posts_pending": pending,
            "my_posts_count": db.query(func.count(Post.id)).filter(Post.user_id == current_user.id).scalar(),
        }
    elif role in {UserRole.entreprise, UserRole.ong}:
        base["stats"] = {
            "jobs_active": db.query(func.count(Job.id)).filter(
                Job.user_id == current_user.id, Job.est_actif == True
            ).scalar(),
            "jobs_total": db.query(func.count(Job.id)).filter(Job.user_id == current_user.id).scalar(),
        }
    else:
        base["stats"] = {
            "my_posts_count": db.query(func.count(Post.id)).filter(Post.user_id == current_user.id).scalar(),
            "posts_pending": db.query(func.count(Post.id)).filter(
                Post.user_id == current_user.id, Post.statut == PostStatut.en_attente
            ).scalar(),
            "posts_approved": db.query(func.count(Post.id)).filter(
                Post.user_id == current_user.id, Post.statut == PostStatut.approuve
            ).scalar(),
        }

    return base
