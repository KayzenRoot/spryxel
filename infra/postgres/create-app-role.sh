#!/bin/sh
set -eu

: "${DATABASE_APP_PASSWORD:?DATABASE_APP_PASSWORD is required to create the restricted app role}"

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
