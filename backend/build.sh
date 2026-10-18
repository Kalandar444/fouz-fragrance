#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt
python manage.py migrate --no-input
python manage.py collectstatic --no-input

# Run seed safely so it never blocks or fails deployment
python seed_data.py || true
