from rest_framework import serializers
from .models import Goal, Milestone, Activity, Habit, HabitEntry, ProgressSnapshot


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = [
            'id', 'title', 'description', 'order', 'status',
            'due_date', 'completed_date', 'created_at', 'updated_at'
        ]


class GoalSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    milestones_count = serializers.SerializerMethodField()
    completed_milestones = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'description', 'goal_type', 'priority', 'status',
            'target_date', 'started_date', 'completed_date', 'progress_percentage',
            'milestones', 'milestones_count', 'completed_milestones',
            'created_at', 'updated_at'
        ]
    
    def get_milestones_count(self, obj):
        return obj.milestones.count()
    
    def get_completed_milestones(self, obj):
        return obj.milestones.filter(status='completed').count()


class ActivitySerializer(serializers.ModelSerializer):
    goal_title = serializers.CharField(source='goal.title', read_only=True)
    milestone_title = serializers.CharField(source='milestone.title', read_only=True)
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'description', 'activity_type', 'goal', 'milestone',
            'opportunity', 'application', 'duration_minutes', 'notes',
            'activity_date', 'created_at',
            'goal_title', 'milestone_title', 'opportunity_title'
        ]


class HabitEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitEntry
        fields = ['id', 'date', 'completed', 'notes', 'created_at']


class HabitSerializer(serializers.ModelSerializer):
    entries = HabitEntrySerializer(many=True, read_only=True)
    current_streak = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Habit
        fields = [
            'id', 'title', 'description', 'frequency', 'target_count',
            'is_active', 'entries', 'current_streak', 'completion_rate',
            'created_at', 'updated_at'
        ]
    
    def get_current_streak(self, obj):
        # Calculate current streak of completed days
        from datetime import date, timedelta
        today = date.today()
        streak = 0
        current_date = today
        
        while True:
            try:
                entry = obj.entries.get(date=current_date)
                if entry.completed:
                    streak += 1
                    current_date -= timedelta(days=1)
                else:
                    break
            except HabitEntry.DoesNotExist:
                break
        
        return streak
    
    def get_completion_rate(self, obj):
        # Calculate completion rate for last 30 days
        from datetime import date, timedelta
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        total_days = 30
        completed_days = obj.entries.filter(
            date__range=[start_date, end_date],
            completed=True
        ).count()
        
        return round((completed_days / total_days) * 100, 2) if total_days > 0 else 0


class ProgressSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressSnapshot
        fields = [
            'id', 'period_type', 'period_start', 'period_end',
            'goals_active', 'goals_completed', 'milestones_completed',
            'activities_count', 'habits_completion_rate',
            'applications_submitted', 'interviews_attended',
            'created_at'
        ]


class TrackerDashboardSerializer(serializers.Serializer):
    """
    Serializer for tracker dashboard data
    """
    goals_summary = serializers.SerializerMethodField()
    recent_activities = ActivitySerializer(many=True)
    active_habits = HabitSerializer(many=True)
    progress_this_week = serializers.DictField()
    upcoming_milestones = MilestoneSerializer(many=True)
    
    def get_goals_summary(self, obj):
        user = obj['user']
        goals = Goal.objects.filter(user=user)
        
        return {
            'total': goals.count(),
            'active': goals.filter(status='in_progress').count(),
            'completed': goals.filter(status='completed').count(),
            'not_started': goals.filter(status='not_started').count(),
        }
