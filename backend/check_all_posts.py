import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.models import Discussion, DiscussionFlag

# Get last 3 discussions
discussions = Discussion.objects.all().order_by('-created_at')[:3]
print(f'Total discussions: {Discussion.objects.count()}')
print('\nLast 3 discussions:')
for d in discussions:
    print(f'\n- ID: {d.id}, Title: {d.title}')
    print(f'  Is flagged: {d.is_flagged}, Flag count: {d.flag_count}')
    print(f'  Is removed: {d.is_removed}')
    flags = DiscussionFlag.objects.filter(discussion=d)
    print(f'  Flags: {flags.count()}')
    for f in flags:
        print(f'    - {f.reason}: {f.details[:80]}')
