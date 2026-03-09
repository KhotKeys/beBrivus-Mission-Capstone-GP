from django.core.management.base import BaseCommand
from apps.opportunities.models import OpportunityCategory


class Command(BaseCommand):
    help = 'Create default opportunity categories'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'Scholarships',
                'description': 'Educational funding opportunities and grants',
                'icon': 'graduation-cap',
                'color': '#4f46e5'
            },
            {
                'name': 'Internships',
                'description': 'Temporary work experience opportunities',
                'icon': 'briefcase',
                'color': '#059669'
            },
            {
                'name': 'Jobs',
                'description': 'Full-time and part-time employment opportunities',
                'icon': 'building',
                'color': '#dc2626'
            },
            {
                'name': 'Fellowships',
                'description': 'Research and professional development programs',
                'icon': 'academic-cap',
                'color': '#7c3aed'
            }
        ]

        created_count = 0
        for category_data in categories:
            category, created = OpportunityCategory.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'icon': category_data['icon'],
                    'color': category_data['color'],
                    'active': True
                }
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
