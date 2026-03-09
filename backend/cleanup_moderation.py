"""
Cleanup script for moderation data
Run: python backend/cleanup_moderation.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.moderation_models import FlaggedContent, ModerationAction
from django.utils import timezone
from datetime import timedelta

def cleanup_moderation_data():
    """Clean up old moderation records"""
    
    print("Cleaning up moderation data...\n")
    
    # Delete reviewed/dismissed content older than 30 days
    cutoff_date = timezone.now() - timedelta(days=30)
    old_reviewed = FlaggedContent.objects.filter(
        status__in=['reviewed', 'dismissed'],
        reviewed_at__lt=cutoff_date
    )
    reviewed_count = old_reviewed.count()
    old_reviewed.delete()
    print(f"[OK] Deleted {reviewed_count} old reviewed/dismissed records (>30 days)")
    
    # Delete old audit logs (keep last 100)
    total_actions = ModerationAction.objects.count()
    if total_actions > 100:
        actions_to_delete = ModerationAction.objects.all()[100:]
        delete_count = actions_to_delete.count()
        actions_to_delete.delete()
        print(f"[OK] Deleted {delete_count} old audit log entries (kept last 100)")
    else:
        print(f"[INFO] Audit log has {total_actions} entries (no cleanup needed)")
    
    # Show current stats
    pending = FlaggedContent.objects.filter(status='pending').count()
    total = FlaggedContent.objects.count()
    print(f"\nCurrent Status:")
    print(f"   - Pending review: {pending}")
    print(f"   - Total flagged content: {total}")
    print(f"   - Audit log entries: {ModerationAction.objects.count()}")
    
    print("\n[OK] Cleanup complete!")

if __name__ == '__main__':
    cleanup_moderation_data()
