# Generated migration to add amphitheater seat tracking

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0010_add_metadata_to_ticket'),
    ]

    operations = [
        migrations.CreateModel(
            name='AmphitheaterSeat',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('section_id', models.IntegerField(db_index=True)),
                ('section_name', models.CharField(max_length=50)),
                ('row', models.CharField(max_length=10)),
                ('seat_number', models.IntegerField()),
                ('is_available', models.BooleanField(default=True, db_index=True)),
                ('price_cents', models.PositiveIntegerField()),
                ('reserved_until', models.DateTimeField(null=True, blank=True, db_index=True)),
                ('ticket', models.ForeignKey(null=True, blank=True, on_delete=models.SET_NULL, related_name='amphitheater_seat', to='tickets.ticket')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'amphitheater_seats',
                'unique_together': {('section_id', 'row', 'seat_number')},
                'indexes': [
                    models.Index(fields=['section_id', 'is_available'], name='amph_seat_section_avail_idx'),
                    models.Index(fields=['reserved_until'], name='amph_seat_reserved_idx'),
                ],
            },
        ),
    ]
