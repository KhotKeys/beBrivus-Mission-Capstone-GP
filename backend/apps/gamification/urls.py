from django.urls import path
from . import views

app_name = 'gamification'

urlpatterns = [
    # Badges
    path('badges/', views.BadgeListView.as_view(), name='badge-list'),
    path('user/badges/', views.UserBadgesView.as_view(), name='user-badges'),
    
    # Levels
    path('levels/', views.LevelListView.as_view(), name='level-list'),
    
    # User Profile & Stats
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    
    # Points
    path('points/history/', views.PointTransactionListView.as_view(), name='point-history'),
    path('points/award/', views.AwardPointsView.as_view(), name='award-points'),
    
    # Leaderboard
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    
    # Badge Progress
    path('check-progress/', views.CheckBadgeProgressView.as_view(), name='check-progress'),
    
    # Summary
    path('summary/', views.GamificationSummaryView.as_view(), name='gamification-summary'),
]
