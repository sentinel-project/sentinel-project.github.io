# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('reported_mdr_tb', models.BooleanField(verbose_name='Reported MDR TB case')),
                ('reported_xdr_tb', models.BooleanField(verbose_name='Reported XDR TB case')),
                ('documented_adult_mdr_tb', models.BooleanField(verbose_name='Publication documenting adult MDR TB case')),
                ('documented_child_mdr_tb', models.BooleanField(verbose_name='Publication documenting child MDR TB case')),
                ('documented_adult_xdr_tb', models.BooleanField(verbose_name='Publication documenting adult XDR TB case')),
                ('documented_child_xdr_tb', models.BooleanField(verbose_name='Publication documenting child XDR TB case')),
                ('estimated_mdr_tb_cases', models.IntegerField(verbose_name='Estimated MDR TB cases', default=0)),
                ('needing_eval_0', models.IntegerField(verbose_name='0-4 year olds needing evaluation', default=0)),
                ('needing_eval_5', models.IntegerField(verbose_name='5-14 year olds needing evaluation', default=0)),
                ('needing_treatment_0', models.IntegerField(verbose_name='0-4 year olds needing treatment', default=0)),
                ('needing_treatment_5', models.IntegerField(verbose_name='5-14 year olds needing treatment', default=0)),
                ('needing_therapy_0', models.IntegerField(verbose_name='0-4 year olds needing preventative therapy', default=0)),
                ('needing_therapy_5', models.IntegerField(verbose_name='5-14 year olds needing preventative therapy', default=0)),
            ],
        ),
    ]
