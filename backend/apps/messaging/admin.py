from django.contrib import admin
from .models import Conversation, Message, MessageRead


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'mentor', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    filter_horizontal = ['participants']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'message_type', 'created_at']
    list_filter = ['message_type', 'created_at']
    readonly_fields = ['created_at']
    search_fields = ['content', 'sender__first_name', 'sender__last_name']


@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'read_at']
    list_filter = ['read_at']
    readonly_fields = ['read_at']
