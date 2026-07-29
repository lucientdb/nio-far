from fastapi import Depends, HTTPException, status
from models.user import User, UserRole
from core.deps import get_current_user

ROLE_LABELS = {
    UserRole.user: "Utilisateur",
    UserRole.expert: "Expert",
    UserRole.entreprise: "Entreprise",
    UserRole.ong: "ONG",
    UserRole.admin: "Administrateur",
}

PROFILE_TO_ROLE = {
    "personne": UserRole.user,
    "association": UserRole.ong,
    "recruteur": UserRole.entreprise,
    "expert": UserRole.expert,
}

MODERATOR_ROLES = {UserRole.expert, UserRole.admin}
JOB_POSTER_ROLES = {UserRole.entreprise, UserRole.ong, UserRole.admin}


def has_role(user: User, *roles: UserRole) -> bool:
    return user.role in roles


def is_forum_moderator(user: User, forum_createur_id: int) -> bool:
    return user.role == UserRole.admin or (
        user.role == UserRole.expert and user.id == forum_createur_id
    )


def require_roles(*roles: UserRole):
    allowed = set(roles)

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les permissions nécessaires pour cette action",
            )
        return current_user

    return dependency
