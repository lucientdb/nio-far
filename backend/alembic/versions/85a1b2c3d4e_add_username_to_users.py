"""Add username to users

Revision ID: 85a1b2c3d4e
Revises: 74d2ad59b06b
Create Date: 2026-07-08 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "85a1b2c3d4e"
down_revision: Union[str, Sequence[str], None] = "74d2ad59b06b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('username', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'username')
