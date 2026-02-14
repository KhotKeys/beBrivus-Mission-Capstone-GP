from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'resources'

urlpatterns = [
    # Categories
    path('categories/', views.ResourceCategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.ResourceCategoryDetailView.as_view(), name='category-detail'),
    
    # Resources
    path('', views.ResourceListView.as_view(), name='resource-list'),
    path('featured/', views.FeaturedResourcesView.as_view(), name='resource-featured'),
    path('popular/', views.PopularResourcesView.as_view(), name='resource-popular'),
    path('recent/', views.RecentResourcesView.as_view(), name='resource-recent'),
    path('create/', views.ResourceCreateView.as_view(), name='resource-create'),
    path('stats/', views.ResourceStatsView.as_view(), name='resource-stats'),
    path('<slug:slug>/', views.ResourceDetailView.as_view(), name='resource-detail'),
    path('<slug:slug>/edit/', views.ResourceUpdateView.as_view(), name='resource-update'),
    path('<slug:slug>/delete/', views.ResourceDeleteView.as_view(), name='resource-delete'),
    
    # Resource interactions
    path('<int:resource_id>/rate/', views.ResourceRatingView.as_view(), name='resource-rate'),
    path('<int:resource_id>/bookmark/', views.ResourceBookmarkView.as_view(), name='resource-bookmark'),
    path('<int:resource_id>/progress/', views.ResourceProgressView.as_view(), name='resource-progress'),
    path('<int:resource_id>/download/', views.ResourceDownloadView.as_view(), name='resource-download'),
    
    # User resources
    path('user/bookmarks/', views.UserBookmarksView.as_view(), name='user-bookmarks'),
    
    # Workshops
    path('workshops/', views.WorkshopListView.as_view(), name='workshop-list'),
    path('workshops/<slug:resource__slug>/', views.WorkshopDetailView.as_view(), name='workshop-detail'),
    path('workshops/<int:workshop_id>/register/', views.WorkshopRegistrationView.as_view(), name='workshop-register'),
]
