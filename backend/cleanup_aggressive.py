"""
Aggressive cleanup - removes most old moderation records
Run: python backend/cleanup_aggressive.py
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.moderation_models import FlaggedContent, ModerationAction

def aggressive_cleanup():
    """Remove most old records, keep only recent ones"""
    
    print("Aggressive cleanup starting...\n")
    
    # Keep only last 5 pending reviews
    pending = FlaggedContent.objects.filter(status='pending').order_by('-flagged_at')
    pending_count = pending.count()
    if pending_count > 5:
        ids_to_keep = list(pending[:5].values_list('id', flat=True))
        deleted = FlaggedContent.objects.filter(status='pending').exclude(id__in=ids_to_keep).delete()[0]
        print(f"[OK] Deleted {deleted} old pending reviews (kept last 5)")
    
    # Delete all reviewed/dismissed
    reviewed = FlaggedContent.objects.filter(status__in=['reviewed', 'dismissed'])
    reviewed_count = reviewed.count()
    reviewed.delete()
    print(f"[OK] Deleted {reviewed_count} reviewed/dismissed records")
    
    # Keep only last 10 audit logs
    actions = ModerationAction.objects.all().order_by('-created_at')
    actions_count = actions.count()
    if actions_count > 10:
        ids_to_keep = list(actions[:10].values_list('id', flat=True))
        deleted = ModerationAction.objects.exclude(id__in=ids_to_keep).delete()[0]
        print(f"[OK] Deleted {deleted} old audit logs (kept last 10)")
    
    # Show final stats
    print(f"\nFinal Status:")
    print(f"   - Pending review: {FlaggedContent.objects.filter(status='pending').count()}")
    print(f"   - Total flagged content: {FlaggedContent.objects.count()}")
    print(f"   - Audit log entries: {ModerationAction.objects.count()}")
    print("\n[OK] Aggressive cleanup complete!")

if __name__ == '__main__':
    aggressive_cleanup()
