from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

PAYMENT_METHODS = ("card", "blik")
ORDER_STATUSES = ("pending", "paid", "cancelled", "refunded")


class Order(Base):
    """Zamówienie. user_id jest pusty przy zakupie jako gość."""

    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(f"payment_method IN {PAYMENT_METHODS}", name="payment_method"),
        CheckConstraint(f"status IN {ORDER_STATUSES}", name="status"),
        CheckConstraint("total >= 0", name="total_non_negative"),
        Index("ix_orders_user_id_created_at", "user_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # np. "VS-7K2M9QX4PA"
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    customer_name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(255))
    payment_method: Mapped[str] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(20), server_default="pending")
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        order_by="OrderItem.id",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class OrderItem(Base):
    """Pozycja zamówienia. Nazwa i cena są kopiowane w chwili zakupu,
    żeby późniejsze zmiany katalogu nie zmieniały historii zamówień."""

    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint("qty BETWEEN 1 AND 20", name="qty_range"),
        CheckConstraint("unit_value > 0", name="unit_value_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    voucher_id: Mapped[str] = mapped_column(ForeignKey("vouchers.id"))
    voucher_name: Mapped[str] = mapped_column(String(150))
    unit_value: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    qty: Mapped[int]

    order: Mapped[Order] = relationship(back_populates="items")
