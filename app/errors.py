"""Jednolity format błędów API: {"message": "...", "code": "..."}.

Frontend pokazuje użytkownikowi pole "message", więc komunikaty są po polsku.
"""

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ApiError(Exception):
    """Błąd zwracany klientowi z podanym kodem HTTP, komunikatem i kodem błędu."""

    def __init__(self, status_code: int, message: str, code: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.code = code


def _validation_message(errors: list[dict]) -> str:
    """Składa komunikat dla użytkownika z błędów walidacji Pydantica."""
    messages = []
    for err in errors:
        if err.get("type") == "value_error":
            # Własne komunikaty z walidatorów w app/schemas.py
            messages.append(str(err["ctx"]["error"]))
        else:
            field = ".".join(str(p) for p in err.get("loc", ())[1:]) or "dane"
            messages.append(f"Nieprawidłowa wartość pola „{field}”.")
    # dict.fromkeys usuwa powtórzenia, zachowując kolejność
    return " ".join(dict.fromkeys(messages)) or "Nieprawidłowe dane."


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code, content={"message": exc.message, "code": exc.code}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        errors = exc.errors()
        return JSONResponse(
            status_code=422,
            content={
                "message": _validation_message(errors),
                "code": "VALIDATION_ERROR",
                # Szczegóły dla programistów (bez wartości wejściowych, np. haseł)
                "errors": [
                    jsonable_encoder({"loc": e.get("loc"), "type": e.get("type")}) for e in errors
                ],
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        # Np. nieistniejąca ścieżka (404) albo niedozwolona metoda HTTP (405)
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": str(exc.detail), "code": "HTTP_ERROR"},
            headers=getattr(exc, "headers", None),
        )
