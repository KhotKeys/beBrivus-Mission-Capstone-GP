from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0008_add_is_edited_is_deleted'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='hidden_for',
            field=models.ManyToManyField(
                blank=True,
                related_name='hidden_conversations',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
