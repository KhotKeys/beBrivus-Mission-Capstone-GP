import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.forum.models import Discussion, DiscussionFlag

d = Discussion.objects.filter(title='scam').last()
if d:
    print(f'Title: {d.title}')
    print(f'Is flagged: {d.is_flagged}')
    print(f'Flag count: {d.flag_count}')
    
    flags = DiscussionFlag.objects.filter(discussion=d)
    print(f'Total flags: {flags.count()}')
    for f in flags:
        print(f'  - Reason: {f.reason}')
        print(f'  - Details: {f.details[:100]}')
        print(f'  - Created: {f.created_at}')
else:
    print('No post found')
