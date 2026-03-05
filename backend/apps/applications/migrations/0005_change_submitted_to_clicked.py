# Generated migration to change 'submitted' status to 'clicked'

from django.db import migrations, models


def update_status_values(apps, schema_editor):
    """Update existing 'submitted' status to 'clicked'"""
    Application = apps.get_model('applications', 'Application')
    Application.objects.filter(status='submitted').update(status='clicked')


def reverse_status_values(apps, schema_editor):
    """Reverse: Update 'clicked' back to 'submitted'"""
    Application = apps.get_model('applications', 'Application')
    Application.objects.filter(status='clicked').update(status='submitted')


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0004_alter_application_unique_together_and_more'),
    ]

    operations = [
        migrations.RunPython(update_status_values, reverse_status_values),
        migrations.AlterField(
            model_name='application',
            name='status',
            field=models.CharField(
                choices=[
                    ('draft', 'Draft'),
                    ('clicked', 'Clicked'),
                    ('under_review', 'Under Review'),
                    ('interview_scheduled', 'Interview Scheduled'),
                    ('accepted', 'Accepted'),
                    ('rejected', 'Rejected'),
                    ('withdrawn', 'Withdrawn')
                ],
                default='draft',
                max_length=20
            ),
        ),
    ]
