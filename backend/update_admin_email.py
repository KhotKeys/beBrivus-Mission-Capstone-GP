import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print('=== UPDATING ADMIN EMAIL ===')

# Update existing kkhotmachil user to be admin
try:
    new_admin = User.objects.get(email='kkhotmachil@gmail.com')
    print(f'Found user: {new_admin.email}')
    
    # Make them admin
    new_admin.is_superuser = True
    new_admin.is_staff = True
    new_admin.user_type = 'admin'
    new_admin.set_password('Thuch22qq@@')
    new_admin.save()
    
    print(f'Updated {new_admin.email} to admin')
    print('Updated password')
    print('SUCCESS')
except User.DoesNotExist:
    print('kkhotmachil@gmail.com not found')
    print('Creating new admin user...')
    
    User.objects.create_superuser(
        email='kkhotmachil@gmail.com',
        username='kkhotmachil@gmail.com',
        password='Thuch22qq@@',
        first_name='Admin',
        last_name='User',
        user_type='admin'
    )
    print('New admin created')

# Deactivate old admin to prevent login
try:
    old_admin = User.objects.get(email='admin@bebrivus.com')
    old_admin.is_active = False
    old_admin.save()
    print('Deactivated old admin@bebrivus.com')
except User.DoesNotExist:
    print('Old admin not found')
