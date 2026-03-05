# 🌐 DNS Configuration for bebrivus.com (Dynadot)

## Step 1: Login to Dynadot

1. Go to: https://www.dynadot.com/account/domain/name/bebrivus.com.html
2. Login with your credentials

## Step 2: Configure DNS Records

Click on "DNS Settings" or "Manage DNS" for bebrivus.com

### Add These Records:

| Type  | Name/Host | Value/Points To | TTL  |
|-------|-----------|-----------------|------|
| A     | @         | 173.249.25.80   | 3600 |
| A     | www       | 173.249.25.80   | 3600 |
| CNAME | www       | bebrivus.com    | 3600 |

**Simplified (Choose one method):**

**Method 1 - A Records Only:**
```
Type: A
Host: @
IP: 173.249.25.80

Type: A  
Host: www
IP: 173.249.25.80
```

**Method 2 - A + CNAME:**
```
Type: A
Host: @
IP: 173.249.25.80

Type: CNAME
Host: www
Points to: bebrivus.com
```

## Step 3: Save Changes

Click "Save" or "Update DNS"

## Step 4: Wait for Propagation

DNS changes take 5-60 minutes to propagate globally.

Check propagation status:
- https://dnschecker.org/#A/bebrivus.com
- https://dnschecker.org/#A/www.bebrivus.com

## Step 5: Verify DNS

From your local machine:
```bash
# Check if DNS is working
nslookup bebrivus.com
nslookup www.bebrivus.com

# Should return: 173.249.25.80
```

## Step 6: Setup SSL Certificate

Once DNS is propagated, SSH into your server:

```bash
ssh gabriel@173.249.25.80
# Password: beBrivus

# Install SSL certificate
sudo certbot --nginx -d bebrivus.com -d www.bebrivus.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)
```

## Step 7: Test Your Site

After SSL setup:
- ✅ https://bebrivus.com
- ✅ https://www.bebrivus.com
- ✅ http://bebrivus.com (should redirect to HTTPS)

---

## Troubleshooting

### DNS not resolving
- Wait longer (up to 24 hours max)
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo systemd-resolve --flush-caches` (Linux)

### SSL certificate fails
- Ensure DNS is fully propagated first
- Check firewall allows port 80 and 443
- Try: `sudo certbot certonly --standalone -d bebrivus.com -d www.bebrivus.com`

### Site not loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## Quick Reference

**Server IP:** 173.249.25.80  
**Domain:** bebrivus.com  
**DNS Provider:** Dynadot  
**SSL:** Let's Encrypt (via Certbot)

**Your site will be live at:**
- 🌐 https://bebrivus.com
- 🌐 https://www.bebrivus.com
