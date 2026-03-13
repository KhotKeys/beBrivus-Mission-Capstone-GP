from re import M
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q, Avg, Case, When, IntegerField, Value
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
from .models import MentorProfile, MentorshipSession, MentorAvailability, MentorSpecificAvailability
from .notifications import send_all_booking_emails
from .serializers import (
    MentorProfileSerializer, 
    MentorSearchSerializer,
    MentorSessionSerializer,
    MentorAvailabilitySerializer,
    MentorSpecificAvailabilitySerializer,
    AvailableSlotSerializer,
    BookSessionSerializer,
    MentorOnboardingSerializer
)


class MentorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving mentors
    """
    serializer_class = MentorProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'current_company', 'specializations']
    filterset_fields = ['available_for_mentoring', 'hourly_rate', 'expertise_level']
    ordering_fields = ['hourly_rate', 'average_rating', 'total_sessions', 'user__date_joined']
    ordering = ['-average_rating']

    def get_queryset(self):
        queryset = MentorProfile.objects.select_related('user').prefetch_related(
            'weekly_availability'
        )

        user = self.request.user
        if hasattr(user, 'skills'):
            user_skills = list(user.skills.values_list('name', flat=True))
            if user_skills:  # only annotate if user has at least one skill
                first_skill = user_skills[0]
                queryset = queryset.annotate(
                    match_score=Case(
                        When(specializations__icontains=first_skill, then=Value(95)),
                        default=Value(75),
                        output_field=IntegerField()
                    )
                )
            else:
                # fallback if no skills
                queryset = queryset.annotate(
                    match_score=Value(75, output_field=IntegerField())
                )
        else:
            # if user has no skills relation at all
            queryset = queryset.annotate(
                match_score=Value(75, output_field=IntegerField())
            )

        return queryset

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get mentor's availability"""
        mentor = self.get_object()
        availability = MentorAvailability.objects.filter(mentor=mentor)
        serializer = MentorAvailabilitySerializer(availability, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def book_session(self, request, pk=None):
        """Book a session with the mentor"""
        mentor = self.get_object()
        serializer = BookSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(
                mentee=request.user,
                mentor=mentor.user,
                status='scheduled'
            )
            return Response(MentorSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MentorSearchView(APIView):
    """
    Advanced search for mentors with filtering and matching
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = MentorProfile.objects.select_related('user').prefetch_related(
            'weekly_availability'
        )
        
        # Apply filters
        search_term = request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_term) |
                Q(user__last_name__icontains=search_term) |
                Q(current_company__icontains=search_term) |
                Q(specializations__icontains=search_term)
            ).distinct()

        expertise_filter = request.query_params.get('expertise', '')
        if expertise_filter:
            queryset = queryset.filter(specializations__icontains=expertise_filter)

        availability_filter = request.query_params.get('availability', '')
        if availability_filter:
            queryset = queryset.filter(available_for_mentoring=availability_filter.lower() == 'true')

        min_rating = request.query_params.get('min_rating', '')
        if min_rating:
            try:
                queryset = queryset.filter(average_rating__gte=float(min_rating))
            except ValueError:
                pass

        max_rate = request.query_params.get('max_rate', '')
        if max_rate:
            try:
                queryset = queryset.filter(hourly_rate__lte=float(max_rate))
            except ValueError:
                pass

        # Sort
        sort_by = request.query_params.get('sort', 'rating')
        if sort_by == 'rating':
            queryset = queryset.order_by('-rating')
        elif sort_by == 'price_low':
            queryset = queryset.order_by('hourly_rate')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-hourly_rate')
        elif sort_by == 'experience':
            queryset = queryset.order_by('-experience_years')

        # Paginate
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        total = queryset.count()
        mentors = queryset[start:end]

        serializer = MentorSearchSerializer(mentors, many=True, context={'request': request})
        
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'has_next': end < total,
            'has_previous': page > 1
        })


class MentorAvailabilityView(APIView):
    """
    List mentor's available time slots for a specific date range
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, mentor_id):
        """Get available slots for mentor"""
        from datetime import datetime, timedelta
        
        try:
            mentor = MentorProfile.objects.get(id=mentor_id)
        except MentorProfile.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=404)
        
        # Get date range from query params (default to next 30 days)
        today = timezone.now().date()
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = today
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = start_date + timedelta(days=30)
        
        available_slots = []
        current_date = start_date
        
        while current_date <= end_date:
            # Check for specific availability overrides first
            specific_slots = MentorSpecificAvailability.objects.filter(
                mentor=mentor,
                date=current_date,
                is_available=True
            ).order_by('start_time')
            
            if specific_slots.exists():
                # Use specific availability
                for slot in specific_slots:
                    available_slots.append({
                        'date': slot.date,
                        'start_time': slot.start_time,
                        'end_time': slot.end_time,
                        'timezone': slot.timezone,
                        'slot_type': 'specific'
                    })
            else:
                # Check if this date is explicitly marked as unavailable
                unavailable_slots = MentorSpecificAvailability.objects.filter(
                    mentor=mentor,
                    date=current_date,
                    is_available=False
                )
                
                if not unavailable_slots.exists():
                    # Use weekly availability
                    day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
                    weekly_slots = MentorAvailability.objects.filter(
                        mentor=mentor,
                        day_of_week=day_of_week,
                        is_active=True
                    ).order_by('start_time')
                    
                    for slot in weekly_slots:
                        # Check if this specific time slot is blocked
                        is_blocked = unavailable_slots.filter(
                            start_time__lte=slot.start_time,
                            end_time__gte=slot.end_time
                        ).exists()
                        
                        if not is_blocked:
                            available_slots.append({
                                'date': current_date,
                                'start_time': slot.start_time,
                                'end_time': slot.end_time,
                                'timezone': slot.timezone,
                                'slot_type': 'weekly'
                            })
            
            current_date += timedelta(days=1)
        
        # Serialize the results
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)


class BookMentorSessionView(APIView):
    """
    Book a session with a mentor
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, mentor_id):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Log request
            logger.info(f"=== BOOKING REQUEST ===")
            logger.info(f"User: {request.user.email}")
            logger.info(f"Mentor ID: {mentor_id}")
            logger.info(f"Data: {request.data}")
            
            # Get mentor
            try:
                mentor_profile = MentorProfile.objects.get(id=mentor_id)
                logger.info(f"Mentor found: {mentor_profile.user.get_full_name()}")
            except MentorProfile.DoesNotExist:
                logger.error(f"Mentor {mentor_id} not found")
                return Response(
                    {'error': 'Mentor not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Validate data
            serializer = BookSessionSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(
                    {'error': 'Invalid data', 'details': serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Validated data: {serializer.validated_data}")
            
            # Extract data
            session_date = serializer.validated_data['session_date']
            start_time = serializer.validated_data['start_time']
            duration = serializer.validated_data.get('duration', 60)
            session_type = serializer.validated_data.get('session_type', 'general')
            notes = serializer.validated_data.get('notes', '')
            
            # Create datetime
            scheduled_start = timezone.make_aware(
                timezone.datetime.combine(session_date, start_time)
            )
            scheduled_end = scheduled_start + timezone.timedelta(minutes=duration)
            
            logger.info(f"Scheduled: {scheduled_start} to {scheduled_end}")

            # Check conflicts - exclude cancelled/rejected sessions
            has_conflict = MentorshipSession.objects.filter(
                mentor=mentor_profile,
                scheduled_start__lt=scheduled_end,
                scheduled_end__gt=scheduled_start
            ).exclude(
                status__in=['cancelled', 'rejected', 'no_show', 'completed']
            ).exists()
            
            if has_conflict:
                logger.warning("Time slot conflict")
                return Response(
                    {'error': 'This time slot is already booked'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create session
            session = MentorshipSession.objects.create(
                mentee=request.user,
                mentor=mentor_profile,
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                session_type=session_type,
                notes=notes,
                status='scheduled'
            )
            
            logger.info(f"Session created: ID={session.id}")

            # Mark time unavailable
            try:
                MentorSpecificAvailability.objects.update_or_create(
                    mentor=mentor_profile,
                    date=session_date,
                    start_time=start_time,
                    defaults={
                        'end_time': scheduled_end.time(),
                        'timezone': mentor_profile.time_zone,
                        'is_available': False,
                        'reason': 'Booked session'
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to mark unavailable: {e}")

            # Send notification
            try:
                send_all_booking_emails(
                    booking=session,
                    student=request.user,
                    mentor_obj=mentor_profile,
                    session_date=str(session_date),
                    start_time=str(start_time),
                    duration=duration,
                    session_type=session_type,
                    notes=notes
                )
            except Exception as e:
                logger.warning(f"Notification failed: {e}")

            return Response(
                MentorSessionSerializer(session).data, 
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.exception(f"Booking failed: {str(e)}")
            return Response(
                {'error': f'Booking failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's mentorship session bookings
    """
    serializer_class = MentorSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'session_type']
    ordering_fields = ['scheduled_start', 'created_at', 'status']
    ordering = ['-scheduled_start']

    def get_queryset(self):
        """Get bookings for the current user"""
        user = self.request.user
        return MentorshipSession.objects.filter(
            mentee=user
        ).select_related('mentor', 'mentor__user').order_by('-scheduled_start')

    def create(self, request, *args, **kwargs):
        """Not allowed - use specific booking endpoints"""
        return Response(
            {'error': 'Use the mentor-specific booking endpoints to create sessions'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        """Update a booking - limited fields"""
        instance = self.get_object()
        
        # Only allow updates for future sessions and certain statuses
        if instance.scheduled_start <= timezone.now():
            return Response(
                {'error': 'Cannot update past sessions'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status not in ['requested', 'scheduled']:
            return Response(
                {'error': f'Cannot update sessions with status: {instance.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only allow updating notes and agenda
        allowed_fields = ['notes', 'mentee_notes', 'agenda']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        for field, value in update_data.items():
            setattr(instance, field, value)
        
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Cancel a booking"""
        instance = self.get_object()
        
        # Only allow cancellation for future sessions
        if instance.scheduled_start <= timezone.now():
            return Response(
                {'error': 'Cannot cancel past sessions'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status not in ['requested', 'scheduled', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel sessions with status: {instance.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.status = 'cancelled'
        instance.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join session - get/generate meeting link"""
        session = self.get_object()
        user = request.user
        
        # Verify user is either mentee or mentor
        is_mentee = session.mentee == user
        is_mentor = session.mentor.user == user
        
        if not (is_mentee or is_mentor):
            return Response(
                {'error': 'Unauthorized to join this session'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if session is within valid time window (15 min before to after)
        now = timezone.now()
        time_until_start = (session.scheduled_start - now).total_seconds() / 60
        time_since_start = (now - session.scheduled_start).total_seconds() / 60
        
        if time_until_start > 15:
            return Response(
                {'error': f'Session starts in {int(time_until_start)} minutes. Can join 15 minutes before.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if time_since_start > (session.scheduled_end - session.scheduled_start).total_seconds() / 60:
            return Response(
                {'error': 'Session has already ended'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate meeting ID if not exists
        if not session.meeting_id:
            import uuid
            session.meeting_id = str(uuid.uuid4())
            session.save()
        
        # Mark session as in progress
        if session.status == 'scheduled':
            session.status = 'in_progress'
            session.actual_start = now
            session.save()
        
        return Response({
            'meeting_link': session.meeting_link,
            'meeting_id': session.meeting_id,
            'session_id': session.id,
        })

    @action(detail=True, methods=['patch'])
    def update_meeting_link(self, request, pk=None):
        """Update meeting link for the session (mentor only)"""
        session = self.get_object()
        user = request.user
        
        # Only mentor can update link
        if session.mentor.user != user:
            return Response(
                {'error': 'Only the mentor can update the meeting link'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        meeting_link = request.data.get('meeting_link')
        if not meeting_link:
            return Response(
                {'error': 'meeting_link is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.meeting_link = meeting_link
        session.save()
        
        return Response(MentorSessionSerializer(session).data)

    @action(detail=True, methods=['delete'])
    def remove_meeting_link(self, request, pk=None):
        """Remove meeting link from session (mentor only)"""
        session = self.get_object()
        user = request.user
        
        # Only mentor can remove link
        if session.mentor.user != user:
            return Response(
                {'error': 'Only the mentor can remove the meeting link'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        session.meeting_link = ''
        session.meeting_id = ''
        session.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, *args, **kwargs):
        """Delete/cancel a booking session"""
        import logging
        logger = logging.getLogger(__name__)
        
        instance = self.get_object()
        logger.info(f"Cancel request - Session ID: {instance.id}, Status: {instance.status}, Scheduled: {instance.scheduled_start}")
        
        # Allow cancellation for future sessions or very recent past sessions (within 1 hour)
        time_diff = (timezone.now() - instance.scheduled_start).total_seconds() / 3600
        logger.info(f"Time difference: {time_diff} hours")
        
        if time_diff > 1:  # More than 1 hour past
            error_msg = f'Cannot cancel sessions that started more than 1 hour ago (started {abs(time_diff):.1f} hours ago)'
            logger.error(error_msg)
            return Response(
                {'error': error_msg}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status in ['completed', 'no_show']:
            error_msg = f'Cannot cancel sessions with status: {instance.status}'
            logger.error(error_msg)
            return Response(
                {'error': error_msg}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status instead of deleting
        instance.status = 'cancelled'
        instance.save()
        logger.info(f"Session {instance.id} cancelled successfully")

        try:
            notify_booking_cancelled(instance, request.user)
        except Exception as e:
            logger.warning(f"Notification failed: {e}")
        
        return Response({'message': 'Booking cancelled successfully'})

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        now = timezone.now()
        bookings = self.get_queryset().filter(
            scheduled_start__gte=now,
            status__in=['scheduled', 'requested']
        )[:10]
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past bookings"""
        now = timezone.now()
        bookings = self.get_queryset().filter(
            scheduled_start__lt=now
        )
        
        # Pagination
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total = bookings.count()
        paginated_bookings = bookings[start:end]
        
        serializer = self.get_serializer(paginated_bookings, many=True)
        
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'has_next': end < total,
            'has_previous': page > 1
        })

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule a booking"""
        instance = self.get_object()
        
        # Only allow rescheduling for future sessions
        if instance.scheduled_start <= timezone.now():
            return Response(
                {'error': 'Cannot reschedule past sessions'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status not in ['scheduled', 'requested']:
            return Response(
                {'error': f'Cannot reschedule sessions with status: {instance.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new date/time
        new_date = request.data.get('session_date')
        new_time = request.data.get('start_time')
        duration = request.data.get('duration', 60)
        
        if not new_date or not new_time:
            return Response(
                {'error': 'session_date and start_time are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            new_date_obj = datetime.strptime(new_date, '%Y-%m-%d').date()
            new_time_obj = datetime.strptime(new_time, '%H:%M').time()
            
            new_scheduled_start = timezone.make_aware(
                timezone.datetime.combine(new_date_obj, new_time_obj)
            )
            new_scheduled_end = new_scheduled_start + timezone.timedelta(minutes=int(duration))
            
            # Update the session
            instance.scheduled_start = new_scheduled_start
            instance.scheduled_end = new_scheduled_end
            instance.status = 'scheduled'  # Reset status
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {'error': 'Invalid date or time format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get user's booking statistics"""
        from django.db import models
        
        user = request.user
        all_sessions = MentorshipSession.objects.filter(mentee=user)
        
        stats = {
            'total_sessions': all_sessions.count(),
            'completed_sessions': all_sessions.filter(status='completed').count(),
            'upcoming_sessions': all_sessions.filter(
                scheduled_start__gte=timezone.now(),
                status__in=['scheduled', 'requested']
            ).count(),
            'cancelled_sessions': all_sessions.filter(status='cancelled').count(),
            'total_hours': sum([
                (session.actual_end - session.actual_start).total_seconds() / 3600
                for session in all_sessions.filter(
                    actual_start__isnull=False,
                    actual_end__isnull=False
                )
            ]),
            'favorite_session_types': list(
                all_sessions.values('session_type')
                .annotate(count=models.Count('session_type'))
                .order_by('-count')[:3]
                .values_list('session_type', flat=True)
            )
        }
        
        return Response(stats)


class MentorDashboardViewSet(viewsets.GenericViewSet):
    """
    ViewSet for mentor dashboard functionality
    """
    permission_classes = [IsAuthenticated]
    
    def get_mentor_profile(self):
        """Helper to get the current user's mentor profile"""
        try:
            return self.request.user.mentor_profile
        except MentorProfile.DoesNotExist:
            return None
    
    @action(detail=False, methods=['get'])
    def my_sessions(self, request):
        """Returns all sessions for the logged-in mentor."""
        try:
            mentor_profile = request.user.mentor_profile
        except Exception:
            return Response({'error': 'Mentor profile not found.'}, status=404)

        from django.utils import timezone
        today = timezone.now().date()

        # Get ALL bookings for this mentor
        all_bookings = MentorshipSession.objects.filter(
            mentor=mentor_profile,
            status='confirmed'
        ).select_related('mentee').order_by('scheduled_start')

        upcoming = []
        past = []

        for b in all_bookings:
            session_date = b.scheduled_start.date()
            data = {
                'id': b.id,
                'student_name': b.mentee.get_full_name() or b.mentee.username,
                'student_email': b.mentee.email,
                'student_avatar': b.mentee.first_name[0].upper() if b.mentee.first_name else b.mentee.username[0].upper(),
                'session_date': str(b.scheduled_start.date()),
                'start_time': str(b.scheduled_start.time()),
                'duration': int((b.scheduled_end - b.scheduled_start).total_seconds() / 60),
                'topic': b.notes or 'General Mentorship',
                'status': b.status,
                'meeting_link': b.meeting_link or '',
            }
            if session_date >= today:
                upcoming.append(data)
            else:
                past.append(data)

        return Response({
            'upcoming': upcoming,
            'past': past,
            'total': len(upcoming) + len(past),
        })
    
    @action(detail=False, methods=['get'])
    def pending_sessions(self, request):
        """Get sessions that need mentor's action (requested status)"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        pending_sessions = MentorshipSession.objects.filter(
            mentor=mentor_profile,
            status='scheduled'
        ).select_related('mentee').order_by('-created_at')
        
        serializer = MentorSessionSerializer(pending_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming_sessions(self, request):
        """Get confirmed upcoming sessions"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        now = timezone.now()
        upcoming_sessions = MentorshipSession.objects.filter(
            mentor=mentor_profile,
            status='confirmed',
            scheduled_start__gte=now
        ).select_related('mentee').order_by('scheduled_start')
        serializer = MentorSessionSerializer(upcoming_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_mentees(self, request):
        """Get list of all mentees this mentor has worked with"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get unique mentees from sessions
        User = get_user_model()
        
        mentee_ids = MentorshipSession.objects.filter(
            mentor=mentor_profile
        ).values_list('mentee_id', flat=True).distinct()
        
        mentees = User.objects.filter(id__in=mentee_ids)
        
        # Create mentee info with session stats
        mentees_data = []
        for mentee in mentees:
            sessions = MentorshipSession.objects.filter(
                mentor=mentor_profile, 
                mentee=mentee
            )
            
            mentees_data.append({
                'id': mentee.id,
                'first_name': mentee.first_name,
                'last_name': mentee.last_name,
                'email': mentee.email,
                'username': mentee.username,
                'profile_picture': None,
                'total_sessions': sessions.count(),
                'completed_sessions': sessions.filter(status='completed').count(),
                'last_session': sessions.order_by('-scheduled_start').first().scheduled_start if sessions.exists() else None,
                'next_session': sessions.filter(
                    status='scheduled',
                    scheduled_start__gte=timezone.now()
                ).order_by('scheduled_start').first().scheduled_start if sessions.filter(
                    status='scheduled',
                    scheduled_start__gte=timezone.now()
                ).exists() else None
            })
        
        return Response(mentees_data)
    
    @action(detail=False, methods=['post'])
    def confirm_session(self, request):
        """Confirm a requested session"""
        import logging
        import traceback
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.contrib.auth import get_user_model
        
        logger = logging.getLogger(__name__)
        
        def _safe(text):
            """ASCII-safe for Windows terminal logging."""
            return str(text).encode('ascii', 'replace').decode('ascii')
        
        def get_admin_emails():
            User = get_user_model()
            emails = list(
                User.objects.filter(is_staff=True, is_active=True)
                .exclude(email='').values_list('email', flat=True)
            )
            if 'ethxkeys@gmail.com' not in emails:
                emails.append('ethxkeys@gmail.com')
            return emails
        
        def send_booking_email(to_emails, subject, html_body, plain_body):
            """Send booking email. Never raises. Always logs result."""
            try:
                if not to_emails:
                    logger.warning(_safe('[BOOKING EMAIL] No recipients — skipping'))
                    return
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=plain_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=to_emails if isinstance(to_emails, list) else [to_emails],
                )
                msg.attach_alternative(html_body, 'text/html')
                msg.send(fail_silently=False)
                logger.info(_safe(f'[BOOKING EMAIL OK] {subject} → {to_emails}'))
            except Exception as e:
                logger.error(_safe(f'[BOOKING EMAIL FAILED] {subject} → {to_emails}: {e}'))
                logger.error(traceback.format_exc())
        
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        mentor_notes = request.data.get('mentor_notes', '')
        meeting_link = request.data.get('meeting_link', '')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='scheduled'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not in requested status'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        session.status = 'confirmed'
        session.mentor_notes = mentor_notes
        if meeting_link:
            session.meeting_link = meeting_link
        session.save()
        
        # ── BOOKING CONFIRMATION EMAILS ──────────────────────────────
        try:
            student = session.mentee
            mentor_user = mentor_profile.user
            mentor_name = mentor_user.get_full_name() or mentor_user.username
            student_name = student.get_full_name() or student.username
            session_date = str(session.scheduled_start.date())
            session_time = str(session.scheduled_start.time())
            duration = int((session.scheduled_end - session.scheduled_start).total_seconds() / 60)
            topic = session.notes or 'General Mentorship'
            login_url = getattr(settings, 'FRONTEND_LOGIN_URL', 'https://bebrivus.com/login')
            admin_login_url = getattr(settings, 'FRONTEND_ADMIN_LOGIN_URL', 'https://bebrivus.com/admin/login')
            meeting_link_html = f'<a href="{meeting_link}" style="color:#10b981;">{meeting_link}</a>' if meeting_link else 'To be provided by mentor'
            
            # ── EMAIL A — Student confirmation ──────────────────────────
            student_html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">beBrivus</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Mentorship Platform</p>
  </div>
  <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
    <h2 style="color:#111827;margin:0 0 8px;">Your Session is Confirmed!</h2>
    <p style="color:#374151;">Hi {student_name},</p>
    <p style="color:#374151;">Great news! Your mentoring session with <strong>{mentor_name}</strong> has been confirmed.</p>
    <div style="background:white;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin:20px 0;">
      <h3 style="color:#10b981;margin:0 0 14px;font-size:15px;">Session Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;width:120px;">Mentor</td><td style="padding:6px 0;font-weight:600;color:#111827;">{mentor_name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;font-weight:600;color:#111827;">{session_date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;color:#111827;">{session_time}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Duration</td><td style="padding:6px 0;font-weight:600;color:#111827;">{duration} mins</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Topic</td><td style="padding:6px 0;font-weight:600;color:#111827;">{topic}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Meeting Link</td><td style="padding:6px 0;">{meeting_link_html}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-top:20px;">
            <a href="{login_url}"
         style="background:#10b981;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        View Upcoming Sessions
      </a>
    </div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">beBrivus — Empowering African Students</p>
  </div>
</div>"""
            student_plain = f'Session confirmed with {mentor_name} on {session_date} at {session_time}. Topic: {topic}. Meeting: {meeting_link or "To be provided"}'
            
            send_booking_email(
                to_emails=student.email,
                subject=f'Session Confirmed — {mentor_name} on {session_date}',
                html_body=student_html,
                plain_body=student_plain,
            )
            
            # ── EMAIL B — Mentor notification ───────────────────────────
            mentor_html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:28px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">beBrivus</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Mentorship Platform</p>
  </div>
  <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
    <h2 style="color:#111827;margin:0 0 8px;">New Session Confirmed</h2>
    <p style="color:#374151;">Hi {mentor_name},</p>
    <p style="color:#374151;">You have confirmed a mentoring session with <strong>{student_name}</strong>.</p>
    <div style="background:white;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin:20px 0;">
      <h3 style="color:#3b82f6;margin:0 0 14px;font-size:15px;">Session Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;width:120px;">Student</td><td style="padding:6px 0;font-weight:600;color:#111827;">{student_name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;color:#111827;">{student.email}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;font-weight:600;color:#111827;">{session_date}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;color:#111827;">{session_time}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Duration</td><td style="padding:6px 0;font-weight:600;color:#111827;">{duration} mins</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Topic</td><td style="padding:6px 0;font-weight:600;color:#111827;">{topic}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-top:20px;">
            <a href="{login_url}"
         style="background:#3b82f6;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        View Your Schedule
      </a>
    </div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">beBrivus — Empowering African Students</p>
  </div>
</div>"""
            mentor_plain = f'Session confirmed with student {student_name} on {session_date} at {session_time}. Topic: {topic}.'
            
            send_booking_email(
                to_emails=mentor_user.email,
                subject=f'New Confirmed Session — {student_name} on {session_date}',
                html_body=mentor_html,
                plain_body=mentor_plain,
            )
            
            # ── EMAIL C — Admin notification ─────────────────────────────
            admin_html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:28px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:white;margin:0;font-size:24px;">beBrivus Admin</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Session Booking Notification</p>
  </div>
  <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
    <h2 style="color:#111827;margin:0 0 16px;">New Mentoring Session Confirmed</h2>
    <div style="background:white;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin-bottom:20px;">
      <p style="margin:0 0 10px;"><strong>Student:</strong> {student_name} ({student.email})</p>
      <p style="margin:0 0 10px;"><strong>Mentor:</strong> {mentor_name} ({mentor_user.email})</p>
      <p style="margin:0 0 10px;"><strong>Date:</strong> {session_date}</p>
      <p style="margin:0 0 10px;"><strong>Time:</strong> {session_time}</p>
      <p style="margin:0 0 10px;"><strong>Duration:</strong> {duration} mins</p>
      <p style="margin:0;"><strong>Topic:</strong> {topic}</p>
    </div>
    <div style="text-align:center;">
            <a href="{admin_login_url}"
         style="background:#6366f1;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        View in Admin Panel
      </a>
    </div>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">beBrivus Admin Notification System</p>
  </div>
</div>"""
            admin_plain = f'New booking confirmed. Student: {student_name} ({student.email}). Mentor: {mentor_name} ({mentor_user.email}). Date: {session_date} at {session_time}. Topic: {topic}.'
            
            send_booking_email(
                to_emails=get_admin_emails(),
                subject=f'New Session Booked — {student_name} with {mentor_name}',
                html_body=admin_html,
                plain_body=admin_plain,
            )
        except Exception as e:
            logger.error(_safe(f'[BOOKING EMAIL FAILED] Error sending emails: {e}'))
            logger.error(traceback.format_exc())
        # ── END BOOKING EMAILS ───────────────────────────────────────
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reject_session(self, request):
        """Reject a requested session"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        mentor_notes = request.data.get('mentor_notes', '')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='scheduled'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not in requested status'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        session.status = 'rejected'
        session.mentor_notes = mentor_notes
        session.save()
        
        # Notify user
        try:
            notify_session_rejected(session)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Notification failed: {e}")
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def start_session(self, request):
        """Mark session as in progress and generate/return meeting link"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='scheduled'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not scheduled'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if it's time to start (within 10 minutes of scheduled time)
        now = timezone.now()
        time_until_start = (session.scheduled_start - now).total_seconds() / 60
        
        if time_until_start > 10:
            return Response(
                {'error': f'Session cannot be started yet. Please wait {int(time_until_start)} more minutes.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update session status
        session.status = 'in_progress'
        session.actual_start = now
        
        # Generate meeting ID if not exists
        if not session.meeting_id:
            session.meeting_id = str(uuid.uuid4())[:8]
        
        session.save()
        
        # Notify user about start time
        try:
            notify_session_start_time_updated(session)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Notification failed: {e}")
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def end_session(self, request):
        """Mark session as completed"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        mentor_notes = request.data.get('mentor_notes', '')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='in_progress'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not in progress'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        session.status = 'completed'
        session.actual_end = timezone.now()
        if mentor_notes:
            session.mentor_notes = mentor_notes
        session.save()
        
        # Update mentor stats
        mentor_profile.total_sessions += 1
        mentor_profile.save()
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)


class MentorOnboardingView(generics.CreateAPIView):
    """
    View for mentor onboarding - create mentor profile after registration
    """
    serializer_class = MentorOnboardingSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Check if mentor needs onboarding"""
        if request.user.user_type != 'mentor':
            return Response({'needs_onboarding': False})
        
        # Check if mentor profile exists
        needs_onboarding = not hasattr(request.user, 'mentor_profile')
        return Response({
            'needs_onboarding': needs_onboarding,
            'onboarding_type': 'mentor' if needs_onboarding else None
        })
    
    def post(self, request, *args, **kwargs):
        # Check if user is a mentor
        if request.user.user_type != 'mentor':
            return Response(
                {'error': 'Only users with mentor type can create mentor profiles'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if mentor profile already exists
        if hasattr(request.user, 'mentor_profile'):
            return Response(
                {'error': 'Mentor profile already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            mentor_profile = serializer.save()
            response_serializer = MentorProfileSerializer(mentor_profile)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
