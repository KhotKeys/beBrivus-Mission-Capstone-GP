from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
	list_display = (
		'email', 'username', 'first_name', 'last_name',
		'user_type', 'country', 'is_active', 'created_at'
	)
	search_fields = ('email', 'username', 'first_name', 'last_name', 'country')
	list_filter = ('user_type', 'is_active', 'country')