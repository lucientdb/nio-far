"""add email_verified to users

Revision ID: f2a3b4c5d6e7
Revises: bfe78eba7be3
Create Date: 2026-07-16
"""
from alembic import op
import sqlalchemy as sa

revision = "f2a3b4c5d6e7"
down_revision = "bfe78eba7be3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    # Les nouveaux comptes mettront email_verified=false à l'inscription.
    # Les comptes existants restent true pour ne pas les bloquer.


def downgrade() -> None:
    op.drop_column("users", "email_verified")
