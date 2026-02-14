from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'mentors'

router = DefaultRouter()
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('dashboard', views.MentorDashboardViewSet, basename='mentor-dashboard')
router.register('', views.MentorViewSet, basename='mentor')

urlpatterns = [
    path('onboarding/', views.MentorOnboardingView.as_view(), name='mentor-onboarding'),
    path('', include(router.urls)),
    path('search/', views.MentorSearchView.as_view(), name='mentor-search'),
    path('<int:mentor_id>/availability/', views.MentorAvailabilityView.as_view(), name='mentor-availability'),
    path('<int:mentor_id>/book/', views.BookMentorSessionView.as_view(), name='book-session'),
]
