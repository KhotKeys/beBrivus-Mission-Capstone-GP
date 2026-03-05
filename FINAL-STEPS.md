# 🚀 Final Deployment Steps for bebrivus.com

## ✅ Complete These Steps in Order:

### 1. Configure DNS at Dynadot (5 minutes)

Go to: https://www.dynadot.com/account/domain/name/bebrivus.com.html

Add DNS records:
```
Type: A
Host: @
IP: 173.249.25.80

Type: A
Host: www
IP: 173.249.25.80
```

**Wait 10-30 minutes for DNS propagation**

Check if ready: https://dnschecker.org/#A/bebrivus.com

---

### 2. Add GitHub Secret (1 minute)

Go to: https://github.com/KhotKeys/beBrivus-Mission-Capstone-GP/settings/secrets/actions

Add:
- Name: `SERVER_PASSWORD`
- Value: `beBrivus`

---

### 3. Push Code to GitHub (1 minute)

```bash
cd beBrivus-Mission-Capstone
git add .
git commit -m "Configure deployment for bebrivus.com"
git push origin main
```

---

### 4. Setup Server (10 minutes)

```bash
# SSH into server
ssh gabriel@173.249.25.80
# Password: beBrivus

# Download setup script
cd ~
git clone https://github.com/KhotKeys/beBrivus-Mission-Capstone-GP.git
cd beBrivus-Mission-Capstone-GP
chmod +x server-setup.sh
./server-setup.sh
```

**Wait for setup to complete...**

---

### 5. Configure Environment Variables (2 minutes)

```bash
# Edit backend .env file
cd ~/beBrivus-Mission-Capstone-GP/backend
nano .env
```

Update these values:
- `SECRET_KEY` - Generate new: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `EMAIL_HOST_USER` - Your Gmail address
- `EMAIL_HOST_PASSWORD` - Your Gmail app password
- `GEMINI_API_KEY` - Your Google Gemini API key

Save and exit (Ctrl+X, Y, Enter)

---

### 6. Create Admin User (1 minute)

```bash
cd ~/beBrivus-Mission-Capstone-GP/backend
source .venv/bin/activate
python manage.py createsuperuser
```

Enter:
- Username: admin
- Email: your-email@example.com
- Password: (your secure password)

---

### 7. Setup SSL Certificate (2 minutes)

**Only after DNS is propagated!**

```bash
sudo certbot --nginx -d bebrivus.com -d www.bebrivus.com
```

Follow prompts:
1. Enter email address
2. Agree to terms (Y)
3. Share email? (N)
4. Redirect HTTP to HTTPS? (2)

---

### 8. Restart All Services (1 minute)

```bash
sudo systemctl restart gunicorn celery daphne nginx
```

---

### 9. Test Your Site ✅

Open in browser:
- ✅ https://bebrivus.com
- ✅ https://www.bebrivus.com
- ✅ https://bebrivus.com/admin
- ✅ https://bebrivus.com/api/

---

## 🎉 Your Site is Live!

**Frontend:** https://bebrivus.com  
**Admin Panel:** https://bebrivus.com/admin  
**API:** https://bebrivus.com/api/

---

## 📝 Post-Deployment Tasks

### Test All Features:
- [ ] User registration
- [ ] Login/Logout
- [ ] Browse opportunities
- [ ] Submit application
- [ ] Forum posts
- [ ] Mentor booking
- [ ] AI Coach
- [ ] Email notifications

### Monitor Logs:
```bash
# Backend logs
sudo tail -f /var/log/gunicorn/error.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Celery logs
sudo tail -f /var/log/celery/worker.log
```

### Future Updates:
Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will automatically deploy! 🚀

---

## 🆘 Troubleshooting

### DNS not working?
```bash
# Check DNS
nslookup bebrivus.com
# Should return: 173.249.25.80
```

### SSL certificate failed?
```bash
# Check DNS first, then retry
sudo certbot --nginx -d bebrivus.com -d www.bebrivus.com
```

### Service not running?
```bash
sudo systemctl status gunicorn
sudo systemctl restart gunicorn
```

### Site not loading?
```bash
# Check Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📞 Quick Commands

```bash
# SSH to server
ssh gabriel@173.249.25.80

# Restart services
sudo systemctl restart gunicorn celery daphne nginx

# View logs
sudo tail -f /var/log/gunicorn/error.log

# Update code
cd ~/beBrivus-Mission-Capstone-GP
git pull origin main
./deploy.sh
```

---

**🎊 Congratulations! Your beBrivus platform is now live at https://bebrivus.com**
