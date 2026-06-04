#!/bin/bash
# Start HRIS backend (development)
# Requires env vars to be set (or use .env file)
cd "$(dirname "$0")/backend"
export DB_HOST="${DB_HOST:-localhost}"
export DB_PORT="${DB_PORT:-5433}"
export DB_USER="${DB_USER:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD must be set}"
export DB_NAME="${DB_NAME:-hris_payroll}"
export DB_SYNC="${DB_SYNC:-true}"
export JWT_SECRET="${JWT_SECRET:?JWT_SECRET must be set}"
export REFRESH_JWT_SECRET="${REFRESH_JWT_SECRET:?REFRESH_JWT_SECRET must be set}"
export PORT="${PORT:-4000}"
exec node dist/main.js
