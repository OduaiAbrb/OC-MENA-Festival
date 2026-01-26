# Generated migration to add payment_method field to Order model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0007_make_ticket_ticket_type_nullable'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(choices=[('card', 'Card'), ('cash', 'Cash')], default='card', max_length=20),
        ),
    ]
