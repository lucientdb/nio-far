from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Podcast(Base):
    """
    Fichier audio hébergé sur Cloudinary.
    audio_url = lien Cloudinary vers le fichier .mp3
    couverture_url = image de couverture de l'épisode
    """
    __tablename__ = "podcasts"

    id             = Column(Integer, primary_key=True, index=True)
    titre          = Column(String(300), nullable=False)
    description    = Column(Text, nullable=True)
    audio_url      = Column(String(500), nullable=False)   # URL Cloudinary du fichier audio
    couverture_url = Column(String(500), nullable=True)    # URL de l'image de couverture
    duree_secondes = Column(Integer, nullable=True)        # durée en secondes
    est_publie     = Column(Boolean, default=False)        # admin valide avant publication
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    cree_le        = Column(DateTime(timezone=True), server_default=func.now())

    auteur         = relationship("User")


class Temoignage(Base):
    """Témoignage d'une personne en situation de handicap"""
    __tablename__ = "temoignages"

    id          = Column(Integer, primary_key=True, index=True)
    titre       = Column(String(300), nullable=False)
    contenu     = Column(Text, nullable=False)
    photo_url   = Column(String(500), nullable=True)
    est_publie  = Column(Boolean, default=False)   # validé par un modérateur avant affichage
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    cree_le     = Column(DateTime(timezone=True), server_default=func.now())

    auteur      = relationship("User")


class Job(Base):
    """Offre d'emploi, stage ou bénévolat"""
    __tablename__ = "jobs"

    id              = Column(Integer, primary_key=True, index=True)
    titre           = Column(String(300), nullable=False)
    entreprise      = Column(String(200), nullable=False)
    description     = Column(Text, nullable=False)
    lieu            = Column(String(200), nullable=True)
    type_contrat    = Column(String(100), nullable=True)  # CDI, CDD, Stage, Bénévolat...
    est_actif       = Column(Boolean, default=True)        # l'offre est-elle encore ouverte ?
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    expire_le       = Column(DateTime(timezone=True), nullable=True)
    cree_le         = Column(DateTime(timezone=True), server_default=func.now())

    auteur          = relationship("User")


class Expert(Base):
    """
    Annuaire des experts (médecins, juristes, assistants sociaux...).
    Créé directement par un admin, pas par inscription classique.
    """
    __tablename__ = "experts"

    id          = Column(Integer, primary_key=True, index=True)
    nom         = Column(String(200), nullable=False)
    specialite  = Column(String(200), nullable=False)   # ex: "Droit du handicap", "Kinésithérapie"
    organisation = Column(String(200), nullable=True)
    email       = Column(String(200), nullable=True)
    telephone   = Column(String(50), nullable=True)
    ville       = Column(String(100), nullable=True)
    photo_url   = Column(String(500), nullable=True)
    est_actif   = Column(Boolean, default=True)
    cree_le     = Column(DateTime(timezone=True), server_default=func.now())
