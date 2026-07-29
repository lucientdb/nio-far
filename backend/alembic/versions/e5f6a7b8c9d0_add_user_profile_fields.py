"""Add company/contact/domaine/specialite to users

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('entreprise_nom', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('contact', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('domaine_intervention', sa.String(length=300), nullable=True))
    op.add_column('users', sa.Column('specialite', sa.String(length=200), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'specialite')
    op.drop_column('users', 'domaine_intervention')
    op.drop_column('users', 'contact')
    op.drop_column('users', 'entreprise_nom')
