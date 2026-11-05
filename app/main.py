import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import engine, get_db
from app.errors import register_error_handlers
from app.routers import auth, cart, orders, vouchers

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Zamknięcie puli połączeń przy wyłączaniu serwera
    engine.dispose()


app = FastAPI(title="Voucher API", lifespan=lifespan)

# Frontend (voucher-shop) działa pod innym adresem niż API, więc przeglądarka
# wymaga nagłówków CORS. Dozwolone adresy ustawia zmienna CORS_ORIGINS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Cart-Id"],
)

register_error_handlers(app)

# Endpointy sklepu, zgodnie z docs/API.md w repozytorium frontendu
api_v1 = APIRouter(prefix="/api/v1")
for module in (vouchers, auth, cart, orders):
    api_v1.include_router(module.router)
app.include_router(api_v1)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logger.error("Brak połączenia z bazą danych: %s", exc)
        return JSONResponse(status_code=503, content={"status": "error", "database": "unavailable"})
    return {"status": "ok", "database": "ok"}
