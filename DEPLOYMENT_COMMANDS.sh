#!/bin/bash
# Production Deployment Commands for beBrivus Moderation System
# Run these on: gabriel@173.249.25.80

# ============================================================
# STEP 1: Pull latest code (as gabriel user)
# ============================================================
cd /home/gabriel/beBrivus-Mission-Capstone-GP/backend
git pull origin master

# Expected output:
# From github.com:USER/beBrivus-Mission-Capstone-GP
#    7e898de..XXXXXXX  master -> origin/master
# Updating 7e898de..XXXXXXX
# Fast-forward
#  apps/ai_services/gemini_service.py | X insertions(+), Y deletions(-)
#  test_moderation_system.py         | X insertions(+)
#  2 files changed, ...

# ============================================================
# STEP 2: Activate virtual environment and install deps (if needed)
# ============================================================
source venv/bin/activate
pip install google-generativeai==0.8.6 --upgrade

# ============================================================
# STEP 3: CRITICAL - Restart gunicorn as ROOT
# ============================================================
# This MUST be run as root to load the new:
# - Gemini API key from .env
# - Fixed gemini_service.py code
# - New environment variables

# Option A: Using systemctl (Most reliable)
sudo systemctl restart gunicorn

# Option B: If systemctl doesn't work
sudo service gunicorn restart

# Option C: Force restart if above didn't work
sudo systemctl stop gunicorn && sleep 2 && sudo systemctl start gunicorn

# ============================================================
# STEP 4: Verify gunicorn is running
# ============================================================
ps aux | grep gunicorn

# Expected: Should show 5 worker processes, not errors

# ============================================================
# STEP 5: Check logs for errors
# ============================================================
# Check gunicorn service logs
sudo journalctl -u gunicorn -n 50 -f

# Or check error logs
tail -50 /var/log/gunicorn_error.log  # if it exists
tail -50 /home/gabriel/beBrivus-Mission-Capstone-GP/logs/gunicorn.log  # if it exists

# ============================================================
# STEP 6: Test the API
# ============================================================

# Test 1: Chat endpoint should work (not return "not configured")
curl -X POST https://bebrivus.com/api/ai/chat/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, test message"}'

# Expected response: AI response text, NOT "AI coach is not configured yet"

# Test 2: Check moderation flags in admin
# Visit: https://bebrivus.com/admin/ai_services/contentmoderationflag/
# Should see pending flags

# ============================================================
# STEP 7: Troubleshooting if tests fail
# ============================================================

# If gunicorn won't restart:
# Check if port 8001 is in use:
sudo lsof -i :8001

# Manually kill old process:
sudo kill -9 PID_HERE

# Then restart:
sudo systemctl start gunicorn

# ============================================================
# SUCCESS INDICATORS
# ============================================================
# ✓ Gunicorn running with 5 workers
# ✓ No errors in logs
# ✓ API returns AI responses (not "not configured")
# ✓ Admin shows moderation flags
# ✓ Forum posts show moderation status

# ============================================================
# ROLLBACK IF NEEDED
# ============================================================
# If something breaks, revert to last working commit:
git reset --hard origin/master~1
sudo systemctl restart gunicorn
