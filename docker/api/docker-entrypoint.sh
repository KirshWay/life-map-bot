#!/bin/sh
set -e

echo "[ENTRYPOINT] Running database migrations..."
node dist/migrate.js

echo "[ENTRYPOINT] Starting application..."
exec "$@"
