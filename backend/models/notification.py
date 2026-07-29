from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(String(500), nullable=False)
    data = Column(String(1000), nullable=True)
    read = Column(Boolean, default=False)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
