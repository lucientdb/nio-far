"""merge_signalements_and_cert_pending

Revision ID: 10cedbc91999
Revises: a9b8c7d6e5f4, c3d4e5f6a7b9
Create Date: 2026-07-15 17:17:11.121387

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '10cedbc91999'
down_revision: Union[str, Sequence[str], None] = ('a9b8c7d6e5f4', 'c3d4e5f6a7b9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
