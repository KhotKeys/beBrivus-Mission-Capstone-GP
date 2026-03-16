from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Main router — existing endpoints unchanged
router = DefaultRouter()
router.register('conversations', views.ConversationViewSet, basename='conversations')
router.register('messages', views.MessageViewSet, basename='messages')
router.register('notifications', views.NotificationViewSet, basename='notifications')

conversation_urls = [
    path('conversations/<int:pk>/messages/', views.ConversationViewSet.as_view({'get': 'messages'}), name='conversation-messages'),
    path('conversations/<int:pk>/send_message/', views.ConversationViewSet.as_view({'post': 'send_message'}), name='conversation-send-message'),
    path('conversations/<int:pk>/mark_read/', views.ConversationViewSet.as_view({'post': 'mark_read'}), name='conversation-mark-read'),
]

urlpatterns = [
    path('', include(router.urls)),
] + conversation_urls + [
    # E2E encrypted messaging endpoints
    path('keys/', views.UserPublicKeyView.as_view(), name='e2e-keys'),
    path('keys/<int:user_id>/', views.UserPublicKeyView.as_view(), name='e2e-keys-user'),
    path('e2e/conversations/', views.E2EConversationView.as_view(), name='e2e-conversations'),
    path('e2e/conversations/<int:conv_id>/messages/', views.E2EMessagesView.as_view(), name='e2e-messages'),
    path('e2e/conversations/<int:conv_id>/send/', views.E2EMessagesView.as_view(), name='e2e-send'),
    path('users/search/', views.UserSearchView.as_view(), name='user-search'),
    path('unread/', views.UnreadCountView.as_view(), name='unread-count'),
    path('e2e/messages/<int:msg_id>/edit/', views.E2EMessageEditView.as_view(), name='e2e-message-edit'),
    path('e2e/messages/<int:msg_id>/delete/', views.E2EMessageDeleteView.as_view(), name='e2e-message-delete'),
    path('e2e/conversations/<int:conv_id>/delete/', views.E2EConversationDeleteView.as_view(), name='e2e-conv-delete'),
]
