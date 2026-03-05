# 🔄 Clean Deployment for bebrivus.com

## Step 1: Push Code to GitHub

```bash
cd beBrivus-Mission-Capstone
git add .
git commit -m "Add deployment configuration"
git push origin main
```

## Step 2: Clean Old Deployment

```bash
# SSH to server
ssh gabriel@173.249.25.80
# Password: beBrivus

# Download cleanup script
curl -o cleanup.sh https://raw.githubusercontent.com/KhotKeys/beBrivus-Mission-Capstone-GP/main/cleanup.sh
chmod +x cleanup.sh
./cleanup.sh
```

## Step 3: Fresh Installation

```bash
# Clone repository
git clone https://github.com/KhotKeys/beBrivus-Mission-Capstone-GP.git
cd beBrivus-Mission-Capstone-GP

# Run setup
chmod +x server-setup.sh
./server-setup.sh
```

## Step 4: Create Admin User

```bash
cd ~/beBrivus-Mission-Capstone-GP/backend
source .venv/bin/activate
python manage.py createsuperuser
```

## Step 5: Setup SSL

```bash
sudo certbot --nginx -d bebrivus.com -d www.bebrivus.com
```

## Step 6: Restart Services

```bash
sudo systemctl restart gunicorn celery daphne nginx
```

---

## ✅ Done!

Visit: https://bebrivus.com

---

## Quick Commands

```bash
# View logs
sudo tail -f /var/log/gunicorn/error.log

# Restart all
sudo systemctl restart gunicorn celery daphne nginx

# Check status
sudo systemctl status gunicorn
```
