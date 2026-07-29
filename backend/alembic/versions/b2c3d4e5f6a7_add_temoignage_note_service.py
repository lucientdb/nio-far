"""Add note and service to temoignages

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-05 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("temoignages", sa.Column("note", sa.Integer(), nullable=True))
    op.add_column("temoignages", sa.Column("service", sa.String(length=100), nullable=True))
    op.create_index(op.f("ix_temoignages_user_id"), "temoignages", ["user_id"], unique=False)
    op.execute("UPDATE temoignages SET est_publie = true WHERE est_publie IS NULL OR est_publie = false")


def downgrade() -> None:
    op.drop_index(op.f("ix_temoignages_user_id"), table_name="temoignages")
    op.drop_column("temoignages", "service")
    op.drop_column("temoignages", "note")
