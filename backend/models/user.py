from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# Définit les rôles possibles pour un utilisateur
class UserRole(str, enum.Enum):
    user       = "user"        # membre standard
    moderateur = "moderateur"  # peut modérer le forum
    admin      = "admin"       # accès total

class User(Base):
    # Nom de la table dans PostgreSQL
    __tablename__ = "users"

    # Colonnes de la table
    id            = Column(Integer, primary_key=True, index=True)
    nom           = Column(String(100), nullable=False)
    prenom        = Column(String(100), nullable=False)
    email         = Column(String(200), unique=True, index=True, nullable=False)
    mot_de_passe  = Column(String(255), nullable=False)         # stocke le hash, jamais le mot de passe en clair
    role          = Column(Enum(UserRole), default=UserRole.user)
    est_actif     = Column(Boolean, default=True)               # permet de désactiver un compte sans le supprimer
    avatar_url    = Column(String(500), nullable=True)          # photo de profil hébergée sur Cloudinary
    bio           = Column(String(500), nullable=True)
    type_handicap = Column(String(200), nullable=True)          # info optionnelle, saisie librement

    # Timestamps : mis à jour automatiquement par PostgreSQL
    cree_le       = Column(DateTime(timezone=True), server_default=func.now())
    modifie_le    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posts         = relationship("Post", back_populates="auteur", cascade="all, delete")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
