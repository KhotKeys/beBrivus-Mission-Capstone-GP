from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from datetime import timedelta
from .models import Application
from .serializers import ApplicationSerializer, ApplicationDetailSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job applications
    """
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['opportunity__title', 'opportunity__company', 'notes']
    filterset_fields = ['status']
    ordering_fields = ['submitted_at', 'updated_at', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user

        is_institution = (
            getattr(user, 'user_type', '') == 'institution' or
            getattr(user, 'role', '') == 'institution' or
            hasattr(user, 'institution_profile')
        )

        if is_institution:
            return Application.objects.filter(
                opportunity__posted_by=user
            ).select_related('user', 'opportunity').order_by('-created_at')

        if user.is_staff:
            # Admin sees applications for admin-posted opportunities
            try:
                qs = Application.objects.filter(
                    opportunity__posted_by_type='admin'
                ).select_related('user', 'opportunity').order_by('-created_at')
                # If empty, fall back to all
                if qs.count() == 0:
                    return Application.objects.all().select_related('user', 'opportunity').order_by('-created_at')
                return qs
            except Exception:
                return Application.objects.all().select_related('user', 'opportunity').order_by('-created_at')

        return Application.objects.filter(
            user=user
        ).select_related('opportunity').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ApplicationDetailSerializer
        return ApplicationSerializer

    def perform_create(self, serializer):
        application = serializer.save(user=self.request.user)
        
        # Import here to avoid circular imports
        from apps.notifications.models import Notification
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Notify institution or admin who owns the opportunity
        opportunity_owner = application.opportunity.posted_by
        if opportunity_owner:
            Notification.objects.create(
                recipient=opportunity_owner,
                notification_type='application_submitted',
                title='New Application Received',
                message=f'{self.request.user.get_full_name() or self.request.user.username} applied for "{application.opportunity.title}".',
                related_application=application,
                related_opportunity=application.opportunity,
            )

        # Always notify admin if institution received the application
        if application.opportunity.posted_by_type == 'institution':
            admins = User.objects.filter(is_staff=True)
            for admin in admins:
                if admin != opportunity_owner:
                    Notification.objects.create(
                        recipient=admin,
                        notification_type='application_submitted',
                        title='New Application to Institution Opportunity',
                        message=f'{self.request.user.get_full_name() or self.request.user.username} applied for institution opportunity "{application.opportunity.title}".',
                        related_application=application,
                        related_opportunity=application.opportunity,
                    )
    
    def update(self, request, *args, **kwargs):
        """Override update to handle feedback and status changes"""
        instance = self.get_object()
        feedback_text = request.data.get('notes') or request.data.get('feedback')
        new_status = request.data.get('status')
        
        # Track old status for history
        old_status = instance.status
        
        # Update status if provided
        if new_status and new_status != old_status:
            instance.status = new_status
            
            # Create status history
            from .models import ApplicationStatusHistory
            ApplicationStatusHistory.objects.create(
                application=instance,
                old_status=old_status,
                new_status=new_status,
                changed_by=request.user,
                notes=feedback_text or ''
            )
            
            # Send email notification to applicant
            self._send_status_update_email(instance, old_status, new_status)
        
        # Save feedback if provided
        if feedback_text:
            from .models import ApplicationFeedback
            feedback, created = ApplicationFeedback.objects.get_or_create(
                application=instance,
                defaults={'created_by': request.user}
            )
            feedback.general_comments = feedback_text
            feedback.public = True
            feedback.created_by = request.user
            feedback.save()
            
            instance.notes = feedback_text
        
        # Update other fields from request
        for field in ['cover_letter', 'additional_info', 'interview_date']:
            if field in request.data:
                setattr(instance, field, request.data[field])
        
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def _send_status_update_email(self, application, old_status, new_status):
        """Send email notification when application status changes"""
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.template.loader import render_to_string
        from threading import Thread
        
        def send_async():
            try:
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
                user_name = application.user.get_full_name()
                opportunity_title = application.opportunity.title
                
                # Select template and subject based on status
                if new_status == 'accepted':
                    template = 'emails/application_accepted.html'
                    subject = f'🎉 Congratulations! Your Application Has Been Accepted — {opportunity_title}'
                elif new_status == 'rejected':
                    template = 'emails/application_rejected.html'
                    subject = f'Your Application Update — {opportunity_title}'
                elif new_status == 'under_review':
                    template = 'emails/application_under_review.html'
                    subject = f'Your Application Is Under Review — {opportunity_title}'
                else:
                    # Fallback for other statuses
                    template = None
                    subject = f'Application Status Update — {opportunity_title}'
                
                if template:
                    from .email_utils import get_logo_base64
                    html_content = render_to_string(template, {
                        'user_name': user_name,
                        'opportunity_title': opportunity_title,
                        'frontend_url': frontend_url,
                        'dashboard_url': f'{frontend_url}/applications',
                        'opportunities_url': f'{frontend_url}/opportunities',
                        'logo_base64': get_logo_base64(),
                    })
                    
                    from_email = settings.EMAIL_HOST_USER or 'no-reply@bebrivus.com'
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=f'Your application for {opportunity_title} has been updated to: {new_status.replace("_", " ").title()}',
                        from_email=from_email,
                        to=[application.user.email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send(fail_silently=True)
                    print(f'✓ Email sent to {application.user.email} — application {new_status}')
            except Exception as e:
                print(f'Failed to send status update email: {e}')
        
        Thread(target=send_async, daemon=True).start()

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update application status"""
        application = self.get_object()
        user = request.user

        # Permission check
        is_admin = user.is_staff
        is_opportunity_owner = (
            application.opportunity.posted_by == user
        )

        if not is_admin and not is_opportunity_owner:
            return Response({'error': 'Permission denied.'}, status=403)

        new_status = request.data.get('status')
        feedback = request.data.get('feedback', '')

        valid_statuses = [
            'pending', 'under_review',
            'interview_scheduled', 'accepted', 'rejected'
        ]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status.'}, status=400)

        old_status = application.status
        application.status = new_status
        if feedback:
            application.notes = feedback
        application.save()

        # Import here to avoid circular imports
        from apps.notifications.models import Notification
        from django.contrib.auth import get_user_model
        User = get_user_model()

        status_labels = {
            'pending': 'Pending',
            'under_review': 'Under Review',
            'interview_scheduled': 'Interview Scheduled',
            'accepted': 'Accepted ✅',
            'rejected': 'Rejected ❌',
        }

        # Notify the STUDENT about their application status change
        Notification.objects.create(
            recipient=application.user,
            notification_type='status_changed',
            title=f'Application {status_labels.get(new_status, new_status)}',
            message=f'Your application for "{application.opportunity.title}" has been updated to {status_labels.get(new_status, new_status)}.' + (f' Feedback: {feedback}' if feedback else ''),
            related_application=application,
            related_opportunity=application.opportunity,
        )

        # Notify ADMIN if status was changed by an institution
        if is_opportunity_owner and not is_admin:
            admins = User.objects.filter(is_staff=True)
            for admin in admins:
                Notification.objects.create(
                    recipient=admin,
                    notification_type='status_changed',
                    title=f'Institution updated application status',
                    message=f'Institution updated application for "{application.opportunity.title}" from {status_labels.get(old_status, old_status)} to {status_labels.get(new_status, new_status)}.',
                    related_application=application,
                    related_opportunity=application.opportunity,
                )

        return Response({
            'id': application.id,
            'status': application.status,
            'notes': application.notes,
            'message': f'Status updated to {new_status}'
        })

    @action(detail=True, methods=['post'])
    def add_interview(self, request, pk=None):
        """Add interview date to application"""
        application = self.get_object()
        interview_date = request.data.get('interview_date')
        
        if interview_date:
            application.interview_dates.append(interview_date)
            application.status = 'interview'
            application.save()
            return Response(ApplicationSerializer(application).data)
        
        return Response(
            {'error': 'Interview date required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['patch'])
    def add_notes(self, request, pk=None):
        """Add or update notes for application"""
        application = self.get_object()
        notes = request.data.get('notes', '')
        
        application.notes = notes
        application.save()
        return Response(ApplicationSerializer(application).data)
    
    @action(detail=False, methods=['get'])
    def my_opportunities(self, request):
        """Get applications for opportunities created by the current user"""
        from apps.opportunities.models import Opportunity
        
        # Get opportunities created by current user
        user_opportunities = Opportunity.objects.filter(created_by=request.user)
        
        # Get applications for those opportunities
        applications = Application.objects.filter(
            opportunity__in=user_opportunities
        ).select_related('user', 'opportunity').order_by('-submitted_at')
        
        # Apply status filter if provided
        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'all':
            applications = applications.filter(status=status_filter)
        
        serializer = ApplicationDetailSerializer(applications, many=True)
        return Response(serializer.data)


class ApplicationDashboardView(APIView):
    """
    Dashboard view with application statistics and insights
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_applications = Application.objects.filter(user=request.user)
        
        # Basic stats
        total_applications = user_applications.count()
        
        # Status breakdown
        status_counts = user_applications.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        
        # Recent applications (last 30 days)
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        recent_applications = user_applications.filter(
            applied_date__gte=thirty_days_ago
        ).count()
        
        # Upcoming actions (interviews, follow-ups, etc.)
        upcoming_interviews = user_applications.filter(
            status='interview',
            interview_date__gte=timezone.now().date(),
            interview_date__lte=timezone.now().date() + timedelta(days=7)
        )
        
        # Applications needing follow-up (applied > 2 weeks ago, no response)
        two_weeks_ago = timezone.now().date() - timedelta(days=14)
        need_followup = user_applications.filter(
            status='applied',
            applied_date__lte=two_weeks_ago
        )
        
        # Success metrics
        interview_rate = 0
        offer_rate = 0
        if total_applications > 0:
            interviews = user_applications.filter(status__in=['interview', 'offer', 'accepted']).count()
            offers = user_applications.filter(status__in=['offer', 'accepted']).count()
            interview_rate = (interviews / total_applications) * 100
            offer_rate = (offers / total_applications) * 100
        
        # Recent activity
        recent_activity = user_applications.order_by('-updated_at')[:5]
        
        return Response({
            'stats': {
                'total_applications': total_applications,
                'recent_applications': recent_applications,
                'interview_rate': round(interview_rate, 1),
                'offer_rate': round(offer_rate, 1),
            },
            'status_breakdown': status_breakdown,
            'upcoming_actions': {
                'interviews': upcoming_interviews.count(),
                'follow_ups': need_followup.count(),
            },
            'recent_activity': ApplicationSerializer(recent_activity, many=True).data
        })


class ApplicationAnalyticsView(APIView):
    """
    Analytics view with detailed insights and trends
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_applications = Application.objects.filter(user=request.user)
        
        # Time-based analytics
        last_6_months = timezone.now().date() - timedelta(days=180)
        monthly_applications = {}
        
        for i in range(6):
            month_start = last_6_months + timedelta(days=i*30)
            month_end = month_start + timedelta(days=30)
            count = user_applications.filter(
                applied_date__gte=month_start,
                applied_date__lt=month_end
            ).count()
            monthly_applications[month_start.strftime('%Y-%m')] = count
        
        # Company analytics
        company_stats = user_applications.values(
            'opportunity__company'
        ).annotate(
            applications=Count('id')
        ).order_by('-applications')[:10]
        
        # Role analytics
        role_stats = user_applications.values(
            'opportunity__title'
        ).annotate(
            applications=Count('id')
        ).order_by('-applications')[:10]
        
        # Response time analytics
        response_times = []
        for app in user_applications.exclude(status='applied'):
            if app.updated_at and app.created_at:
                days_to_response = (app.updated_at.date() - app.created_at.date()).days
                response_times.append(days_to_response)
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        return Response({
            'monthly_trend': monthly_applications,
            'top_companies': company_stats,
            'top_roles': role_stats,
            'avg_response_time_days': round(avg_response_time, 1),
            'total_companies_applied': user_applications.values('opportunity__company').distinct().count(),
            'success_insights': self._get_success_insights(user_applications)
        })
    
    def _get_success_insights(self, applications):
        """Generate insights based on application data"""
        insights = []
        
        total = applications.count()
        if total == 0:
            return insights
        
        # Interview rate insight
        interview_apps = applications.filter(status__in=['interview', 'offer', 'accepted']).count()
        interview_rate = (interview_apps / total) * 100
        
        if interview_rate < 10:
            insights.append({
                'type': 'improvement',
                'title': 'Low Interview Rate',
                'message': f'Your interview rate is {interview_rate:.1f}%. Consider reviewing your resume and cover letters.',
                'suggestion': 'Focus on tailoring applications to specific roles and highlighting relevant skills.'
            })
        elif interview_rate > 25:
            insights.append({
                'type': 'success',
                'title': 'Great Interview Rate',
                'message': f'Your interview rate of {interview_rate:.1f}% is excellent! Keep up the good work.',
                'suggestion': 'Continue your current application strategy.'
            })
        
        # Application volume insight
        recent_apps = applications.filter(
            applied_date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        if recent_apps < 5:
            insights.append({
                'type': 'action',
                'title': 'Increase Application Volume',
                'message': f'You\'ve applied to {recent_apps} positions this month.',
                'suggestion': 'Consider applying to more positions to increase your chances.'
            })
        
        return insights
