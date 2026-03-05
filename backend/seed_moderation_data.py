"""
Seed realistic flagged content for AI Moderation testing
"""
import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.moderation_models import FlaggedContent

def seed_flagged_content():
    """Create 3 realistic test flagged messages"""
    
    test_data = [
        {
            'post_id': 1,
            'content': 'This platform is garbage and everyone here is stupid. You all should just quit.',
            'author_username': 'angry_user',
            'violation_categories': ['harassment', 'abuse'],
            'ai_confidence': 0.87,
            'reason': 'Contains aggressive language and personal attacks against community members',
            'status': 'pending'
        },
        {
            'post_id': 2,
            'content': 'CLICK HERE FOR FREE MONEY!!! www.scam-site.com - Make $5000 per day working from home! Limited time offer!!!',
            'author_username': 'spammer123',
            'violation_categories': ['spam'],
            'ai_confidence': 0.95,
            'reason': 'Promotional spam with suspicious external links and unrealistic claims',
            'status': 'pending'
        },
        {
            'post_id': 3,
            'content': 'People from [specific group] should not be allowed in professional spaces. They ruin everything.',
            'author_username': 'toxic_commenter',
            'violation_categories': ['hate_speech', 'harassment'],
            'ai_confidence': 0.92,
            'reason': 'Contains discriminatory language targeting a protected group',
            'status': 'pending'
        }
    ]
    
    created_count = 0
    for data in test_data:
        obj, created = FlaggedContent.objects.get_or_create(
            post_id=data['post_id'],
            author_username=data['author_username'],
            defaults=data
        )
        if created:
            created_count += 1
            print(f"[+] Created flagged content: {data['author_username']} - {data['violation_categories']}")
        else:
            print(f"[-] Already exists: {data['author_username']}")
    
    print(f"\n[SUCCESS] Seeding complete! Created {created_count} new flagged content records.")
    print(f"[INFO] Total pending flags: {FlaggedContent.objects.filter(status='pending').count()}")

if __name__ == '__main__':
    seed_flagged_content()
