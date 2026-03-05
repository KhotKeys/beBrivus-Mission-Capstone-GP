# 🚀 Pre-Deployment Checklist

## Before Pushing to GitHub

### Code Preparation
- [ ] All sensitive data removed from code
- [ ] `.env` files added to `.gitignore`
- [ ] Database migrations created and tested
- [ ] All dependencies listed in `requirements.txt` and `package.json`
- [ ] Code tested locally with `start.bat`
- [ ] No hardcoded URLs or credentials

### GitHub Setup
- [ ] Repository created on GitHub
- [ ] Remote origin configured: `git remote add origin <your-repo-url>`
- [ ] `.github/workflows/ci.yml` exists
- [ ] README.md updated with your information

### GitHub Secrets Configuration
Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:
- [ ] `DJANGO_SECRET_KEY` - Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- [ ] `SERVER_HOST` - Your server IP or domain
- [ ] `SERVER_USER` - SSH username (e.g., ubuntu, root)
- [ ] `SSH_PRIVATE_KEY` - Your SSH private key for deployment

---

## Server Preparation

### Domain & DNS
- [ ] Domain purchased and configured
- [ ] A record pointing to server IP
- [ ] www subdomain configured (optional)
- [ ] DNS propagation complete (check with `nslookup yourdomain.com`)

### Server Access
- [ ] SSH access working: `ssh user@your-server-ip`
- [ ] Sudo privileges confirmed
- [ ] Server OS: Ubuntu 20.04+ or similar
- [ ] Firewall configured (ports 80, 443, 22 open)

### Server Software
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Nginx installed
- [ ] Git installed
- [ ] Certbot installed (for SSL)

---

## Environment Configuration

### Backend `.env` File
Create `/var/www/bebrivus/backend/.env` with:
- [ ] `SECRET_KEY` - Unique Django secret key
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` - Your domain(s)
- [ ] `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL credentials
- [ ] `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` - Email settings
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `REDIS_URL` - Redis connection string
- [ ] `CORS_ALLOWED_ORIGINS` - Your frontend domain

### Frontend `.env.production`
- [ ] `VITE_API_BASE_URL=https://yourdomain.com/api`

---

## Database Setup

- [ ] PostgreSQL database created
- [ ] Database user created with proper permissions
- [ ] Database accessible from Django
- [ ] Test connection: `psql -U bebrivus_user -d bebrivus_db -h localhost`

---

## SSL Certificate

- [ ] Certbot installed
- [ ] SSL certificate obtained: `sudo certbot --nginx -d yourdomain.com`
- [ ] Auto-renewal tested: `sudo certbot renew --dry-run`
- [ ] HTTPS redirect working

---

## Service Configuration

- [ ] `gunicorn.service` copied to `/etc/systemd/system/`
- [ ] `celery.service` copied to `/etc/systemd/system/`
- [ ] `daphne.service` copied to `/etc/systemd/system/`
- [ ] All services enabled: `sudo systemctl enable gunicorn celery daphne`
- [ ] All services started: `sudo systemctl start gunicorn celery daphne`
- [ ] All services running: `sudo systemctl status gunicorn celery daphne`

---

## Nginx Configuration

- [ ] Nginx config copied to `/etc/nginx/sites-available/bebrivus`
- [ ] Domain name updated in config
- [ ] Symlink created: `sudo ln -s /etc/nginx/sites-available/bebrivus /etc/nginx/sites-enabled/`
- [ ] Default site removed: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Config tested: `sudo nginx -t`
- [ ] Nginx restarted: `sudo systemctl restart nginx`

---

## Deployment Script

- [ ] `deploy.sh` exists in project root
- [ ] Script is executable: `chmod +x deploy.sh`
- [ ] Paths in script match your server setup
- [ ] Test manual deployment: `./deploy.sh`

---

## Testing After Deployment

### Frontend Tests
- [ ] Homepage loads: `https://yourdomain.com`
- [ ] All pages accessible
- [ ] Images and assets loading
- [ ] No console errors
- [ ] Mobile responsive

### Backend Tests
- [ ] API accessible: `https://yourdomain.com/api/`
- [ ] Admin panel works: `https://yourdomain.com/admin/`
- [ ] User registration works
- [ ] Login/logout works
- [ ] File uploads work
- [ ] Email notifications sent

### Feature Tests
- [ ] Opportunity browsing works
- [ ] Application submission works
- [ ] Forum posts work
- [ ] Mentor booking works
- [ ] AI Coach responds
- [ ] Real-time messaging works
- [ ] Notifications received

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No memory leaks
- [ ] Database queries optimized

---

## Security Verification

- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers present (check with securityheaders.com)
- [ ] No sensitive data in logs
- [ ] File upload restrictions working
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] SQL injection protection (Django ORM)
- [ ] XSS protection enabled

---

## Monitoring Setup

- [ ] Log files accessible and rotating
- [ ] Error tracking configured (Sentry optional)
- [ ] Uptime monitoring (UptimeRobot optional)
- [ ] Backup strategy implemented
- [ ] Disk space monitoring

---

## Documentation

- [ ] DEPLOYMENT.md reviewed
- [ ] README.md updated with live URL
- [ ] API documentation accessible
- [ ] Team members have access
- [ ] Credentials stored securely (password manager)

---

## Final Steps

- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Load initial data (if any)
- [ ] Test all user roles (student, institution, admin)
- [ ] Announce launch to stakeholders
- [ ] Monitor logs for first 24 hours

---

## Rollback Plan

In case of issues:
```bash
# Revert to previous version
cd /var/www/bebrivus
git log --oneline  # Find previous commit
git checkout <previous-commit-hash>
./deploy.sh

# Or restore from backup
# Restore database
psql -U bebrivus_user bebrivus_db < backup.sql

# Restore media files
tar -xzf media_backup.tar.gz -C /var/www/bebrivus/backend/
```

---

## Support Contacts

- **Server Provider**: [Your hosting provider support]
- **Domain Registrar**: [Your domain registrar support]
- **Email Service**: [Your email provider support]
- **Development Team**: [Your team contact]

---

## 🎉 Ready to Deploy!

Once all items are checked:

1. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Production ready - CI/CD configured"
   git push origin main
   ```

2. **Monitor GitHub Actions**:
   - Go to your repository → Actions tab
   - Watch the CI/CD pipeline run
   - Check for any errors

3. **Verify deployment**:
   - Visit your domain
   - Test all features
   - Check logs for errors

4. **Celebrate** 🎊 Your platform is live!
