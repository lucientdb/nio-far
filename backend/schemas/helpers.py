"""Utilitaires de sérialisation partagés entre les routers."""

from models import Post, Commentaire, User, Message, Notification
from models.post import PostStatut
from models.user import UserRole


def user_brief(user: User) -> dict:
    return {
        "id": user.id,
        "nom": user.nom,
        "prenom": user.prenom,
        "avatar_url": user.avatar_url,
        "role": user.role.value,
    }


def commentaire_to_dict(comm: Commentaire) -> dict:
    return {
        "id": comm.id,
        "contenu": comm.contenu,
        "auteur": user_brief(comm.auteur),
        "cree_le": comm.cree_le.isoformat(),
    }


def message_to_dict(message: Message) -> dict:
    return {
        "id": message.id,
        "sender": user_brief(message.sender),
        "receiver": user_brief(message.receiver),
        "post_id": message.post_id,
        "contenu": message.contenu,
        "lu": message.lu,
        "cree_le": message.cree_le.isoformat(),
    }


def notification_to_dict(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "type": notification.type,
        "title": notification.title,
        "content": notification.content,
        "data": notification.data,
        "read": notification.read,
        "cree_le": notification.cree_le.isoformat(),
    }


def post_to_dict(post: Post, current_user: User | None = None) -> dict:
    liked_by_me = False
    if current_user:
        liked_by_me = any(like.user_id == current_user.id for like in post.likes)

    return {
        "id": post.id,
        "titre": post.titre,
        "contenu": post.contenu,
        "statut": post.statut.value,
        "est_publie": post.est_publie,
        "vues": post.vues or 0,
        "forum_id": post.forum_id,
        "forum_titre": post.forum.titre if post.forum else None,
        "auteur": user_brief(post.auteur),
        "commentaires": [commentaire_to_dict(c) for c in post.commentaires],
        "likes_count": len(post.likes),
        "shares_count": len(post.shares),
        "liked_by_me": liked_by_me,
        "cree_le": post.cree_le.isoformat(),
        "modifie_le": post.modifie_le.isoformat() if post.modifie_le else None,
    }


def auto_approve_post(user: User) -> bool:
    return user.role in {UserRole.expert, UserRole.admin}


def initial_post_statut(user: User) -> PostStatut:
    return PostStatut.approuve if auto_approve_post(user) else PostStatut.en_attente


def get_default_forum_id(db) -> int:
    from models import Forum
    forum = db.query(Forum).filter(Forum.est_actif == True).order_by(Forum.id.asc()).first()
    if not forum:
        raise ValueError("Aucun forum disponible")
    return forum.id
