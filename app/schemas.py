"""Schematy żądań i odpowiedzi API (Pydantic).

Pola w JSON są w camelCase (np. customerName), zgodnie z docs/API.md frontendu.
W Pythonie używamy snake_case, a konwersję robi alias_generator.
"""

import re
from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

# Ta sama reguła co na froncie (js/utils.js, funkcja isEmail)
EMAIL_RE = re.compile(r"^\S+@\S+\.\S+$")
MAX_QTY = 20

Qty = Annotated[int, Field(ge=1, le=MAX_QTY)]
Price = Annotated[Decimal, Field(gt=0, max_digits=10, decimal_places=2)]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


def normalize_email(value: str) -> str:
    value = value.strip().lower()
    if len(value) > 255 or not EMAIL_RE.match(value):
        raise ValueError("Podaj poprawny e-mail.")
    return value


# ---------- Vouchery ----------


class TierOut(CamelModel):
    value: float
    description: str


class VoucherOut(CamelModel):
    id: str
    name: str
    category: str
    description: str
    image: str | None = Field(validation_alias="image_url")
    emoji: str | None
    gradient: str | None
    tiers: list[TierOut]


# ---------- Użytkownicy i logowanie ----------


class RegisterIn(CamelModel):
    name: str
    email: str
    password: str

    @field_validator("name")
    @classmethod
    def check_name(cls, value: str) -> str:
        value = value.strip()
        if not 2 <= len(value) <= 100:
            raise ValueError("Podaj imię (min. 2 znaki).")
        return value

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str) -> str:
        return normalize_email(value)

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        # Te same reguły co w formularzu rejestracji na froncie
        if (
            not 8 <= len(value) <= 128
            or not re.search(r"[a-zA-Z]", value)
            or not re.search(r"\d", value)
        ):
            raise ValueError("Hasło: min. 8 znaków, w tym litera i cyfra.")
        return value


class LoginIn(CamelModel):
    email: str = Field(max_length=255)
    password: str = Field(max_length=128)

    @field_validator("email")
    @classmethod
    def lower_email(cls, value: str) -> str:
        return value.strip().lower()


class UserOut(CamelModel):
    id: int
    name: str
    email: str


class UserMeOut(UserOut):
    created_at: datetime


class AuthOut(CamelModel):
    token: str
    user: UserOut


# ---------- Koszyk ----------


class CartItemIn(CamelModel):
    voucher_id: str = Field(max_length=50)
    value: Price
    qty: Qty = 1


class CartQtyIn(CamelModel):
    # Ilość < 1 usuwa pozycję, ilość > 20 jest przycinana do 20
    qty: int


class CartItemOut(CamelModel):
    voucher_id: str
    value: float
    qty: int


# ---------- Zamówienia ----------


class OrderIn(CamelModel):
    customer_name: str
    email: str
    payment_method: Literal["card", "blik"]
    items: list[CartItemIn] = Field(min_length=1, max_length=50)

    @field_validator("customer_name")
    @classmethod
    def check_customer_name(cls, value: str) -> str:
        value = value.strip()
        if not 1 <= len(value) <= 150:
            raise ValueError("Podaj imię i nazwisko.")
        return value

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str) -> str:
        return normalize_email(value)


class OrderItemOut(CamelModel):
    voucher_id: str
    name: str = Field(validation_alias="voucher_name")
    value: float = Field(validation_alias="unit_value")
    qty: int


class OrderOut(CamelModel):
    id: str
    customer_name: str
    email: str
    payment_method: str
    status: str
    items: list[OrderItemOut]
    total: float
    created_at: datetime
