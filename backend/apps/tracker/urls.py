from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GoalViewSet, MilestoneViewSet, ActivityViewSet, 
    HabitViewSet
)

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'habits', HabitViewSet, basename='habit')

urlpatterns = [
    path('', include(router.urls)),
]
