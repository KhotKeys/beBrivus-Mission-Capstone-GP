from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('admin/login/', views.AdminLoginView.as_view(), name='admin-login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Reset
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Account Deletion
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete-account'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/picture/', views.DeleteProfilePictureView.as_view(), name='delete-profile-picture'),
    
    # Skills
    path('skills/', views.UserSkillViewSet.as_view(), name='skills'),
    path('skills/<int:pk>/', views.UserSkillDetailView.as_view(), name='skill-detail'),
    
    # Education
    path('education/', views.UserEducationViewSet.as_view(), name='education'),
    path('education/<int:pk>/', views.UserEducationDetailView.as_view(), name='education-detail'),
    
    # Experience
    path('experience/', views.UserExperienceViewSet.as_view(), name='experience'),
    path('experience/<int:pk>/', views.UserExperienceDetailView.as_view(), name='experience-detail'),
]
