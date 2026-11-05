import secrets
from datetime import UTC, datetime

from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import CurrentUser, DbSession, OptionalUser
from app.errors import ApiError
from app.models import Order, OrderItem
from app.routers.cart import find_tier
from app.schemas import OrderIn, OrderOut

router = APIRouter(prefix="/orders", tags=["Zamówienia"])

# Bez znaków łatwych do pomylenia (0/O, 1/I)
_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _new_order_id(db: Session) -> str:
    """Losowy numer zamówienia, np. VS-7K2M9QX4PA.

    Numer jest też "kluczem" gościa do podglądu zamówienia, więc musi być nie do zgadnięcia.
    """
    while True:
        order_id = "VS-" + "".join(secrets.choice(_ID_ALPHABET) for _ in range(10))
        if db.get(Order, order_id) is None:
            return order_id


@router.post("", response_model=OrderOut, status_code=201)
def create_order(data: OrderIn, db: DbSession, user: OptionalUser):
    """Składa zamówienie. Ceny i suma liczone są na serwerze na podstawie katalogu.

    Płatność jest symulowana, więc zamówienie od razu ma status "paid".
    """
    order = Order(
        id=_new_order_id(db),
        user_id=user.id if user else None,
        customer_name=data.customer_name,
        email=data.email,
        payment_method=data.payment_method,
        status="paid",
        total=0,
        # Czas z aplikacji, a nie now() z bazy: now() to czas początku transakcji
        created_at=datetime.now(UTC),
    )
    for item in data.items:
        tier = find_tier(db, item.voucher_id, item.value)
        order.items.append(
            OrderItem(
                voucher_id=tier.voucher_id,
                voucher_name=tier.voucher.name,
                unit_value=tier.value,
                qty=item.qty,
            )
        )
    order.total = sum(i.unit_value * i.qty for i in order.items)
    db.add(order)
    db.commit()
    return order


@router.get("", response_model=list[OrderOut])
def list_my_orders(db: DbSession, user: CurrentUser):
    """Historia zamówień zalogowanego użytkownika (najnowsze pierwsze)."""
    stmt = (
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc(), Order.id.desc())
    )
    return db.scalars(stmt).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: DbSession, user: OptionalUser):
    """Szczegóły zamówienia.

    Zamówienie gościa widzi każdy, kto zna jego numer. Zamówienie przypisane do konta
    widzi tylko właściciel.
    """
    order = db.get(Order, order_id)
    if order is None or (order.user_id is not None and (user is None or user.id != order.user_id)):
        raise ApiError(404, "Nie znaleziono zamówienia.", "ORDER_NOT_FOUND")
    return order
