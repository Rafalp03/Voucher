#!/bin/sh
# Start kontenera API: najpierw migracje bazy, potem właściwe polecenie (CMD).
set -e

echo "Uruchamiam migracje bazy (alembic upgrade head)..."
alembic upgrade head

exec "$@"
