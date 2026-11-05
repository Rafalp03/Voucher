from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.voucher import VoucherTier


class CartItem(Base):
    """Pozycja koszyka. Koszyk identyfikuje nagłówek X-Cart-Id wysyłany przez frontend."""

    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "tier_id"),
        CheckConstraint("qty BETWEEN 1 AND 20", name="qty_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cart_id: Mapped[str] = mapped_column(String(64), index=True)
    tier_id: Mapped[int] = mapped_column(ForeignKey("voucher_tiers.id", ondelete="CASCADE"))
    qty: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tier: Mapped[VoucherTier] = relationship(lazy="joined")
