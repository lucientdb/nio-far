"""add certification pending and url

Revision ID: a9b8c7d6e5f4
Revises: 85a1b2c3d4e, f1e2d3c4b5a6
Create Date: 2026-07-15 17:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a9b8c7d6e5f4'
down_revision: Union[str, Sequence[str], None] = ('85a1b2c3d4e', 'f1e2d3c4b5a6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # already executed in DB
    pass

def downgrade() -> None:
    pass
