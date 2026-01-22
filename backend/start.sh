#!/bin/bash
set -e

echo "=== Starting OC MENA Festival Backend ==="

echo "1. Creating migrations for accounts..."
python manage.py makemigrations accounts --noinput || true

echo "2. Creating migrations for config..."
python manage.py makemigrations config --noinput || true

echo "3. Creating migrations for tickets..."
python manage.py makemigrations tickets --noinput || true

echo "4. Creating migrations for vendors..."
python manage.py makemigrations vendors --noinput || true

echo "5. Creating migrations for scanning..."
python manage.py makemigrations scanning --noinput || true

echo "6. Creating migrations for payments..."
python manage.py makemigrations payments --noinput || true

echo "7. Creating migrations for wallet..."
python manage.py makemigrations wallet --noinput || true

echo "8. Applying all migrations..."
python manage.py migrate --noinput

echo "9. Starting gunicorn..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 core.wsgi:application
