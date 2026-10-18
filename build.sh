#!/usr/bin/env bash
# Exit on error
set -o errexit

if [ -f backend/requirements.txt ]; then
    pip install -r backend/requirements.txt
    python backend/manage.py migrate --no-input
    python backend/manage.py collectstatic --no-input
    python backend/seed_data.py || true
else
    pip install -r requirements.txt
    python manage.py migrate --no-input
    python manage.py collectstatic --no-input
    python seed_data.py || true
fi
