"""Add roles, forums, likes, shares, post statut, podcast format

Revision ID: a1b2c3d4e5f6
Revises: 747fe4469fbc
Create Date: 2026-07-05 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Extend userrole enum (PostgreSQL)
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'expert'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'entreprise'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ong'")

    # Migrate moderateur -> expert
    op.execute("UPDATE users SET role = 'expert' WHERE role = 'moderateur'")

    # Add ville to users
    op.add_column("users", sa.Column("ville", sa.String(length=100), nullable=True))

    # Create forums table
    op.create_table(
        "forums",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("titre", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("est_actif", sa.Boolean(), nullable=True),
        sa.Column("createur_id", sa.Integer(), nullable=False),
        sa.Column("cree_le", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("modifie_le", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["createur_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_forums_id"), "forums", ["id"], unique=False)
    op.create_index(op.f("ix_forums_createur_id"), "forums", ["createur_id"], unique=False)

    # Default forum for existing posts
    op.execute(
        """
        INSERT INTO forums (titre, description, est_actif, createur_id)
        SELECT 'Forum général', 'Espace de discussion communautaire', true, id
        FROM users WHERE role = 'admin' LIMIT 1
        """
    )
    op.execute(
        """
        INSERT INTO forums (titre, description, est_actif, createur_id)
        SELECT 'Forum général', 'Espace de discussion communautaire', true, id
        FROM users
        WHERE NOT EXISTS (SELECT 1 FROM forums)
        ORDER BY id LIMIT 1
        """
    )

    # Post statut enum
    poststatut = sa.Enum("brouillon", "en_attente", "approuve", "refuse", name="poststatut")
    poststatut.create(op.get_bind(), checkfirst=True)

    op.add_column("posts", sa.Column("forum_id", sa.Integer(), nullable=True))
    op.add_column(
        "posts",
        sa.Column("statut", poststatut, nullable=True),
    )

    op.execute("UPDATE posts SET forum_id = (SELECT id FROM forums ORDER BY id LIMIT 1)")
    op.execute(
        "UPDATE posts SET statut = 'approuve' WHERE est_publie = true"
    )
    op.execute(
        "UPDATE posts SET statut = 'en_attente' WHERE est_publie = false OR est_publie IS NULL"
    )
    op.execute("UPDATE posts SET statut = 'en_attente' WHERE statut IS NULL")

    op.alter_column("posts", "forum_id", nullable=False)
    op.alter_column("posts", "statut", nullable=False, server_default="en_attente")
    op.create_foreign_key("fk_posts_forum_id", "posts", "forums", ["forum_id"], ["id"])
    op.create_index(op.f("ix_posts_forum_id"), "posts", ["forum_id"], unique=False)
    op.create_index(op.f("ix_posts_statut"), "posts", ["statut"], unique=False)
    op.create_index(op.f("ix_posts_user_id"), "posts", ["user_id"], unique=False)

    # Likes table
    op.create_table(
        "likes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("cree_le", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "post_id", name="uq_like_user_post"),
    )
    op.create_index(op.f("ix_likes_id"), "likes", ["id"], unique=False)
    op.create_index(op.f("ix_likes_user_id"), "likes", ["user_id"], unique=False)
    op.create_index(op.f("ix_likes_post_id"), "likes", ["post_id"], unique=False)

    # Shares table
    op.create_table(
        "shares",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("cree_le", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_shares_id"), "shares", ["id"], unique=False)
    op.create_index(op.f("ix_shares_user_id"), "shares", ["user_id"], unique=False)
    op.create_index(op.f("ix_shares_post_id"), "shares", ["post_id"], unique=False)

    # Podcast format + media_url
    mediaformat = sa.Enum("audio", "video", name="mediaformat")
    mediaformat.create(op.get_bind(), checkfirst=True)

    op.add_column("podcasts", sa.Column("format", mediaformat, nullable=True))
    op.add_column("podcasts", sa.Column("media_url", sa.String(length=500), nullable=True))
    op.execute("UPDATE podcasts SET media_url = audio_url WHERE media_url IS NULL")
    op.execute("UPDATE podcasts SET format = 'audio' WHERE format IS NULL")
    op.alter_column("podcasts", "format", nullable=False, server_default="audio")
    op.alter_column("podcasts", "media_url", nullable=False)
    op.drop_column("podcasts", "audio_url")

    op.create_index(op.f("ix_jobs_user_id"), "jobs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_jobs_user_id"), table_name="jobs")
    op.add_column("podcasts", sa.Column("audio_url", sa.String(length=500), nullable=True))
    op.execute("UPDATE podcasts SET audio_url = media_url")
    op.alter_column("podcasts", "audio_url", nullable=False)
    op.drop_column("podcasts", "media_url")
    op.drop_column("podcasts", "format")
    op.execute("DROP TYPE IF EXISTS mediaformat")

    op.drop_index(op.f("ix_shares_post_id"), table_name="shares")
    op.drop_index(op.f("ix_shares_user_id"), table_name="shares")
    op.drop_index(op.f("ix_shares_id"), table_name="shares")
    op.drop_table("shares")

    op.drop_index(op.f("ix_likes_post_id"), table_name="likes")
    op.drop_index(op.f("ix_likes_user_id"), table_name="likes")
    op.drop_index(op.f("ix_likes_id"), table_name="likes")
    op.drop_table("likes")

    op.drop_constraint("fk_posts_forum_id", "posts", type_="foreignkey")
    op.drop_index(op.f("ix_posts_user_id"), table_name="posts")
    op.drop_index(op.f("ix_posts_statut"), table_name="posts")
    op.drop_index(op.f("ix_posts_forum_id"), table_name="posts")
    op.drop_column("posts", "statut")
    op.drop_column("posts", "forum_id")
    op.execute("DROP TYPE IF EXISTS poststatut")

    op.drop_index(op.f("ix_forums_createur_id"), table_name="forums")
    op.drop_index(op.f("ix_forums_id"), table_name="forums")
    op.drop_table("forums")

    op.drop_column("users", "ville")
