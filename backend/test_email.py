import os, django
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.core.mail import send_mail
from django.conf import settings

print('EMAIL_HOST_USER:', settings.EMAIL_HOST_USER)
print('EMAIL_HOST_PASSWORD:', str(settings.EMAIL_HOST_PASSWORD)[:4] + '****')
print('EMAIL_HOST:', settings.EMAIL_HOST)
print('EMAIL_PORT:', settings.EMAIL_PORT)
print('EMAIL_USE_TLS:', settings.EMAIL_USE_TLS)
print('DEFAULT_FROM_EMAIL:', settings.DEFAULT_FROM_EMAIL)

try:
    send_mail(
        subject='[beBrivus] Email System Test - SUCCESS',
        message='Email system is working correctly. All moderation alerts will be delivered.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['ethxkeys@gmail.com'],
        fail_silently=False,
    )
    print('SUCCESS - Test email sent to ethxkeys@gmail.com')
except Exception as e:
    print(f'FAILED - {e}')
    print('Fix EMAIL settings before proceeding.')
