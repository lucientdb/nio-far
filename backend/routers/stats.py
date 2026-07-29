from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import (
    User, Post, Job, Temoignage, Expert, Podcast, Forum,
    Ressource, AnnuaireService, Photo,
)

router = APIRouter()


@router.get("/public")
def public_stats(db: Session = Depends(get_db)):
    return {
        "users_count": db.query(func.count(User.id)).filter(User.est_actif == True).scalar() or 0,
        "posts_count": db.query(func.count(Post.id)).filter(Post.est_publie == True).scalar() or 0,
        "jobs_count": db.query(func.count(Job.id)).filter(Job.est_actif == True).scalar() or 0,
        "temoignages_count": db.query(func.count(Temoignage.id)).filter(Temoignage.est_publie == True).scalar() or 0,
        "experts_count": db.query(func.count(Expert.id)).filter(Expert.est_actif == True).scalar() or 0,
        "podcasts_count": db.query(func.count(Podcast.id)).filter(Podcast.est_publie == True).scalar() or 0,
        "forums_count": db.query(func.count(Forum.id)).filter(Forum.est_actif == True).scalar() or 0,
        "ressources_count": db.query(func.count(Ressource.id)).filter(Ressource.est_actif == True).scalar() or 0,
        "services_count": db.query(func.count(AnnuaireService.id)).filter(AnnuaireService.est_actif == True).scalar() or 0,
        "photos_count": db.query(func.count(Photo.id)).filter(Photo.est_publie == True).scalar() or 0,
    }
