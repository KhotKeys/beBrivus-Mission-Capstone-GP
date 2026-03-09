import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print('=== RESTORING ADMIN ACCOUNT ===')

# Create admin account
admin = User.objects.create_superuser(
    email='kkhotmachil@gmail.com',
    username='kkhotmachil@gmail.com',
    password='Thuch22qq@@',
    first_name='Admin',
    last_name='User',
    user_type='admin'
)

print(f'Admin created: {admin.email}')
print(f'is_superuser: {admin.is_superuser}')
print(f'is_staff: {admin.is_staff}')
print(f'is_active: {admin.is_active}')
print(f'user_type: {admin.user_type}')
print('SUCCESS - Admin account restored')
