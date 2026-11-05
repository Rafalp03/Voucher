from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Voucher(Base):
    """Pozycja katalogu (oferta), np. "Dzień w SPA". Ceny są w progach (VoucherTier)."""

    __tablename__ = "vouchers"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # slug, np. "spa"
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(50), index=True)
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(255))
    emoji: Mapped[str | None] = mapped_column(String(16))
    # Dwa kolory tła zastępczego, gdy zdjęcie się nie wczyta, np. "#ffafbd,#ffc3a0"
    gradient: Mapped[str | None] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(server_default=true())
    # Kolejność wyświetlania w katalogu (rosnąco)
    sort_order: Mapped[int] = mapped_column(server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tiers: Mapped[list["VoucherTier"]] = relationship(
        back_populates="voucher",
        order_by="VoucherTier.value",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class VoucherTier(Base):
    """Próg cenowy vouchera wraz z opisem zawartości pakietu."""

    __tablename__ = "voucher_tiers"
    __table_args__ = (
        UniqueConstraint("voucher_id", "value"),
        CheckConstraint("value > 0", name="value_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    voucher_id: Mapped[str] = mapped_column(ForeignKey("vouchers.id", ondelete="CASCADE"))
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    description: Mapped[str] = mapped_column(Text)

    voucher: Mapped[Voucher] = relationship(back_populates="tiers")
