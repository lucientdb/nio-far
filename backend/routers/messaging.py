from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import User, Message, Notification
from core.deps import get_current_user
from schemas.helpers import message_to_dict, notification_to_dict

router = APIRouter()


class SendMessageRequest(BaseModel):
    receiver_id: int
    contenu: str
    post_id: Optional[int] = None


class MarkReadResponse(BaseModel):
    message: str


@router.post("/messages/send", response_model=dict)
def send_message(
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur destinataire introuvable")

    if receiver.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Vous ne pouvez pas vous envoyer un message à vous-même")

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        post_id=data.post_id,
        contenu=data.contenu,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    notification = Notification(
        user_id=receiver.id,
        type="message",
        title="Nouveau message",
        content=f"{current_user.prenom} {current_user.nom} vous a envoyé un message.",
        data=f"/messages",
    )
    db.add(notification)
    db.commit()

    return {"message": "Message envoyé", "message_id": message.id}


@router.get("/messages/me", response_model=list[dict])
def get_my_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .options(
            joinedload(Message.sender),
            joinedload(Message.receiver),
        )
        .filter(Message.receiver_id == current_user.id)
        .order_by(Message.cree_le.desc())
        .all()
    )
    return [message_to_dict(m) for m in messages]


@router.get("/messages/sent", response_model=list[dict])
def get_sent_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .options(
            joinedload(Message.sender),
            joinedload(Message.receiver),
        )
        .filter(Message.sender_id == current_user.id)
        .order_by(Message.cree_le.desc())
        .all()
    )
    return [message_to_dict(m) for m in messages]


@router.get("/messages/unread-count", response_model=dict)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.lu == False
    ).count()
    return {"count": count}


@router.put("/messages/{message_id}/read", response_model=MarkReadResponse)
def mark_message_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = (
        db.query(Message)
        .filter(Message.id == message_id, Message.receiver_id == current_user.id)
        .first()
    )
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message introuvable")
    msg.lu = True
    db.commit()
    return {"message": "Message marqué comme lu"}


@router.put("/messages/read-all", response_model=MarkReadResponse)
def mark_all_messages_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.lu == False
    ).update({"lu": True})
    db.commit()
    return {"message": "Tous les messages marqués comme lus"}


@router.get("/notifications/me", response_model=list[dict])
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.cree_le.desc())
        .limit(50)
        .all()
    )
    return [notification_to_dict(n) for n in notifications]


@router.get("/notifications/unread-count", response_model=dict)
def get_notifications_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).count()
    return {"count": count}


@router.put("/notifications/{notification_id}/read", response_model=MarkReadResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification non trouvée")
    notification.read = True
    db.commit()
    return {"message": "Notification marquée comme lue"}


@router.put("/notifications/read-all", response_model=MarkReadResponse)
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read == False).update({"read": True})
    db.commit()
    return {"message": "Toutes les notifications sont marquées comme lues"}
