#!/usr/bin/env bash
# Exit on error
set -o errexit

if [ -f backend/requirements.txt ]; then
    pip install -r backend/requirements.txt
    python backend/manage.py migrate
    python backend/seed_data.py
    python backend/sync_amberiya_brand_logos.py
    python backend/seed_vperfumes_to_db.py
    python backend/manage.py collectstatic --no-input
else
    pip install -r requirements.txt
    python manage.py migrate
    python seed_data.py
    python sync_amberiya_brand_logos.py
    python seed_vperfumes_to_db.py
    python manage.py collectstatic --no-input
fi
