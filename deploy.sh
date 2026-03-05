#!/bin/bash

echo "🚀 Starting beBrivus deployment..."

# Navigate to project directory
cd ~/beBrivus-Mission-Capstone || exit

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Backend deployment
echo "🔧 Deploying backend..."
cd backend

# Activate virtual environment
source .venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Restart services
echo "♻️ Restarting services..."
sudo systemctl restart gunicorn 2>/dev/null || echo "Gunicorn not configured yet"
sudo systemctl restart celery 2>/dev/null || echo "Celery not configured yet"
sudo systemctl restart daphne 2>/dev/null || echo "Daphne not configured yet"
sudo systemctl restart nginx 2>/dev/null || echo "Nginx not configured yet"

# Frontend deployment
echo "🎨 Deploying frontend..."
cd ../frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Copy to nginx directory
sudo mkdir -p /var/www/html/bebrivus
sudo rm -rf /var/www/html/bebrivus/*
sudo cp -r dist/* /var/www/html/bebrivus/

echo "✅ Deployment completed successfully!"
