from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.ForumCategoryViewSet, basename='forum-categories')
router.register(r'discussions', views.DiscussionViewSet, basename='forum-discussions')

# Nested router for replies under discussions
discussions_router = NestedDefaultRouter(router, r'discussions', lookup='discussion')
discussions_router.register(r'replies', views.ReplyViewSet, basename='discussion-replies')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(discussions_router.urls)),
    path('stats/', views.ForumStatsView.as_view(), name='forum-stats'),
]
