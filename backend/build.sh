#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install -r requirements.txt
python manage.py migrate
python seed_data.py
python sync_amberiya_brand_logos.py
python manage.py collectstatic --no-input
