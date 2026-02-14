"""
URL configuration for beBrivus project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/opportunities/', include('apps.opportunities.urls')),
    path('api/mentors/', include('apps.mentors.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/tracker/', include('apps.tracker.urls')),
    path('api/ai/', include('apps.ai_services.urls')),
    path('api/forum/', include('apps.forum.urls')),
    path('api/resources/', include('apps.resources.urls')),
    # path('api/analytics/', include('apps.analytics.urls')),
    path('api/gamification/', include('apps.gamification.urls')),
    path('api/messaging/', include('apps.messaging.urls')),
    
    # Admin API endpoints
    path('api/admin/', include('apps.accounts.admin_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
