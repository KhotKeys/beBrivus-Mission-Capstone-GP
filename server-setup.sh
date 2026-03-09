#!/bin/bash

echo "========================================="
echo "beBrivus Server Setup - gabriel@173.249.25.80"
echo "========================================="

# Update system
echo "[1/8] Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
echo "[2/8] Installing Python..."
sudo apt install -y python3.10 python3.10-venv python3-pip

# Install Node.js
echo "[3/8] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "[4/8] Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Redis
echo "[5/8] Installing Redis..."
sudo apt install -y redis-server

# Install Nginx
echo "[6/8] Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "[7/8] Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Clone repository
echo "[8/8] Cloning repository..."
cd ~
git clone https://github.com/KhotKeys/beBrivus-Mission-Capstone-GP.git
cd beBrivus-Mission-Capstone-GP

# Setup backend
echo "Setting up backend..."
cd backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=bebrivus.com,www.bebrivus.com,173.249.25.80

DB_ENGINE=django.db.backends.postgresql
DB_NAME=bebrivus_db
DB_USER=bebrivus_user
DB_PASSWORD=your-secure-db-password
DB_HOST=localhost
DB_PORT=5432

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@bebrivus.com

GEMINI_API_KEY=your-gemini-api-key

REDIS_URL=redis://localhost:6379/0

CORS_ALLOWED_ORIGINS=http://173.249.25.80,https://bebrivus.com,https://www.bebrivus.com
EOF

# Setup database
echo "Setting up database..."
sudo -u postgres psql << EOF
CREATE DATABASE bebrivus_db;
CREATE USER bebrivus_user WITH PASSWORD 'bebrivus2024';
ALTER ROLE bebrivus_user SET client_encoding TO 'utf8';
ALTER ROLE bebrivus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bebrivus_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bebrivus_db TO bebrivus_user;
\q
EOF

# Run migrations
python manage.py migrate

# Create superuser (you'll need to do this manually)
echo "Run: python manage.py createsuperuser"

# Collect static files
python manage.py collectstatic --noinput

# Setup frontend
echo "Setting up frontend..."
cd ../frontend
npm install
echo "VITE_API_BASE_URL=https://bebrivus.com/api" > .env.production
npm run build

# Copy service files
echo "Setting up services..."
cd ..
sudo cp gunicorn.service /etc/systemd/system/
sudo cp celery.service /etc/systemd/system/
sudo cp daphne.service /etc/systemd/system/

# Update service files with correct paths
sudo sed -i "s|/var/www/bebrivus|$HOME/beBrivus-Mission-Capstone-GP|g" /etc/systemd/system/gunicorn.service
sudo sed -i "s|/var/www/bebrivus|$HOME/beBrivus-Mission-Capstone-GP|g" /etc/systemd/system/celery.service
sudo sed -i "s|/var/www/bebrivus|$HOME/beBrivus-Mission-Capstone-GP|g" /etc/systemd/system/daphne.service

# Update user in service files
sudo sed -i "s|User=www-data|User=gabriel|g" /etc/systemd/system/gunicorn.service
sudo sed -i "s|Group=www-data|Group=gabriel|g" /etc/systemd/system/gunicorn.service
sudo sed -i "s|User=www-data|User=gabriel|g" /etc/systemd/system/celery.service
sudo sed -i "s|Group=www-data|Group=gabriel|g" /etc/systemd/system/celery.service
sudo sed -i "s|User=www-data|User=gabriel|g" /etc/systemd/system/daphne.service
sudo sed -i "s|Group=www-data|Group=gabriel|g" /etc/systemd/system/daphne.service

# Create log directories
sudo mkdir -p /var/log/gunicorn /var/log/celery
sudo chown gabriel:gabriel /var/log/gunicorn /var/log/celery

# Setup Nginx
sudo cp nginx.conf /etc/nginx/sites-available/bebrivus
sudo sed -i "s|yourdomain.com|bebrivus.com|g" /etc/nginx/sites-available/bebrivus
sudo ln -sf /etc/nginx/sites-available/bebrivus /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Create nginx directory
sudo mkdir -p /var/www/html/bebrivus
sudo cp -r frontend/dist/* /var/www/html/bebrivus/

# Reload and start services
sudo systemctl daemon-reload
sudo systemctl enable gunicorn celery daphne redis-server nginx
sudo systemctl start gunicorn celery daphne redis-server
sudo systemctl restart nginx

echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo "Backend: http://173.249.25.80:8001"
echo "Frontend: http://173.249.25.80"
echo "Admin: http://173.249.25.80:8001/admin"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your actual credentials"
echo "2. Create superuser: cd backend && source .venv/bin/activate && python manage.py createsuperuser"
echo "3. Configure your domain and SSL certificate"
echo "========================================="
