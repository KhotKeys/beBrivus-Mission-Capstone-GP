from django.contrib import admin

from .models import MentorAvailability, MentorProfile, MentorshipSession

# Register your models here.
admin.site.register([MentorProfile, MentorshipSession, MentorAvailability])