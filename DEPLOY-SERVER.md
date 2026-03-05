# 🚀 beBrivus Deployment Guide - gabriel@173.249.25.80

## Quick Start (3 Steps)

### Step 1: Setup GitHub Secret

1. Go to: https://github.com/KhotKeys/beBrivus-Mission-Capstone-GP/settings/secrets/actions
2. Click "New repository secret"
3. Add:
   - Name: `SERVER_PASSWORD`
   - Value: `beBrivus`

### Step 2: Connect to Server & Run Setup

```bash
# From your local machine
ssh gabriel@173.249.25.80
# Password: beBrivus

# Once connected, run:
curl -o setup.sh https://raw.githubusercontent.com/KhotKeys/beBrivus-Mission-Capstone-GP/main/server-setup.sh
chmod +x setup.sh
./setup.sh
```

### Step 3: Push Code to GitHub

```bash
# From your local machine
cd beBrivus-Mission-Capstone
git add .
git commit -m "Add CI/CD configuration"
git push origin main
```

Done! GitHub Actions will automatically deploy on every push to main.

---

## Manual Deployment Steps

If you prefer manual setup:

### 1. Connect to Server
```bash
ssh gabriel@173.249.25.80
# Password: beBrivus
```

### 2. Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.10 python3.10-venv python3-pip nodejs npm postgresql redis-server nginx git
```

### 3. Clone Repository
```bash
cd ~
git clone https://github.com/KhotKeys/beBrivus-Mission-Capstone-GP.git
cd beBrivus-Mission-Capstone-GP
```

### 4. Setup Database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE bebrivus_db;
CREATE USER bebrivus_user WITH PASSWORD 'bebrivus2024';
GRANT ALL PRIVILEGES ON DATABASE bebrivus_db TO bebrivus_user;
\q
```

### 5. Setup Backend
```bash
cd ~/beBrivus-Mission-Capstone-GP/backend
python3.10 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file:
```bash
nano .env
```
Paste:
```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=173.249.25.80

DB_ENGINE=django.db.backends.postgresql
DB_NAME=bebrivus_db
DB_USER=bebrivus_user
DB_PASSWORD=bebrivus2024
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://173.249.25.80

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

GEMINI_API_KEY=your-gemini-key
```

Run migrations:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

### 6. Setup Frontend
```bash
cd ~/beBrivus-Mission-Capstone-GP/frontend
npm install
echo "VITE_API_BASE_URL=http://173.249.25.80:8001/api" > .env.production
npm run build
```

### 7. Configure Services

Update service files:
```bash
cd ~/beBrivus-Mission-Capstone-GP

# Update paths in service files
sed -i "s|/var/www/bebrivus|$HOME/beBrivus-Mission-Capstone-GP|g" gunicorn.service
sed -i "s|/var/www/bebrivus|$HOME/beBrivus-Mission-Capstone-GP|g" celery.service
sed -i "s|/var/www/bebrivus|$HOME/beBrivus-Mission-Capstone-GP|g" daphne.service

# Update user
sed -i "s|www-data|gabriel|g" gunicorn.service
sed -i "s|www-data|gabriel|g" celery.service
sed -i "s|www-data|gabriel|g" daphne.service

# Copy to systemd
sudo cp gunicorn.service /etc/systemd/system/
sudo cp celery.service /etc/systemd/system/
sudo cp daphne.service /etc/systemd/system/

# Create log directories
sudo mkdir -p /var/log/gunicorn /var/log/celery
sudo chown gabriel:gabriel /var/log/gunicorn /var/log/celery

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable gunicorn celery daphne
sudo systemctl start gunicorn celery daphne
```

### 8. Configure Nginx
```bash
# Update nginx config
sed -i "s|yourdomain.com|173.249.25.80|g" nginx.conf

# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/bebrivus
sudo ln -sf /etc/nginx/sites-available/bebrivus /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Copy frontend build
sudo mkdir -p /var/www/html/bebrivus
sudo cp -r frontend/dist/* /var/www/html/bebrivus/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Test Deployment
```bash
# Check services
sudo systemctl status gunicorn
sudo systemctl status celery
sudo systemctl status daphne
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/gunicorn/error.log
```

---

## Access Your Application

- **Frontend**: http://173.249.25.80
- **Backend API**: http://173.249.25.80:8001/api/
- **Admin Panel**: http://173.249.25.80:8001/admin/

---

## Automated Deployment (GitHub Actions)

Once setup is complete, every push to `main` branch will automatically:
1. Run tests
2. Build frontend
3. Deploy to server

Just push your code:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## Useful Commands

### Restart Services
```bash
sudo systemctl restart gunicorn celery daphne nginx
```

### View Logs
```bash
# Gunicorn
sudo tail -f /var/log/gunicorn/error.log

# Celery
sudo tail -f /var/log/celery/worker.log

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
cd ~/beBrivus-Mission-Capstone-GP
git pull origin main
./deploy.sh
```

### Database Backup
```bash
pg_dump -U bebrivus_user bebrivus_db > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Service won't start
```bash
sudo journalctl -u gunicorn -n 50
sudo systemctl status gunicorn
```

### Permission issues
```bash
sudo chown -R gabriel:gabriel ~/beBrivus-Mission-Capstone-GP
```

### Port already in use
```bash
sudo lsof -i :8001
sudo kill -9 <PID>
```

---

## Next Steps

1. ✅ Configure your domain DNS to point to 173.249.25.80
2. ✅ Setup SSL certificate with Certbot
3. ✅ Configure email settings in .env
4. ✅ Add Gemini API key
5. ✅ Test all features

**Your platform is ready to go live!** 🎉
