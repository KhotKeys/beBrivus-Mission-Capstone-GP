from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.resources.models import ResourceCategory


DEFAULT_CATEGORIES = [
    {
        "name": "Application Essays",
        "description": "Personal statements, essays, and writing guides.",
    },
    {
        "name": "CV & Resume",
        "description": "Templates and best practices for CVs and resumes.",
    },
    {
        "name": "Interview Skills",
        "description": "Preparation guides and practice materials.",
    },
    {
        "name": "Research Documents",
        "description": "Proposals, abstracts, and research templates.",
    },
    {
        "name": "Financial Planning",
        "description": "Budgeting tools and scholarship finance guidance.",
    },
    {
        "name": "Study Abroad",
        "description": "Resources for global programs and exchanges.",
    },
    {
        "name": "Career Development",
        "description": "Career planning, internships, and networking.",
    },
    {
        "name": "Scholarships",
        "description": "Scholarship search and application resources.",
    },
]


class Command(BaseCommand):
    help = "Seed default resource categories if they do not exist."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for entry in DEFAULT_CATEGORIES:
            name = entry["name"]
            description = entry["description"]
            slug = slugify(name)

            category, created = ResourceCategory.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": description,
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
            else:
                changed = False
                if category.name != name:
                    category.name = name
                    changed = True
                if category.description != description:
                    category.description = description
                    changed = True
                if not category.is_active:
                    category.is_active = True
                    changed = True
                if changed:
                    category.save(update_fields=["name", "description", "is_active"])
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Resource categories seeded. Created: {created_count}, Updated: {updated_count}."
            )
        )
