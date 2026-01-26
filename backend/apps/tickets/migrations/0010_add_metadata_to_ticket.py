# Generated migration to add metadata field to Ticket model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0009_add_metadata_to_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='metadata',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
