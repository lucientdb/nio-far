from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    user = "user"
    expert = "expert"
    entreprise = "entreprise"
    ong = "ong"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    mot_de_passe = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    est_actif = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(String(500), nullable=True)
    type_handicap = Column(String(200), nullable=True)
    ville = Column(String(100), nullable=True)
    # Champs pour entreprises / ONG
    entreprise_nom = Column(String(200), nullable=True)
    contact = Column(String(100), nullable=True)
    domaine_intervention = Column(String(300), nullable=True)
    # Champ pour experts
    specialite = Column(String(200), nullable=True)

    # Certification du compte (système LinkedIn-style)
    is_verified = Column(Boolean, default=False)
    verification_type = Column(String(20), nullable=True)   # 'email_pro' | 'kyc'
    verified_at = Column(DateTime(timezone=True), nullable=True)
    pro_email = Column(String(200), nullable=True)          # email professionnel vérifié

    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    modifie_le = Column(DateTime(timezone=True), onupdate=func.now())

    posts = relationship("Post", back_populates="auteur", cascade="all, delete")
    forums = relationship("Forum", back_populates="createur", cascade="all, delete")
    messages_sent = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id", cascade="all, delete")
    messages_received = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    verifications = relationship("Verification", back_populates="user", cascade="all, delete")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
