from django.contrib import admin
from .models import User, ActivityLog


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
	list_display = (
		'email', 'username', 'first_name', 'last_name',
		'user_type', 'country', 'is_active', 'created_at'
	)
	search_fields = ('email', 'username', 'first_name', 'last_name', 'country')
	list_filter = ('user_type', 'is_active', 'country')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
	list_display = ('activity_type', 'message', 'user', 'created_at')
	list_filter = ('activity_type', 'created_at')
	search_fields = ('message', 'user')
	date_hierarchy = 'created_at'