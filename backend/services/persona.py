"""
Client Persona (Identity Verification) — Nio-Far.

Documentation d'activation : voir /personna.md à la racine du dépôt.

Tant que PERSONA_ENABLED n'est pas true (et clés absentes),
les endpoints KYC renvoient 503 « pas encore disponible ».
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import os
from typing import Any, Optional

import httpx

logger = logging.getLogger("persona")

PERSONA_API_BASE = os.getenv("PERSONA_API_BASE", "https://withpersona.com/api/v1")
PERSONA_API_VERSION = os.getenv("PERSONA_API_VERSION", "2025-10-27")


class PersonaNotConfiguredError(Exception):
    """Persona n'est pas encore activé / configuré."""


class PersonaApiError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


def is_persona_enabled() -> bool:
    """True uniquement quand le partenariat est activé et les clés présentes."""
    enabled = os.getenv("PERSONA_ENABLED", "false").lower() in ("1", "true", "yes")
    api_key = os.getenv("PERSONA_API_KEY", "").strip()
    template_id = os.getenv("PERSONA_TEMPLATE_ID", "").strip()
    return enabled and bool(api_key) and bool(template_id)


def _api_key() -> str:
    key = os.getenv("PERSONA_API_KEY", "").strip()
    if not key:
        raise PersonaNotConfiguredError("PERSONA_API_KEY manquante.")
    return key


def _template_id() -> str:
    tid = os.getenv("PERSONA_TEMPLATE_ID", "").strip()
    if not tid:
        raise PersonaNotConfiguredError("PERSONA_TEMPLATE_ID manquante.")
    return tid


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
        "Persona-Version": PERSONA_API_VERSION,
        "Accept": "application/json",
    }


def create_inquiry(
    *,
    reference_id: str,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    email: Optional[str] = None,
) -> dict[str, Any]:
    """
    Crée une Inquiry Persona (Hosted / Embedded Flow).

    Retourne un dict normalisé :
      inquiry_id, status, hosted_url, reference_id, raw
    """
    if not is_persona_enabled():
        raise PersonaNotConfiguredError(
            "La certification d'identité n'est pas encore disponible."
        )

    fields: dict[str, Any] = {}
    if first_name:
        fields["name-first"] = first_name
    if last_name:
        fields["name-last"] = last_name
    if email:
        fields["email-address"] = email

    payload = {
        "data": {
            "attributes": {
                "inquiry-template-id": _template_id(),
                "reference-id": str(reference_id),
            }
        }
    }
    if fields:
        payload["data"]["attributes"]["fields"] = fields

    url = f"{PERSONA_API_BASE.rstrip('/')}/inquiries"
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, headers=_headers(), json=payload)
    except httpx.RequestError as exc:
        logger.error("Persona network error: %s", exc)
        raise PersonaApiError("Impossible de contacter Persona.") from exc

    if resp.status_code >= 400:
        logger.error("Persona create_inquiry failed: %s %s", resp.status_code, resp.text)
        raise PersonaApiError(
            "Erreur lors de la création de la session Persona.",
            status_code=502,
        )

    data = resp.json()
    inquiry = data.get("data") or {}
    attrs = inquiry.get("attributes") or {}
    inquiry_id = inquiry.get("id")
    if not inquiry_id:
        raise PersonaApiError("Réponse Persona invalide (inquiry_id manquant).")

    hosted_url = (
        attrs.get("hosted-url")
        or f"https://inquiry.withpersona.com/verify?inquiry-id={inquiry_id}"
    )

    return {
        "inquiry_id": inquiry_id,
        "status": attrs.get("status", "created"),
        "hosted_url": hosted_url,
        "reference_id": attrs.get("reference-id") or str(reference_id),
        "raw": data,
    }


def resume_inquiry(inquiry_id: str) -> dict[str, Any]:
    """Récupère le statut courant d'une inquiry Persona."""
    if not is_persona_enabled():
        raise PersonaNotConfiguredError(
            "La certification d'identité n'est pas encore disponible."
        )

    url = f"{PERSONA_API_BASE.rstrip('/')}/inquiries/{inquiry_id}"
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.get(url, headers=_headers())
    except httpx.RequestError as exc:
        raise PersonaApiError("Impossible de contacter Persona.") from exc

    if resp.status_code >= 400:
        raise PersonaApiError("Impossible de récupérer le statut Persona.", status_code=502)

    data = resp.json()
    inquiry = data.get("data") or {}
    attrs = inquiry.get("attributes") or {}
    return {
        "inquiry_id": inquiry.get("id"),
        "status": attrs.get("status"),
        "reference_id": attrs.get("reference-id"),
        "raw": data,
    }


def verify_webhook_signature(raw_body: bytes, signature_header: Optional[str]) -> bool:
    """
    Vérifie la signature webhook Persona (HMAC-SHA256).

    Header typique : Persona-Signature (ou config dashboard).
    Secret : PERSONA_WEBHOOK_SECRET
    """
    secret = os.getenv("PERSONA_WEBHOOK_SECRET", "").strip()
    if not secret:
        # En prod, exiger le secret. Sans secret configuré → rejeter.
        return False
    if not signature_header:
        return False

    # Persona envoie souvent : t=timestamp,v1=hex_signature
    # On accepte aussi un hex brut pour simplicité.
    provided = signature_header.strip()
    if "v1=" in provided:
        parts = dict(
            p.split("=", 1) for p in provided.split(",") if "=" in p
        )
        provided = parts.get("v1", "")
        timestamp = parts.get("t", "")
        signed_payload = f"{timestamp}.{raw_body.decode('utf-8')}".encode("utf-8") if timestamp else raw_body
    else:
        signed_payload = raw_body

    expected = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, provided)


def parse_webhook_event(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Normalise un event webhook Persona vers :
      event, inquiry_id, reference_id, status, issuing_country, passed
    """
    # Format Persona classique : data.attributes.name = "inquiry.completed"
    data = payload.get("data") or payload
    attrs = data.get("attributes") or {}
    event_name = (
        attrs.get("name")
        or payload.get("event")
        or data.get("type")
        or ""
    )

    # payload nested inquiry
    inquiry_payload = attrs.get("payload") or {}
    inquiry_data = inquiry_payload.get("data") or inquiry_payload
    if isinstance(inquiry_data, dict) and "attributes" in inquiry_data:
        inquiry_attrs = inquiry_data.get("attributes") or {}
        inquiry_id = inquiry_data.get("id") or attrs.get("inquiry-id")
        reference_id = inquiry_attrs.get("reference-id")
        status = inquiry_attrs.get("status")
    else:
        inquiry_id = (
            payload.get("inquiry_id")
            or attrs.get("inquiry-id")
            or (data.get("id") if data.get("type") == "inquiry" else None)
        )
        reference_id = attrs.get("reference-id") or payload.get("reference_id")
        status = attrs.get("status") or payload.get("status")

    passed = event_name in (
        "inquiry.completed",
        "inquiry.approved",
        "verification.completed",
    ) or status in ("completed", "approved")

    failed = event_name in (
        "inquiry.failed",
        "inquiry.declined",
        "verification.failed",
    ) or status in ("failed", "declined")

    return {
        "event": event_name,
        "inquiry_id": inquiry_id,
        "reference_id": str(reference_id) if reference_id is not None else None,
        "status": status,
        "passed": passed and not failed,
        "failed": failed,
        "issuing_country": attrs.get("fields", {}).get("address-country-code")
        if isinstance(attrs.get("fields"), dict)
        else None,
    }
