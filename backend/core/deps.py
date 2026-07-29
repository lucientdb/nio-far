from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError

from database import get_db
from models import User
from core.security import decode_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload.get("sub"))

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé",
            )

        if not user.est_actif:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ce compte a été désactivé",
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
        )
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token malformé",
        )


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None


def require_expert(current_user: User = Depends(get_current_user)) -> User:
    """Nécessite un expert vérifié ou un admin"""
    from models.user import UserRole
    if current_user.role == UserRole.ADMIN:
        return current_user
    if current_user.role == UserRole.EXPERT and current_user.est_expert_verifie:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Accès réservé aux experts vérifiés"
    )


def require_organisation(current_user: User = Depends(get_current_user)) -> User:
    """Nécessite une organisation vérifiée ou un admin"""
    from models.user import UserRole
    if current_user.role == UserRole.ADMIN:
        return current_user
    if current_user.role == UserRole.ORGANISATION and current_user.est_expert_verifie:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Accès réservé aux organisations vérifiées"
    )


def require_moderateur(current_user: User = Depends(get_current_user)) -> User:
    """Nécessite un modérateur ou un admin"""
    from models.user import UserRole
    if current_user.role in [UserRole.MODERATEUR, UserRole.ADMIN]:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Accès réservé aux modérateurs et administrateurs"
    )


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Nécessite un administrateur"""
    from models.user import UserRole
    if current_user.role == UserRole.ADMIN:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Accès réservé aux administrateurs"
    )


def is_owner_or_modo(owner_id: int, current_user: User) -> bool:
    """Vérifie si l'utilisateur est le propriétaire ou un modérateur/admin"""
    from models.user import UserRole
    if current_user.id == owner_id:
        return True
    if current_user.role in [UserRole.MODERATEUR, UserRole.ADMIN]:
        return True
    return False


def is_owner_or_admin(owner_id: int, current_user: User) -> bool:
    """Vérifie si l'utilisateur est le propriétaire ou un admin"""
    from models.user import UserRole
    if current_user.id == owner_id:
        return True
    if current_user.role == UserRole.ADMIN:
        return True
    return False
