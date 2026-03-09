from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Main router
router = DefaultRouter()
router.register('conversations', views.ConversationViewSet, basename='conversations')
router.register('messages', views.MessageViewSet, basename='messages')
router.register('notifications', views.NotificationViewSet, basename='notifications')

# Custom paths for conversation actions (in case router actions don't work)
conversation_urls = [
    path('conversations/<int:pk>/messages/', views.ConversationViewSet.as_view({'get': 'messages'}), name='conversation-messages'),
    path('conversations/<int:pk>/send_message/', views.ConversationViewSet.as_view({'post': 'send_message'}), name='conversation-send-message'),
    path('conversations/<int:pk>/mark_read/', views.ConversationViewSet.as_view({'post': 'mark_read'}), name='conversation-mark-read'),
]

urlpatterns = [
    path('', include(router.urls)),
] + conversation_urls
