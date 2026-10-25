# Modele ORM. Każdy nowy model importujemy tutaj, żeby Alembic widział go
# przy automatycznym generowaniu migracji (alembic revision --autogenerate).
from app.db import Base

__all__ = ["Base"]
