from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class PostStatut(str, enum.Enum):
    brouillon = "brouillon"
    en_attente = "en_attente"
    approuve = "approuve"
    refuse = "refuse"


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    contenu = Column(Text, nullable=False)
    statut = Column(Enum(PostStatut), default=PostStatut.en_attente, index=True)
    est_publie = Column(Boolean, default=False)
    vues = Column(Integer, default=0)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    forum_id = Column(Integer, ForeignKey("forums.id"), nullable=False, index=True)

    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    modifie_le = Column(DateTime(timezone=True), onupdate=func.now())

    auteur = relationship("User", back_populates="posts")
    forum = relationship("Forum", back_populates="posts")
    commentaires = relationship("Commentaire", back_populates="post", cascade="all, delete")
    likes = relationship("Like", back_populates="post", cascade="all, delete")
    shares = relationship("Share", back_populates="post", cascade="all, delete")


class Commentaire(Base):
    __tablename__ = "commentaires"

    id = Column(Integer, primary_key=True, index=True)
    contenu = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User")
    post = relationship("Post", back_populates="commentaires")
