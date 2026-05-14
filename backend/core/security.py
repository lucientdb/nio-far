from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

# Contexte de hashage : passlib utilise bcrypt, l'algorithme le plus sûr pour les mots de passe
# "deprecated='auto'" met à jour automatiquement les vieux hashs si nécessaire
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Transforme un mot de passe en clair en hash sécurisé pour la BDD"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si un mot de passe correspond au hash stocké en BDD"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """
    Crée un token JWT signé.
    data doit contenir au minimum {"sub": "email_ou_id_utilisateur"}
    Le token expire après ACCESS_TOKEN_EXPIRE_MINUTES minutes.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """
    Crée un refresh token JWT avec une durée de vie plus longue.
    Utilisé pour obtenir de nouveaux access tokens sans se reconnecter.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Décode et vérifie un token JWT.
    Lève une JWTError si le token est invalide ou expiré.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def verify_refresh_token(token: str) -> dict:
    """
    Vérifie spécifiquement un refresh token.
    S'assure que c'est bien un refresh token et pas un access token.
    """
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise JWTError("Token n'est pas un refresh token")
    return payload
