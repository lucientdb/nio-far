from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class MediaFormat(str, enum.Enum):
    audio = "audio"
    video = "video"


class Podcast(Base):
    __tablename__ = "podcasts"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    format = Column(Enum(MediaFormat), default=MediaFormat.audio, nullable=False)
    media_url = Column(String(500), nullable=False)
    couverture_url = Column(String(500), nullable=True)
    duree_secondes = Column(Integer, nullable=True)
    est_publie = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User")


class Temoignage(Base):
    __tablename__ = "temoignages"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    contenu = Column(Text, nullable=False)
    note = Column(Integer, nullable=True)          # Note 1-5 sur le service
    service = Column(String(100), nullable=True)   # forum, emploi, education, medias, services
    photo_url = Column(String(500), nullable=True)
    est_publie = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    entreprise = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    lieu = Column(String(200), nullable=True)
    type_contrat = Column(String(100), nullable=True)
    est_actif = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    expire_le = Column(DateTime(timezone=True), nullable=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User")


class Expert(Base):
    __tablename__ = "experts"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    specialite = Column(String(200), nullable=False)
    organisation = Column(String(200), nullable=True)
    email = Column(String(200), nullable=True)
    telephone = Column(String(50), nullable=True)
    ville = Column(String(100), nullable=True)
    photo_url = Column(String(500), nullable=True)
    est_actif = Column(Boolean, default=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())


class Ressource(Base):
    __tablename__ = "ressources"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    categorie = Column(String(100), nullable=False, index=True)
    duree = Column(String(100), nullable=True)
    niveau = Column(String(100), nullable=True)
    lien = Column(String(500), nullable=True)
    est_actif = Column(Boolean, default=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())


class AnnuaireService(Base):
    __tablename__ = "annuaire_services"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(300), nullable=False)
    sigle = Column(String(50), nullable=True)
    categorie = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    missions = Column(Text, nullable=True)
    telephone = Column(String(50), nullable=True)
    email = Column(String(200), nullable=True)
    site = Column(String(500), nullable=True)
    adresse = Column(String(300), nullable=True)
    villes = Column(String(300), nullable=True)
    horaires = Column(String(200), nullable=True)
    gratuit = Column(Boolean, default=True)
    est_actif = Column(Boolean, default=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    lieu = Column(String(200), nullable=True)
    image_url = Column(String(500), nullable=False)
    est_publie = Column(Boolean, default=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())


class Signalement(Base):
    __tablename__ = "signalements"

    id = Column(Integer, primary_key=True, index=True)
    cible_type = Column(String(50), nullable=False, index=True)  # post, commentaire, temoignage, podcast
    cible_id = Column(Integer, nullable=False, index=True)
    raison = Column(Text, nullable=False)
    est_traite = Column(Boolean, default=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User")
