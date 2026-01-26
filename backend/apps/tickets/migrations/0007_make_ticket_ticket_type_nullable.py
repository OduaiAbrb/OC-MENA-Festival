# Generated migration to make Ticket.ticket_type nullable for amphitheater tickets

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0006_make_orderitem_ticket_type_nullable'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='ticket_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='tickets.tickettype'),
        ),
    ]
