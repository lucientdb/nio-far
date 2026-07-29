"""add signalements table

Revision ID: c3d4e5f6a7b8
Revises: d4e5f6a7b8c9
Create Date: 2026-07-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b9'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade():
    # Créer la table signalements
    op.create_table(
        'signalements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cible_type', sa.String(length=50), nullable=False),
        sa.Column('cible_id', sa.Integer(), nullable=False),
        sa.Column('raison', sa.Text(), nullable=False),
        sa.Column('est_traite', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('cree_le', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Créer les index
    op.create_index(op.f('ix_signalements_id'), 'signalements', ['id'], unique=False)
    op.create_index(op.f('ix_signalements_cible_type'), 'signalements', ['cible_type'], unique=False)
    op.create_index(op.f('ix_signalements_cible_id'), 'signalements', ['cible_id'], unique=False)
    op.create_index(op.f('ix_signalements_est_traite'), 'signalements', ['est_traite'], unique=False)
    op.create_index(op.f('ix_signalements_user_id'), 'signalements', ['user_id'], unique=False)
    
    # Index composite pour recherche rapide
    op.create_index('ix_signalements_cible', 'signalements', ['cible_type', 'cible_id'], unique=False)


def downgrade():
    # Supprimer les index
    op.drop_index('ix_signalements_cible', table_name='signalements')
    op.drop_index(op.f('ix_signalements_user_id'), table_name='signalements')
    op.drop_index(op.f('ix_signalements_est_traite'), table_name='signalements')
    op.drop_index(op.f('ix_signalements_cible_id'), table_name='signalements')
    op.drop_index(op.f('ix_signalements_cible_type'), table_name='signalements')
    op.drop_index(op.f('ix_signalements_id'), table_name='signalements')
    
    # Supprimer la table
    op.drop_table('signalements')
