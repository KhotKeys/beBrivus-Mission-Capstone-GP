from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'mentors'

router = DefaultRouter()
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('', views.MentorViewSet, basename='mentor')

urlpatterns = [
    path('onboarding/', views.MentorOnboardingView.as_view(), name='mentor-onboarding'),
    path('search/', views.MentorSearchView.as_view(), name='mentor-search'),
    path('dashboard/my_sessions/', views.MentorDashboardViewSet.as_view({'get': 'my_sessions'}), name='mentor-my-sessions'),
    path('dashboard/my_mentees/', views.MentorDashboardViewSet.as_view({'get': 'my_mentees'}), name='mentor-my-mentees'),
    path('dashboard/pending_sessions/', views.MentorDashboardViewSet.as_view({'get': 'pending_sessions'}), name='mentor-pending-sessions'),
    path('dashboard/upcoming_sessions/', views.MentorDashboardViewSet.as_view({'get': 'upcoming_sessions'}), name='mentor-upcoming-sessions'),
    path('dashboard/confirm_session/', views.MentorDashboardViewSet.as_view({'post': 'confirm_session'}), name='mentor-confirm-session'),
    path('dashboard/reject_session/', views.MentorDashboardViewSet.as_view({'post': 'reject_session'}), name='mentor-reject-session'),
    path('dashboard/start_session/', views.MentorDashboardViewSet.as_view({'post': 'start_session'}), name='mentor-start-session'),
    path('dashboard/end_session/', views.MentorDashboardViewSet.as_view({'post': 'end_session'}), name='mentor-end-session'),
    path('<int:mentor_id>/availability/', views.MentorAvailabilityView.as_view(), name='mentor-availability'),
    path('<int:mentor_id>/book/', views.BookMentorSessionView.as_view(), name='book-session'),
    path('', include(router.urls)),
]
