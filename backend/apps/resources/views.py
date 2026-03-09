from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model

User = get_user_model()

from .models import (
    ResourceCategory, Resource, Workshop, WorkshopRegistration,
    ResourceRating, ResourceBookmark, ResourceCollection, ResourceCollectionItem,
    ResourceComment, ResourceProgress, ResourceView, ResourceDownload
)
from .serializers import (
    ResourceCategorySerializer, ResourceSerializer, ResourceListSerializer,
    WorkshopSerializer, WorkshopRegistrationSerializer, ResourceRatingSerializer,
    ResourceBookmarkSerializer, ResourceCollectionSerializer, ResourceCollectionItemSerializer,
    ResourceCommentSerializer, ResourceProgressSerializer, ResourceSearchSerializer,
    ResourceStatsSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ResourceCategoryListView(generics.ListAPIView):
    """List all resource categories"""
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return ResourceCategory.objects.filter(is_active=True, parent=None)


class ResourceCategoryDetailView(generics.RetrieveAPIView):
    """Get a specific resource category with its resources"""
    serializer_class = ResourceCategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return ResourceCategory.objects.filter(is_active=True)


class ResourceListView(generics.ListAPIView):
    """List resources with filtering and search"""
    serializer_class = ResourceListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['resource_type', 'category', 'difficulty_level', 'is_featured', 'is_premium']

    def get_queryset(self):
        queryset = Resource.objects.filter(is_published=True).select_related('category', 'author')
        
        # Search functionality
        search_query = self.request.query_params.get('q', '')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(content__icontains=search_query) |
                Q(tags__name__icontains=search_query)
            ).distinct()

        # Tag filtering
        tags = self.request.query_params.get('tags', '')
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            queryset = queryset.filter(tags__name__in=tag_list).distinct()

        # Rating filtering
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.annotate(
                avg_rating=Avg('ratings__rating')
            ).filter(avg_rating__gte=min_rating)

        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering == 'rating':
            queryset = queryset.annotate(avg_rating=Avg('ratings__rating')).order_by('avg_rating')
        elif ordering == '-rating':
            queryset = queryset.annotate(avg_rating=Avg('ratings__rating')).order_by('-avg_rating')
        else:
            queryset = queryset.order_by(ordering)

        return queryset


class ResourceDetailView(generics.RetrieveAPIView):
    """Get detailed resource information"""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Resource.objects.filter(is_published=True).select_related('category', 'author')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Track view
        if request.user.is_authenticated or request.META.get('REMOTE_ADDR'):
            ResourceView.objects.create(
                resource=instance,
                user=request.user if request.user.is_authenticated else None,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            instance.increment_view_count()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ResourceCreateView(generics.CreateAPIView):
    """Create a new resource"""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ResourceUpdateView(generics.UpdateAPIView):
    """Update a resource (only by author or admin)"""
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_staff:
            return Resource.objects.all()
        return Resource.objects.filter(author=self.request.user)


class ResourceDeleteView(generics.DestroyAPIView):
    """Delete a resource (only by author or admin)"""
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_staff:
            return Resource.objects.all()
        return Resource.objects.filter(author=self.request.user)


class FeaturedResourcesView(generics.ListAPIView):
    """Get featured resources"""
    serializer_class = ResourceListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Resource.objects.filter(
            is_published=True, 
            is_featured=True
        ).select_related('category', 'author')[:10]


class PopularResourcesView(generics.ListAPIView):
    """Get popular resources based on views and ratings"""
    serializer_class = ResourceListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Resource.objects.filter(
            is_published=True
        ).annotate(
            popularity_score=Count('resource_views') + Count('ratings') * 2
        ).order_by('-popularity_score')[:20]


class RecentResourcesView(generics.ListAPIView):
    """Get recently added resources"""
    serializer_class = ResourceListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Resource.objects.filter(
            is_published=True
        ).select_related('category', 'author').order_by('-created_at')[:10]


class ResourceRatingView(APIView):
    """Handle resource ratings"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id, is_published=True)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        rating_value = request.data.get('rating')
        review_text = request.data.get('review', '')

        if not rating_value or not (1 <= int(rating_value) <= 5):
            return Response(
                {'error': 'Rating must be between 1 and 5'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        rating, created = ResourceRating.objects.update_or_create(
            resource=resource,
            user=request.user,
            defaults={
                'rating': rating_value,
                'review': review_text
            }
        )

        serializer = ResourceRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id, is_published=True)
            rating = ResourceRating.objects.get(resource=resource, user=request.user)
            rating.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (Resource.DoesNotExist, ResourceRating.DoesNotExist):
            return Response(
                {'error': 'Rating not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ResourceBookmarkView(APIView):
    """Handle resource bookmarks"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id, is_published=True)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        bookmark, created = ResourceBookmark.objects.get_or_create(
            resource=resource,
            user=request.user
        )

        if created:
            return Response({'message': 'Resource bookmarked'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Resource already bookmarked'}, status=status.HTTP_200_OK)

    def delete(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id, is_published=True)
            bookmark = ResourceBookmark.objects.get(resource=resource, user=request.user)
            bookmark.delete()
            return Response({'message': 'Bookmark removed'}, status=status.HTTP_204_NO_CONTENT)
        except (Resource.DoesNotExist, ResourceBookmark.DoesNotExist):
            return Response(
                {'error': 'Bookmark not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class UserBookmarksView(generics.ListAPIView):
    """Get user's bookmarked resources"""
    serializer_class = ResourceBookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ResourceBookmark.objects.filter(
            user=self.request.user
        ).select_related('resource__category', 'resource__author')


class ResourceProgressView(APIView):
    """Handle resource progress tracking"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id, is_published=True)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        progress_data = request.data
        progress, created = ResourceProgress.objects.update_or_create(
            resource=resource,
            user=request.user,
            defaults={
                'status': progress_data.get('status', 'in_progress'),
                'progress_percentage': progress_data.get('progress_percentage', 0),
                'time_spent_minutes': progress_data.get('time_spent_minutes', 0),
                'notes': progress_data.get('notes', '')
            }
        )

        # Mark as completed if 100%
        if progress.progress_percentage >= 100 and progress.status != 'completed':
            progress.mark_completed()

        serializer = ResourceProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ResourceDownloadView(APIView):
    """Handle resource downloads"""
    permission_classes = [permissions.AllowAny]

    def post(self, request, resource_id):
        try:
            resource = Resource.objects.get(id=resource_id, is_published=True)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if not resource.file:
            return Response(
                {'error': 'No downloadable file available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Track download
        ResourceDownload.objects.create(
            resource=resource,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR'),
            file_name=resource.file.name,
            file_size_bytes=resource.file.size if resource.file else 0
        )
        resource.increment_download_count()

        return Response({
            'download_url': resource.file.url,
            'file_name': resource.file.name,
            'file_size': resource.file.size if resource.file else 0
        })


class WorkshopListView(generics.ListAPIView):
    """List all workshops"""
    serializer_class = WorkshopSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Workshop.objects.filter(
            resource__is_published=True
        ).select_related('resource__category', 'resource__author')


class WorkshopDetailView(generics.RetrieveAPIView):
    """Get workshop details"""
    serializer_class = WorkshopSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'resource__slug'

    def get_queryset(self):
        return Workshop.objects.filter(
            resource__is_published=True
        ).select_related('resource__category', 'resource__author')


class WorkshopRegistrationView(APIView):
    """Handle workshop registrations"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, workshop_id):
        try:
            workshop = Workshop.objects.get(id=workshop_id, resource__is_published=True)
        except Workshop.DoesNotExist:
            return Response(
                {'error': 'Workshop not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        if workshop.is_full:
            return Response(
                {'error': 'Workshop is full'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        registration, created = WorkshopRegistration.objects.get_or_create(
            workshop=workshop,
            user=request.user,
            defaults={'is_active': True}
        )

        if created:
            return Response({'message': 'Successfully registered for workshop'}, status=status.HTTP_201_CREATED)
        elif not registration.is_active:
            registration.is_active = True
            registration.save()
            return Response({'message': 'Registration reactivated'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Already registered'}, status=status.HTTP_200_OK)

    def delete(self, request, workshop_id):
        try:
            workshop = Workshop.objects.get(id=workshop_id)
            registration = WorkshopRegistration.objects.get(
                workshop=workshop, 
                user=request.user,
                is_active=True
            )
            registration.is_active = False
            registration.save()
            return Response({'message': 'Registration cancelled'}, status=status.HTTP_204_NO_CONTENT)
        except (Workshop.DoesNotExist, WorkshopRegistration.DoesNotExist):
            return Response(
                {'error': 'Registration not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ResourceStatsView(APIView):
    """Get resource statistics"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        stats = {
            'total_resources': Resource.objects.filter(is_published=True).count(),
            'total_views': ResourceView.objects.count(),
            'total_downloads': ResourceDownload.objects.count(),
            'popular_categories': list(
                ResourceCategory.objects.annotate(
                    resource_count=Count('resources', filter=Q(resources__is_published=True))
                ).filter(resource_count__gt=0).order_by('-resource_count')[:5].values('name', 'resource_count')
            ),
            'trending_resources': list(
                Resource.objects.filter(is_published=True).annotate(
                    recent_views=Count(
                        'resource_views',
                        filter=Q(resource_views__viewed_at__gte=timezone.now() - timezone.timedelta(days=7))
                    )
                ).order_by('-recent_views')[:5].values('title', 'slug', 'recent_views')
            ),
            'recent_resources': list(
                Resource.objects.filter(is_published=True).order_by('-created_at')[:5].values(
                    'title', 'slug', 'created_at'
                )
            )
        }
        
        serializer = ResourceStatsSerializer(stats)
        return Response(serializer.data)
