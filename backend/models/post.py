from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Post(Base):
    """
    Représente un post du forum.
    Un post appartient à un User (via user_id).
    Un post peut avoir plusieurs commentaires (relation one-to-many).
    """
    __tablename__ = "posts"

    id          = Column(Integer, primary_key=True, index=True)
    titre       = Column(String(300), nullable=False)
    contenu     = Column(Text, nullable=False)
    est_publie  = Column(Boolean, default=True)    # False = en attente de modération
    vues        = Column(Integer, default=0)

    # Clé étrangère : relie ce post à son auteur dans la table users
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)

    cree_le     = Column(DateTime(timezone=True), server_default=func.now())
    modifie_le  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relation SQLAlchemy : permet de faire post.auteur pour accéder à l'objet User
    auteur      = relationship("User", back_populates="posts")
    commentaires = relationship("Commentaire", back_populates="post", cascade="all, delete")


class Commentaire(Base):
    """Commentaire sur un post du forum"""
    __tablename__ = "commentaires"

    id          = Column(Integer, primary_key=True, index=True)
    contenu     = Column(Text, nullable=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id     = Column(Integer, ForeignKey("posts.id"), nullable=False)
    cree_le     = Column(DateTime(timezone=True), server_default=func.now())

    auteur      = relationship("User")
    post        = relationship("Post", back_populates="commentaires")
