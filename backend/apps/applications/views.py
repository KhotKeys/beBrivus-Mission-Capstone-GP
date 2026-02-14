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
        return Application.objects.filter(
            user=self.request.user
        ).select_related('opportunity').order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ApplicationDetailSerializer
        return ApplicationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update application status"""
        application = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in [choice[0] for choice in Application.STATUS_CHOICES]:
            application.status = new_status
            application.save()
            return Response(ApplicationSerializer(application).data)
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

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
