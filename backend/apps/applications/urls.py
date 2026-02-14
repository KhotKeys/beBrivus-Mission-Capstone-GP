from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'applications'

router = DefaultRouter()
router.register('', views.ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', views.ApplicationDashboardView.as_view(), name='dashboard'),
    path('analytics/', views.ApplicationAnalyticsView.as_view(), name='analytics'),
]
