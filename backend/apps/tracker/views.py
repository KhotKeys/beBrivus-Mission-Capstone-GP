from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from datetime import date, timedelta
from .models import Goal, Milestone, Activity, Habit, HabitEntry, ProgressSnapshot
from .serializers import (
    GoalSerializer, MilestoneSerializer, ActivitySerializer,
    HabitSerializer, HabitEntrySerializer, ProgressSnapshotSerializer,
    TrackerDashboardSerializer
)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).prefetch_related('milestones')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        progress = request.data.get('progress_percentage')
        
        if progress is not None and 0 <= progress <= 100:
            goal.progress_percentage = progress
            if progress == 100 and goal.status != 'completed':
                goal.status = 'completed'
                goal.completed_date = timezone.now().date()
            elif progress > 0 and goal.status == 'not_started':
                goal.status = 'in_progress'
                goal.started_date = timezone.now().date()
            goal.save()
            
            return Response(GoalSerializer(goal).data)
        
        return Response({'error': 'Invalid progress percentage'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        goals = self.get_queryset()
        
        # Recent activities
        recent_activities = Activity.objects.filter(user=user)[:10]
        
        # Active habits
        active_habits = Habit.objects.filter(user=user, is_active=True)
        
        # Progress this week
        week_start = timezone.now().date() - timedelta(days=timezone.now().weekday())
        week_end = week_start + timedelta(days=6)
        
        progress_this_week = {
            'activities_count': Activity.objects.filter(
                user=user,
                activity_date__date__range=[week_start, week_end]
            ).count(),
            'goals_completed': goals.filter(
                completed_date__range=[week_start, week_end]
            ).count(),
        }
        
        # Upcoming milestones
        upcoming_milestones = Milestone.objects.filter(
            goal__user=user,
            status__in=['pending', 'in_progress'],
            due_date__isnull=False,
            due_date__gte=timezone.now().date()
        ).order_by('due_date')[:5]
        
        dashboard_data = {
            'user': user,
            'recent_activities': recent_activities,
            'active_habits': active_habits,
            'progress_this_week': progress_this_week,
            'upcoming_milestones': upcoming_milestones,
        }
        
        serializer = TrackerDashboardSerializer(dashboard_data)
        return Response(serializer.data)


class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Milestone.objects.filter(goal__user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        milestone = self.get_object()
        milestone.status = 'completed'
        milestone.completed_date = timezone.now().date()
        milestone.save()
        
        # Update parent goal progress
        goal = milestone.goal
        total_milestones = goal.milestones.count()
        completed_milestones = goal.milestones.filter(status='completed').count()
        
        if total_milestones > 0:
            progress = (completed_milestones / total_milestones) * 100
            goal.progress_percentage = min(progress, 100)
            
            if progress == 100:
                goal.status = 'completed'
                goal.completed_date = timezone.now().date()
            elif goal.status == 'not_started':
                goal.status = 'in_progress'
                goal.started_date = timezone.now().date()
            
            goal.save()
        
        return Response(MilestoneSerializer(milestone).data)


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Activity.objects.filter(user=self.request.user)
        
        # Filter by activity type
        activity_type = self.request.query_params.get('type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(activity_date__date__range=[start_date, end_date])
        
        # Filter by goal
        goal_id = self.request.query_params.get('goal')
        if goal_id:
            queryset = queryset.filter(goal_id=goal_id)
        
        return queryset.select_related('goal', 'milestone', 'opportunity')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        user = request.user
        
        # Activity types count
        activity_types = Activity.objects.filter(user=user).values('activity_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Activities over time (last 30 days)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        activities_timeline = []
        current_date = start_date
        while current_date <= end_date:
            count = Activity.objects.filter(
                user=user,
                activity_date__date=current_date
            ).count()
            activities_timeline.append({
                'date': current_date,
                'count': count
            })
            current_date += timedelta(days=1)
        
        return Response({
            'activity_types': activity_types,
            'activities_timeline': activities_timeline,
        })


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user).prefetch_related('entries')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def log_entry(self, request, pk=None):
        habit = self.get_object()
        entry_date = request.data.get('date', timezone.now().date())
        completed = request.data.get('completed', True)
        notes = request.data.get('notes', '')
        
        entry, created = HabitEntry.objects.update_or_create(
            habit=habit,
            date=entry_date,
            defaults={
                'completed': completed,
                'notes': notes
            }
        )
        
        return Response(HabitEntrySerializer(entry).data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's habit status for all active habits"""
        user = request.user
        today = timezone.now().date()
        
        habits = Habit.objects.filter(user=user, is_active=True)
        habit_status = []
        
        for habit in habits:
            try:
                entry = HabitEntry.objects.get(habit=habit, date=today)
                completed = entry.completed
            except HabitEntry.DoesNotExist:
                completed = False
            
            habit_status.append({
                'habit': HabitSerializer(habit).data,
                'completed': completed
            })
        
        return Response(habit_status)
