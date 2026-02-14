from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'analyses', views.AIAnalysisViewSet, basename='ai-analyses')
router.register(r'chat-sessions', views.ChatSessionViewSet, basename='chat-sessions')
router.register(r'insights', views.AIInsightViewSet, basename='ai-insights')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', views.ChatView.as_view(), name='ai-chat'),
    path('opportunity-match/', views.OpportunityMatchView.as_view(), name='opportunity-match'),
    path('document-review/', views.DocumentReviewView.as_view(), name='document-review'),
    path('interview-prep/', views.InterviewPrepView.as_view(), name='interview-prep'),
]
