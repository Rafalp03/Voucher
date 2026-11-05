"""Koszyk po stronie serwera.

Koszyk jest identyfikowany nagłówkiem X-Cart-Id (losowy UUID generowany przez frontend
i trzymany w localStorage), niezależnie od tego, czy użytkownik jest zalogowany.
Pozycje adresujemy indeksem (kolejność dodania), tak jak w implementacji mock frontendu.
"""

from typing import Annotated

from fastapi import APIRouter, Path
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.deps import CartId, DbSession, OptionalCartId
from app.errors import ApiError
from app.models import CartItem, Voucher, VoucherTier
from app.schemas import MAX_QTY, CartItemIn, CartItemOut, CartQtyIn

router = APIRouter(prefix="/cart", tags=["Koszyk"])

Index = Annotated[int, Path(ge=0)]


def _items(db: Session, cart_id: str) -> list[CartItem]:
    stmt = select(CartItem).where(CartItem.cart_id == cart_id).order_by(CartItem.id)
    return list(db.scalars(stmt).all())


def _out(items: list[CartItem]) -> list[CartItemOut]:
    return [CartItemOut(voucher_id=i.tier.voucher_id, value=i.tier.value, qty=i.qty) for i in items]


def find_tier(db: Session, voucher_id: str, value) -> VoucherTier:
    """Próg cenowy aktywnego vouchera albo błąd 422."""
    tier = db.scalar(
        select(VoucherTier)
        .join(Voucher)
        .where(VoucherTier.voucher_id == voucher_id, VoucherTier.value == value, Voucher.is_active)
    )
    if tier is None:
        raise ApiError(422, "Wybrany voucher lub jego wartość nie istnieje.", "TIER_NOT_FOUND")
    return tier


@router.get("", response_model=list[CartItemOut])
def get_cart(db: DbSession, cart_id: OptionalCartId):
    return _out(_items(db, cart_id)) if cart_id else []


@router.post("/items", response_model=list[CartItemOut])
def add_item(item: CartItemIn, db: DbSession, cart_id: CartId):
    """Dodaje pozycję albo zwiększa ilość, jeśli ten sam voucher i wartość już są w koszyku."""
    tier = find_tier(db, item.voucher_id, item.value)
    existing = db.scalar(
        select(CartItem).where(CartItem.cart_id == cart_id, CartItem.tier_id == tier.id)
    )
    if existing:
        existing.qty = min(MAX_QTY, existing.qty + item.qty)
    else:
        db.add(CartItem(cart_id=cart_id, tier=tier, qty=item.qty))
    db.commit()
    return _out(_items(db, cart_id))


@router.put("/items/{index}", response_model=list[CartItemOut])
def set_qty(index: Index, data: CartQtyIn, db: DbSession, cart_id: CartId):
    """Ustawia ilość pozycji. Ilość < 1 usuwa pozycję."""
    items = _items(db, cart_id)
    if index < len(items):
        if data.qty < 1:
            db.delete(items[index])
        else:
            items[index].qty = min(MAX_QTY, data.qty)
        db.commit()
    return _out(_items(db, cart_id))


@router.delete("/items/{index}", response_model=list[CartItemOut])
def remove_item(index: Index, db: DbSession, cart_id: CartId):
    items = _items(db, cart_id)
    if index < len(items):
        db.delete(items[index])
        db.commit()
    return _out(_items(db, cart_id))


@router.delete("", response_model=list[CartItemOut])
def clear_cart(db: DbSession, cart_id: CartId):
    db.execute(delete(CartItem).where(CartItem.cart_id == cart_id))
    db.commit()
    return []
