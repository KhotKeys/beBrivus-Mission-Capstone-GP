# 🚀 beBrivus Deployment Guide

## Prerequisites

- Ubuntu 20.04+ server
- Domain name pointed to your server IP
- SSH access to server
- Sudo privileges

---

## Step 1: Server Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.10 python3.10-venv python3-pip nginx redis-server postgresql postgresql-contrib git curl

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE bebrivus_db;
CREATE USER bebrivus_user WITH PASSWORD 'your-secure-password';
ALTER ROLE bebrivus_user SET client_encoding TO 'utf8';
ALTER ROLE bebrivus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bebrivus_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bebrivus_db TO bebrivus_user;
\q
```

---

## Step 3: Clone Repository

```bash
# Create directory
sudo mkdir -p /var/www/bebrivus
sudo chown $USER:$USER /var/www/bebrivus

# Clone repository
cd /var/www
git clone https://github.com/yourusername/beBrivus-Mission-Capstone.git bebrivus
cd bebrivus
```

---

## Step 4: Backend Setup

```bash
cd /var/www/bebrivus/backend

# Create virtual environment
python3.10 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy and configure environment
cp ../.env.production .env
nano .env  # Edit with your actual values

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Create log directories
sudo mkdir -p /var/log/gunicorn /var/log/celery
sudo chown www-data:www-data /var/log/gunicorn /var/log/celery
```

---

## Step 5: Frontend Setup

```bash
cd /var/www/bebrivus/frontend

# Install dependencies
npm install

# Create production environment
echo "VITE_API_BASE_URL=https://yourdomain.com/api" > .env.production

# Build for production
npm run build

# Create nginx directory
sudo mkdir -p /var/www/html/bebrivus
sudo cp -r dist/* /var/www/html/bebrivus/
```

---

## Step 6: Configure Services

```bash
# Copy service files
sudo cp /var/www/bebrivus/gunicorn.service /etc/systemd/system/
sudo cp /var/www/bebrivus/celery.service /etc/systemd/system/
sudo cp /var/www/bebrivus/daphne.service /etc/systemd/system/

# Create Celery run directory
sudo mkdir -p /var/run/celery
sudo chown www-data:www-data /var/run/celery

# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
sudo systemctl enable gunicorn celery daphne redis-server
sudo systemctl start gunicorn celery daphne redis-server

# Check status
sudo systemctl status gunicorn
sudo systemctl status celery
sudo systemctl status daphne
```

---

## Step 7: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/bebrivus/nginx.conf /etc/nginx/sites-available/bebrivus

# Edit with your domain
sudo nano /etc/nginx/sites-available/bebrivus

# Enable site
sudo ln -s /etc/nginx/sites-available/bebrivus /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## Step 8: SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 9: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **DJANGO_SECRET_KEY**: Your Django secret key
2. **SERVER_HOST**: Your server IP or domain
3. **SERVER_USER**: SSH username (e.g., ubuntu)
4. **SSH_PRIVATE_KEY**: Your SSH private key

Generate SSH key for deployment:
```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server

# Copy private key content to GitHub secret
cat ~/.ssh/id_ed25519
```

---

## Step 10: Make Deploy Script Executable

```bash
cd /var/www/bebrivus
chmod +x deploy.sh
```

---

## Step 11: Push to GitHub

```bash
# On your local machine
cd beBrivus-Mission-Capstone

# Add all files
git add .

# Commit
git commit -m "Add CI/CD and deployment configuration"

# Push to GitHub
git push origin main
```

The GitHub Actions workflow will automatically:
- Run backend tests
- Build frontend
- Deploy to your server (on main branch)

---

## Monitoring & Maintenance

### View Logs
```bash
# Gunicorn logs
sudo tail -f /var/log/gunicorn/error.log

# Celery logs
sudo tail -f /var/log/celery/worker.log

# Nginx logs
sudo tail -f /var/nginx/error.log

# Django logs
cd /var/www/bebrivus/backend
tail -f *.log
```

### Restart Services
```bash
sudo systemctl restart gunicorn
sudo systemctl restart celery
sudo systemctl restart daphne
sudo systemctl restart nginx
```

### Update Application
```bash
cd /var/www/bebrivus
./deploy.sh
```

---

## Troubleshooting

### Service won't start
```bash
# Check service status
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -n 50

# Check permissions
sudo chown -R www-data:www-data /var/www/bebrivus
```

### Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U bebrivus_user -d bebrivus_db -h localhost
```

### Static files not loading
```bash
cd /var/www/bebrivus/backend
source .venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart nginx
```

---

## Security Checklist

- ✅ SSL certificate installed
- ✅ Firewall configured (UFW)
- ✅ DEBUG=False in production
- ✅ Strong database password
- ✅ SECRET_KEY is unique and secure
- ✅ Regular backups configured
- ✅ Fail2ban installed for SSH protection

---

## Backup Strategy

```bash
# Database backup
pg_dump -U bebrivus_user bebrivus_db > backup_$(date +%Y%m%d).sql

# Media files backup
tar -czf media_backup_$(date +%Y%m%d).tar.gz /var/www/bebrivus/backend/media/

# Automate with cron
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

---

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Configure Redis caching** for Django
3. **Use CDN** for static assets
4. **Enable database connection pooling**
5. **Monitor with tools** like New Relic or Sentry

---

## 🎉 Deployment Complete!

Your beBrivus platform should now be live at:
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api/
- **Admin**: https://yourdomain.com/admin/

Test all features:
- User registration/login
- Opportunity browsing
- Application submission
- Forum discussions
- Mentor booking
- AI Coach
- Email notifications
