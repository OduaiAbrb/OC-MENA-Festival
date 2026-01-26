# Generated migration to make OrderItem.ticket_type nullable for amphitheater tickets

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0005_amphitheater_models'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderitem',
            name='ticket_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='tickets.tickettype'),
        ),
    ]
