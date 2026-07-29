"""merge heads

Revision ID: 74d2ad59b06b
Revises: b03bf652639a, e5f6a7b8c9d0
Create Date: 2026-07-08 12:05:59.208209

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74d2ad59b06b'
down_revision: Union[str, Sequence[str], None] = ('b03bf652639a', 'e5f6a7b8c9d0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
