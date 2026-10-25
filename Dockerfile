# ---------- Etap 1: budowanie zależności ----------
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# INSTALL_DEV=true doinstalowuje narzędzia do testów (ustawiane w docker-compose.override.yml)
ARG INSTALL_DEV=false

# Najpierw tylko requirements, żeby Docker cache'ował warstwę z zależnościami
COPY requirements.txt requirements-dev.txt ./
RUN if [ "$INSTALL_DEV" = "true" ]; then REQS=requirements-dev.txt; else REQS=requirements.txt; fi \
    && pip install --prefix=/install -r "$REQS"


# ---------- Etap 2: obraz uruchomieniowy ----------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Zależności z etapu builder
COPY --from=builder /install /usr/local

# Użytkownik bez uprawnień roota
RUN useradd --create-home --uid 1000 appuser

# Kod aplikacji
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

# Healthcheck bez curla (python:slim go nie ma)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Przy każdym starcie najpierw migracje bazy, potem serwer
ENTRYPOINT ["sh", "scripts/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
