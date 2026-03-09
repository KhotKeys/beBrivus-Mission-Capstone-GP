import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
django.setup()
from django.conf import settings
from django.core.mail import send_mail

print('USER:', repr(settings.EMAIL_HOST_USER))
print('PASS length:', len(settings.EMAIL_HOST_PASSWORD), 'chars')
print('PASS has spaces:', ' ' in settings.EMAIL_HOST_PASSWORD)
print('FROM:', settings.DEFAULT_FROM_EMAIL)
print()
print('Sending test email...')

try:
    send_mail(
        subject='[beBrivus] Email Credentials Verified',
        message='Django email system is working. All moderation alerts will now be delivered.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['ethxkeys@gmail.com'],
        fail_silently=False,
    )
    print('SUCCESS - Check ethxkeys@gmail.com inbox now')
except Exception as e:
    print(f'FAILED - {e}')
    print()
    print('If still 535: App password was not saved correctly in .env')
    print('If timeout: Check internet connection and firewall')
