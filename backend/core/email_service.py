"""
Envoi d'emails transactionnels via Resend (API HTTP) ou SMTP.

Variables .env :
  RESEND_API_KEY=re_xxxx          # recommandé (API Resend)
  SMTP_FROM=onboarding@resend.dev # ou ton domaine vérifié

  # Alternative SMTP Resend :
  SMTP_HOST=smtp.resend.com
  SMTP_PORT=587
  SMTP_USER=resend
  SMTP_PASSWORD=re_xxxx
  SMTP_FROM=onboarding@resend.dev

Aucune simulation : si l'envoi échoue, une exception est levée.
"""
from __future__ import annotations

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

logger = logging.getLogger("email_service")


class EmailSendError(Exception):
    """Échec d'envoi d'email (configuration ou fournisseur)."""


def _from_address() -> str:
    return (
        os.getenv("SMTP_FROM", "").strip()
        or os.getenv("RESEND_FROM", "").strip()
        or "onboarding@resend.dev"
    )


def _resend_api_key() -> str:
    key = os.getenv("RESEND_API_KEY", "").strip()
    if key:
        return key
    # Compat : clé Resend souvent mise dans SMTP_PASSWORD
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
    if smtp_pass.startswith("re_"):
        return smtp_pass
    return ""


def send_email(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> None:
    """Envoie un email réel. Lève EmailSendError en cas d'échec."""
    api_key = _resend_api_key()
    if api_key:
        _send_via_resend_api(api_key, to_email, subject, text_body, html_body)
        return

    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
    if smtp_host and smtp_user and smtp_pass:
        _send_via_smtp(to_email, subject, text_body, html_body)
        return

    raise EmailSendError(
        "Email non configuré. Définissez RESEND_API_KEY (ou SMTP_HOST/USER/PASSWORD) dans backend/.env"
    )


def _send_via_resend_api(
    api_key: str,
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str | None,
) -> None:
    payload: dict = {
        "from": _from_address(),
        "to": [to_email],
        "subject": subject,
        "text": text_body,
    }
    if html_body:
        payload["html"] = html_body

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.RequestError as exc:
        logger.error("Resend network error: %s", exc)
        raise EmailSendError("Impossible de contacter Resend. Réessayez plus tard.") from exc

    if resp.status_code >= 400:
        logger.error("Resend API error %s: %s", resp.status_code, resp.text)
        raise EmailSendError(
            "Échec de l'envoi de l'email de vérification. Vérifiez la configuration Resend."
        )

    logger.info("Email Resend envoyé à %s", to_email)


def _send_via_smtp(
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str | None,
) -> None:
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from = _from_address()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = smtp_from
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    if html_body:
        msg.attach(MIMEText(html_body, "html", "utf-8"))

    envelope_from = smtp_from
    if "<" in smtp_from and ">" in smtp_from:
        envelope_from = smtp_from.split("<", 1)[1].split(">", 1)[0].strip()

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(envelope_from, [to_email], msg.as_string())
    except Exception as exc:
        logger.error("SMTP error to %s: %s", to_email, exc)
        raise EmailSendError(
            "Échec de l'envoi de l'email de vérification (SMTP)."
        ) from exc

    logger.info("Email SMTP envoyé à %s", to_email)


def send_signup_otp(to_email: str, code: str, prenom: str | None = None) -> None:
    name = prenom or "bonjour"
    subject = "Votre code de vérification Nio-Far"
    text = f"""Bonjour {name},

Voici votre code de vérification pour activer votre compte Nio-Far :

  {code}

Ce code est valable 10 minutes. Ne le partagez avec personne.

Si vous n'avez pas créé de compte, ignorez cet email.

L'équipe Nio-Far
"""
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#111;">Nio Far</h2>
      <p>Bonjour {name},</p>
      <p>Voici votre code de vérification pour activer votre compte :</p>
      <p style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;
                background:#f3f4f6;padding:16px;border-radius:12px;">{code}</p>
      <p style="color:#6b7280;font-size:14px;">Valable 10 minutes. Ne le partagez avec personne.</p>
      <p style="color:#9ca3af;font-size:12px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
    """
    send_email(to_email, subject, text, html)
