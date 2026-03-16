from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import update_last_login
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone as tz
from django.db.models import Count
from apps.notifications.email_service import notify_password_reset
from threading import Thread
from datetime import timedelta, datetime
import os
import logging
import traceback
from pathlib import Path
from .models import User, UserSkill, UserEducation, UserExperience
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserSerializer, UserSkillSerializer, UserEducationSerializer, UserExperienceSerializer
)

logger = logging.getLogger(__name__)


def _weekly_date_range():
    """Return (now, today, week_start, prev_start, prev_end, this_start, this_end, prev_s, prev_e)"""
    now = tz.now()
    today = tz.localtime(now).date()
    week_start = today - timedelta(days=6)
    prev_start = week_start - timedelta(days=7)
    prev_end = week_start - timedelta(days=1)

    def to_dt_start(d):
        return tz.make_aware(datetime.combine(d, datetime.min.time()))

    def to_dt_end(d):
        return tz.make_aware(datetime.combine(d, datetime.max.time()))

    return (
        now, today, week_start,
        to_dt_start(week_start), now,
        to_dt_start(prev_start), to_dt_end(prev_end),
        to_dt_start, to_dt_end,
    )


def _pct_change(current, previous):
    try:
        current = int(current or 0)
        previous = int(previous or 0)
        if previous == 0 and current == 0:
            return '0%'
        if previous == 0:
            return '+100%' if current > 0 else '-100%'
        change = ((current - previous) / previous) * 100
        sign = '+' if change >= 0 else ''
        return f'{sign}{round(change)}%'
    except Exception:
        return '0%'


class WeeklyAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now, today, week_start, this_start, this_end, prev_s, prev_e, to_dt_start, to_dt_end = _weekly_date_range()

        # Active Users
        # last_login is NULL for all users because LoginView uses RefreshToken.for_user()
        # directly instead of simplejwt's TokenObtainPairView, so UPDATE_LAST_LOGIN never fires.
        # Use engagement proxy: unique users who signed up OR submitted an application this week.
        try:
            has_last_login = User.objects.filter(last_login__isnull=False).exists()
            if has_last_login:
                active_this = User.objects.filter(
                    last_login__gte=this_start, last_login__lte=this_end,
                    last_login__isnull=False,
                ).count()
                active_prev = User.objects.filter(
                    last_login__gte=prev_s, last_login__lte=prev_e,
                    last_login__isnull=False,
                ).count()
                logger.info(f'[ANALYTICS] Active users via last_login: {active_this}')
            else:
                # Engagement proxy: signed up OR submitted application this week
                signup_ids_this = set(
                    User.objects.filter(
                        date_joined__gte=this_start, date_joined__lte=this_end,
                    ).values_list('id', flat=True)
                )
                try:
                    from apps.applications.models import Application
                    app_ids_this = set(
                        Application.objects.filter(
                            submitted_at__gte=this_start, submitted_at__lte=this_end,
                        ).values_list('user_id', flat=True)
                    )
                except Exception:
                    app_ids_this = set()
                active_this = len(signup_ids_this | app_ids_this)

                signup_ids_prev = set(
                    User.objects.filter(
                        date_joined__gte=prev_s, date_joined__lte=prev_e,
                    ).values_list('id', flat=True)
                )
                try:
                    from apps.applications.models import Application
                    app_ids_prev = set(
                        Application.objects.filter(
                            submitted_at__gte=prev_s, submitted_at__lte=prev_e,
                        ).values_list('user_id', flat=True)
                    )
                except Exception:
                    app_ids_prev = set()
                active_prev = len(signup_ids_prev | app_ids_prev)
                logger.info(f'[ANALYTICS] Active users via engagement proxy: {active_this}')
        except Exception as e:
            logger.error(f'[ANALYTICS] Active users query failed: {e}\n{traceback.format_exc()}')
            active_this = active_prev = 0

        # Applications Submitted
        try:
            from apps.applications.models import Application
            apps_this = Application.objects.filter(
                submitted_at__gte=this_start, submitted_at__lte=this_end,
            ).count()
            apps_prev = Application.objects.filter(
                submitted_at__gte=prev_s, submitted_at__lte=prev_e,
            ).count()
        except ImportError:
            logger.error('[ANALYTICS] Application model not found')
            apps_this = apps_prev = 0
        except Exception as e:
            logger.error(f'[ANALYTICS] Applications query failed: {e}\n{traceback.format_exc()}')
            apps_this = apps_prev = 0

        # Resources Viewed
        resources_this = resources_prev = 0
        try:
            from apps.resources.models import ResourceView
            resources_this = ResourceView.objects.filter(
                viewed_at__gte=this_start, viewed_at__lte=this_end,
            ).count()
            resources_prev = ResourceView.objects.filter(
                viewed_at__gte=prev_s, viewed_at__lte=prev_e,
            ).count()
        except ImportError:
            logger.warning('[ANALYTICS] ResourceView missing — using view_count fallback')
            try:
                from apps.resources.models import Resource
                from django.db.models import Sum
                resources_this = Resource.objects.aggregate(total=Sum('view_count'))['total'] or 0
                resources_prev = int(resources_this * 0.9) if resources_this > 0 else 0
            except Exception as e2:
                logger.error(f'[ANALYTICS] Resources fallback failed: {e2}')
        except Exception as e:
            logger.error(f'[ANALYTICS] Resources query failed: {e}\n{traceback.format_exc()}')

        # New Signups
        try:
            signups_this = User.objects.filter(
                date_joined__gte=this_start, date_joined__lte=this_end,
            ).count()
            signups_prev = User.objects.filter(
                date_joined__gte=prev_s, date_joined__lte=prev_e,
            ).count()
        except Exception as e:
            logger.error(f'[ANALYTICS] Signups query failed: {e}')
            signups_this = signups_prev = 0

        # Top Countries — ranked by total registered users (all time) with this-week signups shown
        # Uses date_joined as primary signal since last_login is null until JWT login updates it
        top_countries = []
        try:
            # Rank countries by total users registered (all time) — most meaningful signal
            country_qs = (
                User.objects
                .filter(country__isnull=False, is_active=True)
                .exclude(country='')
                .values('country')
                .annotate(total_users=Count('id'))
                .order_by('-total_users')[:10]
            )
            for row in country_qs:
                cname = row['country']
                if not cname:
                    continue
                # New signups this week from this country
                new_signups = User.objects.filter(
                    country=cname,
                    date_joined__gte=this_start,
                    date_joined__lte=this_end,
                ).count()
                country_apps = 0
                try:
                    from apps.applications.models import Application
                    country_apps = Application.objects.filter(
                        user__country=cname, submitted_at__gte=this_start,
                    ).count()
                except Exception:
                    pass
                top_countries.append({
                    'country': cname,
                    'total_users': row['total_users'],
                    'new_signups': new_signups,
                    'applications': country_apps,
                })
        except Exception as e:
            logger.error(f'[ANALYTICS] Top countries query failed: {e}\n{traceback.format_exc()}')

        # Daily Breakdown
        daily_data = []
        for offset in range(7):
            day = week_start + timedelta(days=offset)
            day_s = to_dt_start(day)
            day_e = to_dt_end(day)
            try:
                day_active = User.objects.filter(
                    last_login__gte=day_s, last_login__lte=day_e,
                    last_login__isnull=False,
                ).count()
            except Exception:
                day_active = 0
            try:
                from apps.applications.models import Application
                day_apps = Application.objects.filter(
                    submitted_at__gte=day_s, submitted_at__lte=day_e,
                ).count()
            except Exception:
                day_apps = 0
            daily_data.append({
                'date': day.strftime('%b %d'),
                'day_short': day.strftime('%a'),
                'active_users': day_active,
                'applications': day_apps,
            })

        return Response({
            'report_period': {
                'start': week_start.strftime('%b %d'),
                'end': today.strftime('%b %d'),
                'year': today.year,
                'label': f'{week_start.strftime("%b %d")} – {today.strftime("%b %d, %Y")}',
            },
            'metrics': {
                'active_users': {
                    'value': active_this,
                    'change': _pct_change(active_this, active_prev),
                    'trend': 'up' if active_this >= active_prev else 'down',
                    'prev': active_prev,
                },
                'applications_submitted': {
                    'value': apps_this,
                    'change': _pct_change(apps_this, apps_prev),
                    'trend': 'up' if apps_this >= apps_prev else 'down',
                    'prev': apps_prev,
                },
                'resources_viewed': {
                    'value': resources_this,
                    'change': _pct_change(resources_this, resources_prev),
                    'trend': 'up' if resources_this >= resources_prev else 'down',
                    'prev': resources_prev,
                },
                'new_signups': {
                    'value': signups_this,
                    'change': _pct_change(signups_this, signups_prev),
                    'trend': 'up' if signups_this >= signups_prev else 'down',
                    'prev': signups_prev,
                },
            },
            'top_countries': top_countries,
            'daily_breakdown': daily_data,
            'generated_at': now.isoformat(),
            'debug': {
                'week_start': str(week_start),
                'week_end': str(today),
                'timezone': str(tz.get_current_timezone()),
                'this_start': str(this_start),
                'this_end': str(this_end),
            },
        })


class WeeklyAnalyticsExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        import csv
        from io import StringIO
        from django.http import HttpResponse
        from django.db.models import Sum

        now, today, week_start, this_start, this_end, prev_s, prev_e, to_dt_start, to_dt_end = _weekly_date_range()

        active_users = User.objects.filter(
            last_login__gte=this_start, last_login__isnull=False, is_active=True,
        ).count()
        new_signups = User.objects.filter(date_joined__gte=this_start).count()

        apps_total = 0
        try:
            from apps.applications.models import Application
            apps_total = Application.objects.filter(submitted_at__gte=this_start).count()
        except Exception:
            pass

        resources_total = 0
        try:
            from apps.resources.models import ResourceView
            resources_total = ResourceView.objects.filter(viewed_at__gte=this_start).count()
        except Exception:
            try:
                from apps.resources.models import Resource
                resources_total = Resource.objects.aggregate(total=Sum('view_count'))['total'] or 0
            except Exception:
                pass

        output = StringIO()
        writer = csv.writer(output)

        writer.writerow(['beBrivus Weekly Analytics Report'])
        writer.writerow([f'Period: {week_start.strftime("%b %d")} - {today.strftime("%b %d, %Y")}'])
        writer.writerow([f'Generated: {now.strftime("%Y-%m-%d %H:%M")} UTC'])
        writer.writerow([])

        writer.writerow(['SUMMARY METRICS'])
        writer.writerow(['Metric', 'This Week'])
        writer.writerow(['Active Users', active_users])
        writer.writerow(['Applications Submitted', apps_total])
        writer.writerow(['Resources Viewed', resources_total])
        writer.writerow(['New Signups', new_signups])
        writer.writerow([])

        writer.writerow(['TOP COUNTRIES'])
        writer.writerow(['Rank', 'Country', 'Total Users', 'New Signups This Week', 'Applications This Week'])
        try:
            country_qs = (
                User.objects
                .filter(country__isnull=False, is_active=True)
                .exclude(country='')
                .values('country')
                .annotate(total_users=Count('id'))
                .order_by('-total_users')[:10]
            )
            for rank, row in enumerate(country_qs, 1):
                cname = row['country']
                c_signups = User.objects.filter(country=cname, date_joined__gte=this_start).count()
                c_apps = 0
                try:
                    from apps.applications.models import Application
                    c_apps = Application.objects.filter(user__country=cname, submitted_at__gte=this_start).count()
                except Exception:
                    pass
                writer.writerow([rank, cname, row['total_users'], c_signups, c_apps])
        except Exception as e:
            writer.writerow(['Country data unavailable', str(e)])

        writer.writerow([])
        writer.writerow(['DAILY BREAKDOWN'])
        writer.writerow(['Date', 'Day', 'Active Users', 'Applications'])
        for offset in range(7):
            day = week_start + timedelta(days=offset)
            day_s = to_dt_start(day)
            day_e = to_dt_end(day)
            d_active = User.objects.filter(last_login__gte=day_s, last_login__lte=day_e).count()
            d_apps = 0
            try:
                from apps.applications.models import Application
                d_apps = Application.objects.filter(submitted_at__gte=day_s, submitted_at__lte=day_e).count()
            except Exception:
                pass
            writer.writerow([day.strftime('%b %d'), day.strftime('%A'), d_active, d_apps])

        csv_content = output.getvalue()
        filename = f'bebrivus_weekly_{week_start.strftime("%Y%m%d")}_{today.strftime("%Y%m%d")}.csv'
        response = HttpResponse(csv_content, content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(csv_content.encode('utf-8'))
        return response


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
        update_last_login(None, user)
        
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
        update_last_login(None, user)

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


class DeleteProfilePictureView(generics.GenericAPIView):
    """DELETE /api/auth/profile/picture/ — remove profile picture"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        if not user.profile_picture:
            return Response({'error': 'No profile picture to delete.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if os.path.isfile(user.profile_picture.path):
                os.remove(user.profile_picture.path)
        except Exception:
            pass
        user.profile_picture = None
        user.save(update_fields=['profile_picture'])
        return Response({'message': 'Profile picture deleted successfully.'}, status=status.HTTP_200_OK)


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
        
        # Capture details BEFORE deletion
        user_name    = request.user.get_full_name() or request.user.username
        user_email   = request.user.email
        user_id      = request.user.id
        username     = request.user.username
        reason       = request.data.get('reason', '').strip()
        date_joined  = request.user.date_joined.strftime('%B %d, %Y') if request.user.date_joined else 'Unknown'
        deletion_time = tz.now().strftime('%B %d, %Y at %H:%M UTC')
        admin_emails = list(set(filter(None, [
            getattr(settings, 'MODERATION_EMAIL', 'ethxkeys@gmail.com'),
            getattr(settings, 'ADMIN_EMAIL', ''),
        ] + (getattr(settings, 'ADMIN_EMAIL_RECIPIENTS', []) or []))))

        # ── Farewell email to user ────────────────────────────────
        farewell_html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:white;margin:0;font-size:26px;">beBrivus</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Empowering African Students</p>
          </div>
          <div style="padding:36px;background:#f9fafb;border-radius:0 0 16px 16px;">
            <h2 style="color:#111827;margin:0 0 16px;">We're sad to see you go, {user_name} &#128153;</h2>
            <p style="color:#374151;line-height:1.7;margin:0 0 16px;">Your account has been successfully deleted. Your time with beBrivus meant a great deal to us.</p>
            <div style="background:white;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin:0 0 24px;">
              <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>Name:</strong> {user_name}</p>
              <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>Member since:</strong> {date_joined}</p>
              <p style="margin:0;color:#374151;font-size:14px;"><strong>Account deleted:</strong> {deletion_time}</p>
            </div>
            {('<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:16px;margin:0 0 24px;"><p style="margin:0;color:#92400e;font-size:14px;"><strong>Your reason:</strong> ' + reason + '</p></div>') if reason else ''}
            <p style="color:#374151;line-height:1.7;margin:0 0 8px;">Thank you for being part of the beBrivus family. We wish you all the success. &#127775;</p>
            <p style="color:#374151;margin:0;font-style:italic;">With gratitude,<br/><strong>The beBrivus Team</strong></p>
          </div>
        </div>"""

        admin_html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h2 style="color:white;margin:0;">&#9888;&#65039; Account Deletion Alert</h2>
          </div>
          <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
            <div style="background:white;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin-bottom:20px;">
              <p style="margin:0 0 8px;"><strong>Name:</strong> {user_name}</p>
              <p style="margin:0 0 8px;"><strong>Email:</strong> {user_email}</p>
              <p style="margin:0 0 8px;"><strong>Username:</strong> {username}</p>
              <p style="margin:0 0 8px;"><strong>User ID:</strong> #{user_id}</p>
              <p style="margin:0 0 8px;"><strong>Member since:</strong> {date_joined}</p>
              <p style="margin:0;"><strong>Deleted at:</strong> {deletion_time}</p>
            </div>
            {('<div style="background:#fff7ed;border-radius:10px;padding:16px;border:1px solid #fed7aa;margin-bottom:20px;"><p style="margin:0 0 6px;font-weight:700;color:#c2410c;">Reason:</p><p style="margin:0;color:#374151;">' + reason + '</p></div>') if reason else '<p style="color:#9ca3af;font-style:italic;margin-bottom:20px;">No reason provided.</p>'}
          </div>
        </div>"""

        from django.core.mail import EmailMultiAlternatives
        from threading import Thread

        def _send(subject, html, plain, to_list):
            try:
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=plain,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=to_list,
                )
                msg.attach_alternative(html, 'text/html')
                msg.send(fail_silently=True)
            except Exception as ex:
                logger.error(f'[DELETE ACCOUNT] Email send failed: {ex}')

        Thread(target=_send, args=(
            "We're sad to see you go — Your beBrivus account has been deleted",
            farewell_html,
            f"Dear {user_name},\n\nYour beBrivus account has been deleted.\nDeleted: {deletion_time}\n\nThank you,\nThe beBrivus Team",
            [user_email],
        ), daemon=True).start()

        Thread(target=_send, args=(
            f'[beBrivus] Account Deleted — {user_name} ({user_email})',
            admin_html,
            f"ACCOUNT DELETION\nUser: {user_name} ({user_email})\nID: #{user_id}\nDeleted: {deletion_time}\nReason: {reason or 'Not provided'}",
            admin_emails,
        ), daemon=True).start()

        logger.info(f'[DELETE ACCOUNT] Emails dispatched for user {user_id} ({username})')

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
            user_email_final = request.user.email
            request.user.delete()
            logger.info(f'[DELETE ACCOUNT] User {user_id} ({username}) permanently deleted')
            
            return Response(
                {'message': f'Account {user_email_final} has been permanently deleted. A confirmation email has been sent.', 'deleted': True},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Failed to delete account: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
