"""
Router Verification — email pro OTP + identité via Persona.

La simulation KYC maison a été retirée.
Voir /personna.md pour activer Persona après signature du partenariat.
"""
import os
import hmac
import hashlib
import random
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from pydantic import BaseModel, EmailStr

from database import get_db
from models import User, Verification
from core.deps import get_current_user
from core.email_service import send_signup_otp, EmailSendError
from services import persona as persona_client

router = APIRouter()
logger = logging.getLogger("verification")

CERTIFICATION_UNAVAILABLE = (
    "Cette fonctionnalité n'est pas encore disponible. "
    "Vous serez informé une fois qu'elle l'est !"
)

FREE_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "yahoo.fr", "hotmail.com", "hotmail.fr",
    "outlook.com", "outlook.fr", "live.com", "live.fr", "icloud.com",
    "aol.com", "mail.com", "protonmail.com", "proton.me", "yandex.com",
    "gmx.com", "gmx.fr", "orange.fr", "sfr.fr", "free.fr", "bouygtel.fr",
}


class EmailOtpSendRequest(BaseModel):
    email: EmailStr


class EmailOtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class KycInitiateResponse(BaseModel):
    session_id: str
    inquiry_id: str
    url: str
    step: str = "persona_hosted"
    message: Optional[str] = None


class KycStatusResponse(BaseModel):
    session_id: str
    status: str
    step: str
    inquiry_id: Optional[str] = None
    url: Optional[str] = None
    issuing_country: Optional[str] = None
    message: Optional[str] = None


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def is_professional_email(email: str) -> bool:
    domain = email.split("@")[-1].lower()
    return domain not in FREE_EMAIL_DOMAINS


def send_otp_email(to_email: str, code: str):
    """Envoie l'OTP certification pro via Resend (pas de simulation)."""
    try:
        send_signup_otp(to_email, code)
    except EmailSendError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


def _find_by_inquiry_id(db: Session, inquiry_id: str) -> Optional[Verification]:
    sessions = db.query(Verification).filter(
        Verification.type == "kyc_session",
        Verification.status == "pending",
    ).all()
    for v in sessions:
        if v.meta and v.meta.get("inquiry_id") == inquiry_id:
            return v
    return None


def _find_by_session_id(db: Session, user_id: int, session_id: str) -> Optional[Verification]:
    sessions = db.query(Verification).filter(
        Verification.user_id == user_id,
        Verification.type == "kyc_session",
    ).all()
    for v in sessions:
        if v.meta and v.meta.get("session_id") == session_id:
            return v
    return None


def _raise_if_persona_unavailable():
    if not persona_client.is_persona_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=CERTIFICATION_UNAVAILABLE,
        )


# ── Email professionnel OTP ──────────────────────────────────────────

@router.post("/email-otp/send")
def send_email_otp(
    payload: EmailOtpSendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Génère et envoie un code OTP à l'email pro."""
    # Même message tant que la certification n'est pas ouverte au public
    if os.getenv("CERTIFICATION_PUBLIC", "false").lower() not in ("1", "true", "yes"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=CERTIFICATION_UNAVAILABLE,
        )

    email = payload.email.strip().lower()

    if not is_professional_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les adresses email personnelles (Gmail, Yahoo...) ne sont pas autorisées.",
        )

    existing_user = db.query(User).filter(
        User.pro_email == email,
        User.is_verified == True,  # noqa: E712
        User.id != current_user.id,
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette adresse email professionnelle est déjà associée à un autre compte certifié.",
        )

    db.query(Verification).filter(
        Verification.user_id == current_user.id,
        Verification.type == "email_otp",
        Verification.status == "pending",
    ).update({"status": "expired"})

    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    verification = Verification(
        user_id=current_user.id,
        type="email_otp",
        token_hash=hash_token(code),
        expires_at=expires_at,
        status="pending",
        meta={"email": email},
    )
    db.add(verification)
    db.commit()

    send_otp_email(email, code)
    return {"message": "Un code de vérification vous a été envoyé."}


@router.post("/email-otp/verify")
def verify_email_otp(
    payload: EmailOtpVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if os.getenv("CERTIFICATION_PUBLIC", "false").lower() not in ("1", "true", "yes"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=CERTIFICATION_UNAVAILABLE,
        )

    email = payload.email.strip().lower()
    code = payload.code.strip()

    verification = db.query(Verification).filter(
        Verification.user_id == current_user.id,
        Verification.type == "email_otp",
        Verification.status == "pending",
    ).first()

    if not verification:
        raise HTTPException(status_code=400, detail="Aucune session de vérification en cours.")

    if verification.expires_at.replace(tzinfo=None) < datetime.utcnow():
        verification.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="Le code de vérification a expiré.")

    verification.attempts += 1
    if verification.attempts > 3:
        verification.status = "failed"
        db.commit()
        raise HTTPException(status_code=400, detail="Trop de tentatives. Demandez un nouveau code.")

    if not hmac.compare_digest(verification.token_hash, hash_token(code)):
        db.commit()
        raise HTTPException(status_code=400, detail="Code de vérification incorrect.")

    verification.status = "completed"
    verification.used_at = datetime.utcnow()

    domain = email.split("@")[-1].split(".")[0].capitalize()
    current_user.is_verified = True
    current_user.verification_type = "email_pro"
    current_user.verified_at = datetime.utcnow()
    current_user.pro_email = email
    if not current_user.entreprise_nom and current_user.role in ["entreprise", "ong"]:
        current_user.entreprise_nom = domain

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Votre adresse email professionnelle a été certifiée avec succès.",
        "user": {
            "is_verified": current_user.is_verified,
            "verification_type": current_user.verification_type,
            "pro_email": current_user.pro_email,
        },
    }


# ── Identité via Persona (vrai code, plus de simulation) ─────────────

@router.post("/kyc/initiate", response_model=KycInitiateResponse)
def initiate_kyc(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Crée une Inquiry Persona et renvoie l'URL Hosted Flow.
    Document NFC + selfie sont gérés entièrement par Persona.
    """
    _raise_if_persona_unavailable()

    if current_user.is_verified and current_user.verification_type == "kyc":
        raise HTTPException(status_code=400, detail="Votre identité est déjà vérifiée.")

    db.query(Verification).filter(
        Verification.user_id == current_user.id,
        Verification.type == "kyc_session",
        Verification.status == "pending",
    ).update({"status": "expired"})

    try:
        inquiry = persona_client.create_inquiry(
            reference_id=str(current_user.id),
            first_name=current_user.prenom,
            last_name=current_user.nom,
            email=current_user.email,
        )
    except persona_client.PersonaNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=CERTIFICATION_UNAVAILABLE,
        )
    except persona_client.PersonaApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc))

    session_id = f"kyc_{secrets.token_hex(8)}"
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=2)

    verification = Verification(
        user_id=current_user.id,
        type="kyc_session",
        token_hash=hash_token(session_token),
        expires_at=expires_at,
        status="pending",
        meta={
            "session_id": session_id,
            "inquiry_id": inquiry["inquiry_id"],
            "provider": "persona",
            "step": "persona_hosted",
            "hosted_url": inquiry["hosted_url"],
            "reference_id": inquiry["reference_id"],
        },
    )
    db.add(verification)
    db.commit()

    return KycInitiateResponse(
        session_id=session_id,
        inquiry_id=inquiry["inquiry_id"],
        url=inquiry["hosted_url"],
        step="persona_hosted",
        message="Ouvrez l'URL Persona pour scanner votre document à puce et votre visage.",
    )


@router.get("/kyc/{session_id}/status", response_model=KycStatusResponse)
def get_kyc_status(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _raise_if_persona_unavailable()

    verification = _find_by_session_id(db, current_user.id, session_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Session introuvable.")

    meta = verification.meta or {}
    inquiry_id = meta.get("inquiry_id")

    # Optionnel : rafraîchir le statut auprès de Persona
    if inquiry_id and persona_client.is_persona_enabled() and verification.status == "pending":
        try:
            remote = persona_client.resume_inquiry(inquiry_id)
            if remote.get("status") in ("completed", "approved"):
                # Le webhook reste la source de vérité ; ici info seule
                pass
        except persona_client.PersonaApiError:
            pass

    return KycStatusResponse(
        session_id=session_id,
        status=verification.status,
        step=meta.get("step", "unknown"),
        inquiry_id=inquiry_id,
        url=meta.get("hosted_url"),
        issuing_country=meta.get("issuing_country"),
        message=None,
    )


@router.post("/webhook/kyc")
@router.post("/webhook/persona")
async def persona_webhook(
    request: Request,
    persona_signature: Optional[str] = Header(None, alias="Persona-Signature"),
    x_webhook_signature: Optional[str] = Header(None, alias="X-Webhook-Signature"),
    db: Session = Depends(get_db),
):
    """
    Webhook Persona : applique le badge quand inquiry.completed.
    Configure l'URL dans le dashboard Persona →
      https://VOTRE_API/api/verification/webhook/persona
    """
    body = await request.body()
    signature = persona_signature or x_webhook_signature

    if persona_client.is_persona_enabled():
        if not persona_client.verify_webhook_signature(body, signature):
            raise HTTPException(status_code=401, detail="Signature webhook Persona invalide.")
    else:
        # Webhook reçu alors que Persona n'est pas activé
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=CERTIFICATION_UNAVAILABLE,
        )

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload JSON invalide.")

    event = persona_client.parse_webhook_event(payload)
    inquiry_id = event.get("inquiry_id")
    reference_id = event.get("reference_id")

    target = None
    if inquiry_id:
        target = _find_by_inquiry_id(db, inquiry_id)

    if not target and reference_id and str(reference_id).isdigit():
        target = (
            db.query(Verification)
            .filter(
                Verification.user_id == int(reference_id),
                Verification.type == "kyc_session",
                Verification.status == "pending",
            )
            .order_by(Verification.id.desc())
            .first()
        )

    if not target:
        logger.warning("Webhook Persona: session introuvable inquiry=%s ref=%s", inquiry_id, reference_id)
        raise HTTPException(status_code=404, detail="Session de vérification introuvable.")

    user = target.user

    if event.get("passed"):
        target.status = "completed"
        target.used_at = datetime.utcnow()
        meta = dict(target.meta or {})
        meta.update({
            "step": "completed",
            "consent_shared": True,
            "issuing_country": event.get("issuing_country"),
            "persona_event": event.get("event"),
        })
        target.meta = meta
        flag_modified(target, "meta")

        user.is_verified = True
        user.verification_type = "kyc"
        user.verified_at = datetime.utcnow()
        user.pro_email = None
        db.commit()
        logger.info("User %s verified via Persona inquiry %s", user.id, inquiry_id)
    elif event.get("failed"):
        target.status = "failed"
        meta = dict(target.meta or {})
        meta.update({"step": "failed", "persona_event": event.get("event")})
        target.meta = meta
        flag_modified(target, "meta")
        db.commit()
        logger.info("Persona inquiry %s failed for user %s", inquiry_id, user.id)

    return {"status": "success"}


@router.delete("/revoke")
def revoke_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_verified:
        raise HTTPException(status_code=400, detail="Votre compte n'est pas certifié.")

    current_user.is_verified = False
    current_user.verification_type = None
    current_user.verified_at = None
    current_user.pro_email = None

    db.query(Verification).filter(
        Verification.user_id == current_user.id
    ).update({"status": "revoked"})

    db.commit()
    db.refresh(current_user)
    return {"message": "Votre certification a été révoquée avec succès."}
