#!/bin/sh
set -eu

: "${DATABASE_APP_PASSWORD:?DATABASE_APP_PASSWORD is required to create the restricted app role}"
: "${DATABASE_WORKER_PASSWORD:?DATABASE_WORKER_PASSWORD is required to create the restricted worker role}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=app_password="$DATABASE_APP_PASSWORD" <<'SQL'
CREATE ROLE spryxel_app
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOBYPASSRLS
  PASSWORD :'app_password';
SQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=worker_password="$DATABASE_WORKER_PASSWORD" <<'SQL'
CREATE ROLE spryxel_worker
  LOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT
  NOBYPASSRLS
  NOREPLICATION
  PASSWORD :'worker_password';
SQL
