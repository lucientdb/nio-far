"""Add ressources, annuaire_services, photos tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-05 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ressources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("titre", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("categorie", sa.String(length=100), nullable=False),
        sa.Column("duree", sa.String(length=100), nullable=True),
        sa.Column("niveau", sa.String(length=100), nullable=True),
        sa.Column("lien", sa.String(length=500), nullable=True),
        sa.Column("est_actif", sa.Boolean(), nullable=True),
        sa.Column("cree_le", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ressources_id"), "ressources", ["id"], unique=False)
    op.create_index(op.f("ix_ressources_categorie"), "ressources", ["categorie"], unique=False)

    op.create_table(
        "annuaire_services",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nom", sa.String(length=300), nullable=False),
        sa.Column("sigle", sa.String(length=50), nullable=True),
        sa.Column("categorie", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("missions", sa.Text(), nullable=True),
        sa.Column("telephone", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=200), nullable=True),
        sa.Column("site", sa.String(length=500), nullable=True),
        sa.Column("adresse", sa.String(length=300), nullable=True),
        sa.Column("villes", sa.String(length=300), nullable=True),
        sa.Column("horaires", sa.String(length=200), nullable=True),
        sa.Column("gratuit", sa.Boolean(), nullable=True),
        sa.Column("est_actif", sa.Boolean(), nullable=True),
        sa.Column("cree_le", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_annuaire_services_id"), "annuaire_services", ["id"], unique=False)
    op.create_index(op.f("ix_annuaire_services_categorie"), "annuaire_services", ["categorie"], unique=False)

    op.create_table(
        "photos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("titre", sa.String(length=300), nullable=False),
        sa.Column("lieu", sa.String(length=200), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("est_publie", sa.Boolean(), nullable=True),
        sa.Column("cree_le", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_photos_id"), "photos", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_photos_id"), table_name="photos")
    op.drop_table("photos")
    op.drop_index(op.f("ix_annuaire_services_categorie"), table_name="annuaire_services")
    op.drop_index(op.f("ix_annuaire_services_id"), table_name="annuaire_services")
    op.drop_table("annuaire_services")
    op.drop_index(op.f("ix_ressources_categorie"), table_name="ressources")
    op.drop_index(op.f("ix_ressources_id"), table_name="ressources")
    op.drop_table("ressources")
