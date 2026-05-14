from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from dotenv import load_dotenv
import os
import sys

# Ajoute le dossier parent au sys.path pour importer nos modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Charge les variables du fichier .env
load_dotenv()

# Importe la Base des modèles
from database import Base
from models import User, Post, Commentaire, Podcast, Temoignage, Job, Expert

# Récupère la DATABASE_URL du fichier .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Importe la config Alembic
config = context.config

# Configure la URL de connexion à partir de DATABASE_URL (du fichier .env)
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Définit la metadata pour l'autogénération des migrations
# C'est important : Alembic utilisera Base.metadata pour détecter les changements
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Récupère la configuration SQLAlchemy
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = DATABASE_URL
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
