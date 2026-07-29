"""
Router pour l'upload de fichiers (avatars, documents de certification).
- POST /api/uploads/avatar      → remplace l'avatar de l'utilisateur connecté
- POST /api/uploads/certification → soumet un document de certification
"""
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from core.deps import get_current_user
from database import get_db
from models import User

router = APIRouter()

# Dossier racine des fichiers statiques (relatif à main.py)
STATIC_DIR = Path(__file__).parent.parent / "static"
AVATAR_DIR = STATIC_DIR / "avatars"

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

MAX_AVATAR_SIZE = 5 * 1024 * 1024       # 5 MB


def _save_file(upload: UploadFile, dest_dir: Path, max_size: int, allowed_types: set) -> str:
    """Enregistre un fichier uploadé et retourne le chemin relatif."""
    if upload.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier non autorisé : {upload.content_type}",
        )

    content = upload.file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Fichier trop volumineux (max {max_size // 1024 // 1024} MB)",
        )

    ext = Path(upload.filename or "file").suffix or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / filename).write_bytes(content)

    # Retourner l'URL publique relative
    return f"/static/{dest_dir.name}/{filename}"


@router.post("/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remplace l'avatar de l'utilisateur connecté.
    Accepte JPEG, PNG, WEBP, GIF. Max 5 MB.
    Retourne { avatar_url: "..." }
    """
    url = _save_file(file, AVATAR_DIR, MAX_AVATAR_SIZE, ALLOWED_IMAGE_TYPES)

    # Supprimer l'ancien avatar local si existant
    if current_user.avatar_url and current_user.avatar_url.startswith("/static/avatars/"):
        old = STATIC_DIR / current_user.avatar_url.lstrip("/static/")
        if old.exists():
            old.unlink(missing_ok=True)

    current_user.avatar_url = url
    db.commit()
    db.refresh(current_user)
    return {"avatar_url": url, "message": "Avatar mis à jour"}

