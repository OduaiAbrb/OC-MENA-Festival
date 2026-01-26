# Generated migration to add metadata field to Order model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0008_add_payment_method_to_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='metadata',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
