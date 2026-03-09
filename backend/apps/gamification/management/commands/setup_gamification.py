from django.core.management.base import BaseCommand
from apps.gamification.models import Level, Badge


class Command(BaseCommand):
    help = 'Initialize gamification system with default levels and badges'

    def handle(self, *args, **options):
        self.stdout.write('Setting up gamification system...')
        
        # Create Levels
        levels = [
            (1, 'Newbie', 0, 99, '🌱', '#10B981'),
            (2, 'Explorer', 100, 249, '🗺️', '#3B82F6'),
            (3, 'Learner', 250, 499, '📚', '#6366F1'),
            (4, 'Achiever', 500, 999, '🎯', '#8B5CF6'),
            (5, 'Professional', 1000, 1999, '💼', '#A855F7'),
            (6, 'Expert', 2000, 3999, '🎓', '#EC4899'),
            (7, 'Master', 4000, 7999, '👑', '#F59E0B'),
            (8, 'Legend', 8000, 15999, '⭐', '#EF4444'),
            (9, 'Champion', 16000, 31999, '🏆', '#DC2626'),
            (10, 'Ultimate', 32000, 999999, '💎', '#7C2D12'),
        ]
        
        for level_num, name, min_pts, max_pts, icon, color in levels:
            level, created = Level.objects.get_or_create(
                level_number=level_num,
                defaults={
                    'name': name,
                    'min_points': min_pts,
                    'max_points': max_pts,
                    'icon': icon,
                    'color': color,
                    'benefits': {
                        'description': f'Level {level_num} benefits',
                        'features': []
                    }
                }
            )
            if created:
                self.stdout.write(f'Created level: {name}')
        
        # Create Badges
        badges = [
            # Activity Badges
            ('first-login', 'First Login', 'Welcome to beBrivus! You\'ve taken your first step.', 'activity', 'common', '👋', '#10B981', 0, 'login_count', 1),
            ('early-bird', 'Early Bird', 'Log in for 7 consecutive days.', 'activity', 'uncommon', '🌅', '#3B82F6', 50, 'login_streak', 7),
            ('dedication', 'Dedication', 'Maintain a 30-day login streak.', 'activity', 'rare', '🔥', '#F59E0B', 200, 'login_streak', 30),
            
            # Achievement Badges
            ('first-application', 'First Application', 'Submit your first job application.', 'achievement', 'common', '📝', '#6366F1', 10, 'applications_submitted', 1),
            ('application-spree', 'Application Spree', 'Submit 10 job applications.', 'achievement', 'uncommon', '📋', '#8B5CF6', 100, 'applications_submitted', 10),
            ('job-hunter', 'Job Hunter', 'Submit 50 job applications.', 'achievement', 'rare', '🎯', '#A855F7', 500, 'applications_submitted', 50),
            
            # Learning Badges
            ('first-resource', 'First Resource', 'Complete your first learning resource.', 'achievement', 'common', '📖', '#10B981', 10, 'resources_completed', 1),
            ('knowledge-seeker', 'Knowledge Seeker', 'Complete 10 learning resources.', 'achievement', 'uncommon', '🧠', '#3B82F6', 100, 'resources_completed', 10),
            ('scholar', 'Scholar', 'Complete 25 learning resources.', 'achievement', 'rare', '🎓', '#6366F1', 300, 'resources_completed', 25),
            
            # Community Badges
            ('first-post', 'First Post', 'Make your first forum post.', 'community', 'common', '💬', '#EC4899', 10, 'forum_posts', 1),
            ('discussion-starter', 'Discussion Starter', 'Create 5 forum discussions.', 'community', 'uncommon', '🗣️', '#F59E0B', 50, 'forum_posts', 5),
            ('community-leader', 'Community Leader', 'Create 20 forum discussions.', 'community', 'rare', '👥', '#EF4444', 200, 'forum_posts', 20),
            
            # Milestone Badges
            ('hundred-club', '100 Points Club', 'Reach 100 total points.', 'milestone', 'uncommon', '💯', '#10B981', 0, 'total_points', 100),
            ('five-hundred-club', '500 Points Club', 'Reach 500 total points.', 'milestone', 'rare', '🎯', '#3B82F6', 0, 'total_points', 500),
            ('thousand-club', '1000 Points Club', 'Reach 1000 total points.', 'milestone', 'epic', '🏆', '#F59E0B', 0, 'total_points', 1000),
            
            # Special Badges
            ('beta-user', 'Beta User', 'One of the first users of beBrivus.', 'special', 'legendary', '🚀', '#7C2D12', 0, 'early_user', 1),
            ('feedback-champion', 'Feedback Champion', 'Provided valuable feedback to improve the platform.', 'special', 'epic', '💡', '#EC4899', 100, 'feedback_given', 1),
        ]
        
        for slug, name, desc, category, rarity, icon, color, points, condition_type, condition_value in badges:
            badge, created = Badge.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': desc,
                    'category': category,
                    'rarity': rarity,
                    'icon': icon,
                    'color': color,
                    'points_required': points,
                    'condition_type': condition_type,
                    'condition_value': condition_value,
                    'is_active': True,
                    'is_hidden': rarity in ['epic', 'legendary']
                }
            )
            if created:
                self.stdout.write(f'Created badge: {name}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully initialized gamification system!')
        )
