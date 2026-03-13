from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, authenticate
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from apps.notifications.email_service import notify_password_reset
from threading import Thread
import os
from pathlib import Path
from .models import User, UserSkill, UserEducation, UserExperience
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserSerializer, UserSkillSerializer, UserEducationSerializer, UserExperienceSerializer
)


def send_password_reset_email(user, reset_link):
    """
    Send password reset email to user asynchronously
    """
    # Use EmailService for sending
    notify_password_reset(
        user_email=user.email,
        user_name=user.first_name or user.username,
        reset_link=reset_link
    )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Check if onboarding is needed
        needs_onboarding = False
        onboarding_type = None
        
        if user.user_type == 'mentor':
            # Check if mentor profile exists
            from apps.mentors.models import MentorProfile
            try:
                user.mentor_profile
            except MentorProfile.DoesNotExist:
                needs_onboarding = True
                onboarding_type = 'mentor'
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'needs_onboarding': needs_onboarding,
            'onboarding_type': onboarding_type,
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Check if onboarding is needed
        needs_onboarding = False
        onboarding_type = None
        
        if user.user_type == 'mentor':
            # Check if mentor profile exists
            from apps.mentors.models import MentorProfile
            try:
                user.mentor_profile
            except MentorProfile.DoesNotExist:
                needs_onboarding = True
                onboarding_type = 'mentor'
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'needs_onboarding': needs_onboarding,
            'onboarding_type': onboarding_type,
        })


class AdminLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        if not (user.user_type == 'admin' or user.is_staff or user.is_superuser):
            return Response(
                {'detail': 'Insufficient permissions for admin access.'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserSkillViewSet(generics.ListCreateAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        skill_name = request.data.get('name', '').strip()
        skill_level = request.data.get('level', 'beginner')
        
        if not skill_name:
            return Response(
                {'error': 'Skill name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create skill - update level if exists
        skill, created = UserSkill.objects.get_or_create(
            user=request.user,
            name=skill_name,
            defaults={'level': skill_level, 'verified': False}
        )
        
        if not created:
            # Skill exists - update level
            skill.level = skill_level
            skill.save()
            serializer = self.get_serializer(skill)
            return Response(
                {
                    **serializer.data,
                    'message': 'Skill already exists - level updated'
                },
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(skill)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserSkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)


class UserEducationViewSet(generics.ListCreateAPIView):
    serializer_class = UserEducationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserEducation.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        institution = request.data.get('institution', '').strip()
        degree = request.data.get('degree', '').strip()
        field_of_study = request.data.get('field_of_study', '').strip()
        start_date = request.data.get('start_date')
        
        if not all([institution, degree, field_of_study, start_date]):
            return Response(
                {'error': 'Institution, degree, field of study, and start date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if similar education exists
        existing = UserEducation.objects.filter(
            user=request.user,
            institution=institution,
            degree=degree,
            field_of_study=field_of_study
        ).first()
        
        if existing:
            # Update existing education
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {
                    **serializer.data,
                    'message': 'Education entry already exists - updated'
                },
                status=status.HTTP_200_OK
            )
        
        # Create new education
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserEducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserEducationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserEducation.objects.filter(user=self.request.user)


class UserExperienceViewSet(generics.ListCreateAPIView):
    serializer_class = UserExperienceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserExperience.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        company = request.data.get('company', '').strip()
        position = request.data.get('position', '').strip()
        start_date = request.data.get('start_date')
        
        if not all([company, position, start_date]):
            return Response(
                {'error': 'Company, position, and start date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if similar experience exists
        existing = UserExperience.objects.filter(
            user=request.user,
            company=company,
            position=position
        ).first()
        
        if existing:
            # Update existing experience
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {
                    **serializer.data,
                    'message': 'Experience entry already exists - updated'
                },
                status=status.HTTP_200_OK
            )
        
        # Create new experience
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserExperienceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserExperience.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            if "rest_framework_simplejwt.token_blacklist" in settings.INSTALLED_APPS:
                token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)

        return Response(
            {"message": "Logged out locally"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(generics.GenericAPIView):
    """Request password reset email"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create reset link
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            # Send email asynchronously in background thread
            email_thread = Thread(
                target=send_password_reset_email,
                args=(user, reset_link),
                daemon=True
            )
            email_thread.start()
            
            return Response(
                {'message': 'If an account exists with this email, you will receive a password reset link.'},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            # Return same message for security - don't reveal if email exists
            return Response(
                {'message': 'If an account exists with this email, you will receive a password reset link.'},
                status=status.HTTP_200_OK
            )


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirm password reset with token"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response(
                {'error': 'UID, token, and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Invalid or expired reset link'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            return Response(
                {'message': 'Password has been reset successfully'},
                status=status.HTTP_200_OK
            )
            
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {'error': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DeleteAccountView(generics.GenericAPIView):
    """Delete user account and all associated data"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Password is required to confirm account deletion'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify password
        user = authenticate(username=request.user.email, password=password)
        if user is None or user.id != request.user.id:
            return Response(
                {'error': 'Incorrect password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Delete uploaded files before deleting user
            # 1. Profile picture
            if request.user.profile_picture:
                try:
                    if os.path.isfile(request.user.profile_picture.path):
                        os.remove(request.user.profile_picture.path)
                except Exception as e:
                    print(f"Error deleting profile picture: {e}")
            
            # 2. Application documents
            from apps.applications.models import Application, ApplicationDocument
            user_applications = Application.objects.filter(user=request.user)
            for application in user_applications:
                for document in application.documents.all():
                    try:
                        if document.file and os.path.isfile(document.file.path):
                            os.remove(document.file.path)
                    except Exception as e:
                        print(f"Error deleting application document: {e}")
            
            # 3. Forum images
            from apps.forum.models import Discussion
            user_discussions = Discussion.objects.filter(author=request.user)
            for discussion in user_discussions:
                if discussion.image:
                    try:
                        if os.path.isfile(discussion.image.path):
                            os.remove(discussion.image.path)
                    except Exception as e:
                        print(f"Error deleting forum image: {e}")
            
            # Delete user (CASCADE will handle related database records)
            user_email = request.user.email
            request.user.delete()
            
            return Response(
                {'message': f'Account {user_email} has been permanently deleted'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Failed to delete account: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
