# Generated migration for amphitheater_visible field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0003_enable_scanning'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventconfig',
            name='amphitheater_visible',
            field=models.BooleanField(default=True, help_text='Show/hide amphitheater section on tickets page'),
        ),
    ]
