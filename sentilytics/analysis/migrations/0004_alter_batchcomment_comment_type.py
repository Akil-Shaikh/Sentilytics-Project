# Generated by Django 5.1.6 on 2025-03-03 11:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0003_batchcomment_over_all_sentiment_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='batchcomment',
            name='comment_type',
            field=models.CharField(choices=[('CSV File', 'CSV'), ('Excel File', 'Excel'), ('Youtube', 'YouTube')], max_length=20),
        ),
    ]
