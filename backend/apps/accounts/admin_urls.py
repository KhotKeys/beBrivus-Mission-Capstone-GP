from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import admin_views

app_name = 'admin_accounts'

router = DefaultRouter()
router.register('users', admin_views.AdminUserViewSet, basename='admin-users')
router.register('opportunities', admin_views.AdminOpportunityViewSet, basename='admin-opportunities')
router.register('categories', admin_views.AdminOpportunityCategoryViewSet, basename='admin-categories')
router.register('resources', admin_views.AdminResourceViewSet, basename='admin-resources')

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('dashboard/stats/', admin_views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/recent-activity/', admin_views.RecentActivityView.as_view(), name='recent-activity'),
    path('dashboard/analytics/', admin_views.AnalyticsView.as_view(), name='analytics'),
    
    # User management
    path('users/bulk-actions/', admin_views.UserBulkActionsView.as_view(), name='user-bulk-actions'),
    path('users/<int:user_id>/toggle-status/', admin_views.ToggleUserStatusView.as_view(), name='toggle-user-status'),
    
    # Content management
    path('content/announcements/', admin_views.AnnouncementViewSet.as_view({'get': 'list', 'post': 'create'}), name='announcements'),
    path('content/announcements/<int:pk>/', admin_views.AnnouncementViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='announcement-detail'),
]
