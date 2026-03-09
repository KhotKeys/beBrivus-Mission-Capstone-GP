#!/bin/bash

echo "🧹 Cleaning up old deployment..."

# Stop all services
echo "Stopping services..."
sudo systemctl stop gunicorn 2>/dev/null
sudo systemctl stop celery 2>/dev/null
sudo systemctl stop daphne 2>/dev/null
sudo systemctl stop nginx 2>/dev/null

# Disable services
echo "Disabling services..."
sudo systemctl disable gunicorn 2>/dev/null
sudo systemctl disable celery 2>/dev/null
sudo systemctl disable daphne 2>/dev/null

# Remove service files
echo "Removing service files..."
sudo rm -f /etc/systemd/system/gunicorn.service
sudo rm -f /etc/systemd/system/celery.service
sudo rm -f /etc/systemd/system/daphne.service

# Remove nginx config
echo "Removing nginx config..."
sudo rm -f /etc/nginx/sites-enabled/bebrivus
sudo rm -f /etc/nginx/sites-available/bebrivus
sudo rm -rf /var/www/html/bebrivus

# Remove old project directory (if exists)
echo "Removing old project..."
rm -rf ~/beBrivus-Mission-Capstone-GP
rm -rf ~/beBrivus-Mission-Capstone

# Reload systemd
sudo systemctl daemon-reload

# Start nginx with default config
sudo systemctl start nginx

echo "✅ Cleanup complete!"
echo ""
echo "Now run: ./server-setup.sh"
