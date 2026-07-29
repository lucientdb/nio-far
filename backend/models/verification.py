from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Verification(Base):
    """
    Table pour stocker les sessions de verification (OTP email et KYC).
    Le token/code n est jamais stocke en clair : uniquement son hash SHA-256.
    """
    __tablename__ = "verifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type       = Column(String(20), nullable=False)       # email_otp | kyc_session
    token_hash = Column(String(64), nullable=False, index=True)  # SHA-256 hex
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at    = Column(DateTime(timezone=True), nullable=True)
    status     = Column(String(20), default="pending")    # pending | completed | expired | failed
    attempts   = Column(Integer, default=0)               # nb de tentatives (anti-bruteforce)
    meta       = Column(JSON, nullable=True)              # domaine email, session_id KYC, etc.
    cree_le    = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="verifications")

    def __repr__(self):
        return f"<Verification user={self.user_id} type={self.type} status={self.status}>"
