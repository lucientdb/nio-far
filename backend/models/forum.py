from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Forum(Base):
    __tablename__ = "forums"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    est_actif = Column(Boolean, default=True)
    createur_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    modifie_le = Column(DateTime(timezone=True), onupdate=func.now())

    createur = relationship("User", back_populates="forums")
    posts = relationship("Post", back_populates="forum", cascade="all, delete")


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_like_user_post"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User")
    post = relationship("Post", back_populates="likes")


class Share(Base):
    __tablename__ = "shares"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String(50), nullable=False, default="external")
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    auteur = relationship("User", foreign_keys=[user_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    post = relationship("Post", back_populates="shares")
