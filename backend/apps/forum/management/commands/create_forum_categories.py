from django.core.management.base import BaseCommand
from apps.forum.models import ForumCategory


class Command(BaseCommand):
    help = 'Create default forum categories'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'General',
                'description': 'General discussions and topics that don\'t fit into specific categories',
                'color': '#6366f1',
                'icon': 'message-circle',
                'order': 0
            },
            {
                'name': 'Questions & Help',
                'description': 'Ask questions and get help from the community',
                'color': '#10b981',
                'icon': 'help-circle',
                'order': 1
            },
            {
                'name': 'Career Advice',
                'description': 'Share and discuss career-related topics',
                'color': '#f59e0b',
                'icon': 'briefcase',
                'order': 2
            },
            {
                'name': 'Job Opportunities',
                'description': 'Share job postings and opportunities',
                'color': '#3b82f6',
                'icon': 'search',
                'order': 3
            },
            {
                'name': 'Resources & Learning',
                'description': 'Share educational resources and learning materials',
                'color': '#8b5cf6',
                'icon': 'book-open',
                'order': 4
            },
            {
                'name': 'Announcements',
                'description': 'Important announcements and updates',
                'color': '#ef4444',
                'icon': 'megaphone',
                'order': 5
            }
        ]

        created_count = 0
        for category_data in categories:
            category, created = ForumCategory.objects.get_or_create(
                name=category_data['name'],
                defaults=category_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new categories')
        )
