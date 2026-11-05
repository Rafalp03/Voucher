from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import and_, select

from app.deps import DbSession
from app.errors import ApiError
from app.models import Voucher, VoucherTier
from app.schemas import VoucherOut

router = APIRouter(prefix="/vouchers", tags=["Vouchery"])


@router.get("", response_model=list[VoucherOut])
def list_vouchers(
    db: DbSession,
    category: str | None = None,
    min_price: Annotated[Decimal | None, Query(alias="minPrice", ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(alias="maxPrice", ge=0)] = None,
):
    """Aktywne vouchery z progami cenowymi.

    Filtr ceny: voucher pasuje, jeśli którykolwiek z jego progów mieści się w przedziale.
    """
    stmt = select(Voucher).where(Voucher.is_active).order_by(Voucher.sort_order, Voucher.id)
    if category:
        stmt = stmt.where(Voucher.category == category)
    if min_price is not None or max_price is not None:
        conditions = []
        if min_price is not None:
            conditions.append(VoucherTier.value >= min_price)
        if max_price is not None:
            conditions.append(VoucherTier.value <= max_price)
        stmt = stmt.where(Voucher.tiers.any(and_(*conditions)))
    return db.scalars(stmt).all()


@router.get("/{voucher_id}", response_model=VoucherOut)
def get_voucher(voucher_id: str, db: DbSession):
    voucher = db.get(Voucher, voucher_id)
    if voucher is None or not voucher.is_active:
        raise ApiError(404, "Nie znaleziono vouchera.", "VOUCHER_NOT_FOUND")
    return voucher
