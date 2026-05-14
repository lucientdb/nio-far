from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Charge les variables du fichier .env automatiquement
load_dotenv()

# Récupère l'URL de connexion PostgreSQL depuis le fichier .env
# Format : postgresql://user:password@host:port/dbname
DATABASE_URL = os.getenv("DATABASE_URL")

# Le moteur SQLAlchemy : c'est lui qui gère la connexion réelle à PostgreSQL
engine = create_engine(DATABASE_URL)

# SessionLocal : chaque requête HTTP aura sa propre session de BDD
# On ne partage pas de session entre requêtes pour éviter les conflits
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base : toutes nos classes de modèles (User, Post, etc.) en hériteront
# C'est ce qui permet à SQLAlchemy de créer les tables correspondantes
Base = declarative_base()

# Dépendance FastAPI : fournit une session BDD à chaque route qui en a besoin
# Elle ouvre la session, donne la main à la route, puis ferme proprement
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
