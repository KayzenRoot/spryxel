#!/bin/sh
set -eu

: "${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
: "${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"

case "${S3_ACCESS_KEY_ID}${S3_SECRET_ACCESS_KEY}" in
  *[!A-Za-z0-9_-]*) echo 'S3 credentials must use the generated URL-safe alphabet' >&2; exit 64 ;;
esac

umask 077
printf '{"identities":[{"name":"spryxel-local-test","credentials":[{"accessKey":"%s","secretKey":"%s"}],"actions":["Admin","Read","Write","List","Tagging"]}]}\n' \
  "$S3_ACCESS_KEY_ID" "$S3_SECRET_ACCESS_KEY" > /tmp/spryxel-s3-identities.json
chown seaweed:seaweed /tmp/spryxel-s3-identities.json
chmod 0400 /tmp/spryxel-s3-identities.json

exec /entrypoint.sh "$@"
