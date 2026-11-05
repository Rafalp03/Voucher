"""model sklepu: użytkownicy, vouchery, koszyk, zamówienia

Revision ID: 3f1c2a9b7d10
Revises:
Create Date: 2026-11-05 15:00:00+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "3f1c2a9b7d10"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )

    op.create_table(
        "revoked_tokens",
        sa.Column("jti", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("jti", name=op.f("pk_revoked_tokens")),
    )
    op.create_index(
        op.f("ix_revoked_tokens_expires_at"), "revoked_tokens", ["expires_at"], unique=False
    )

    op.create_table(
        "vouchers",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=255), nullable=True),
        sa.Column("emoji", sa.String(length=16), nullable=True),
        sa.Column("gradient", sa.String(length=50), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_vouchers")),
    )
    op.create_index(op.f("ix_vouchers_category"), "vouchers", ["category"], unique=False)

    op.create_table(
        "voucher_tiers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("voucher_id", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.CheckConstraint("value > 0", name=op.f("ck_voucher_tiers_value_positive")),
        sa.ForeignKeyConstraint(
            ["voucher_id"],
            ["vouchers.id"],
            name=op.f("fk_voucher_tiers_voucher_id_vouchers"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_voucher_tiers")),
        sa.UniqueConstraint("voucher_id", "value", name=op.f("uq_voucher_tiers_voucher_id")),
    )

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cart_id", sa.String(length=64), nullable=False),
        sa.Column("tier_id", sa.Integer(), nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("qty BETWEEN 1 AND 20", name=op.f("ck_cart_items_qty_range")),
        sa.ForeignKeyConstraint(
            ["tier_id"],
            ["voucher_tiers.id"],
            name=op.f("fk_cart_items_tier_id_voucher_tiers"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cart_items")),
        sa.UniqueConstraint("cart_id", "tier_id", name=op.f("uq_cart_items_cart_id")),
    )
    op.create_index(op.f("ix_cart_items_cart_id"), "cart_items", ["cart_id"], unique=False)

    op.create_table(
        "orders",
        sa.Column("id", sa.String(length=20), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("customer_name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("payment_method", sa.String(length=10), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("total", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "payment_method IN ('card', 'blik')", name=op.f("ck_orders_payment_method")
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'paid', 'cancelled', 'refunded')",
            name=op.f("ck_orders_status"),
        ),
        sa.CheckConstraint("total >= 0", name=op.f("ck_orders_total_non_negative")),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name=op.f("fk_orders_user_id_users"), ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_orders")),
    )
    op.create_index(
        "ix_orders_user_id_created_at", "orders", ["user_id", "created_at"], unique=False
    )

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.String(length=20), nullable=False),
        sa.Column("voucher_id", sa.String(length=50), nullable=False),
        sa.Column("voucher_name", sa.String(length=150), nullable=False),
        sa.Column("unit_value", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False),
        sa.CheckConstraint("qty BETWEEN 1 AND 20", name=op.f("ck_order_items_qty_range")),
        sa.CheckConstraint("unit_value > 0", name=op.f("ck_order_items_unit_value_positive")),
        sa.ForeignKeyConstraint(
            ["order_id"],
            ["orders.id"],
            name=op.f("fk_order_items_order_id_orders"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["voucher_id"], ["vouchers.id"], name=op.f("fk_order_items_voucher_id_vouchers")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_order_items")),
    )
    op.create_index(op.f("ix_order_items_order_id"), "order_items", ["order_id"], unique=False)


def downgrade() -> None:
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("cart_items")
    op.drop_table("voucher_tiers")
    op.drop_table("vouchers")
    op.drop_table("revoked_tokens")
    op.drop_table("users")
