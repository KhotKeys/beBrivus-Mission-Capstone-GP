from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0007_application_age_application_career_goals_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='phone',
            field=models.CharField(blank=True, max_length=30),
        ),
    ]
