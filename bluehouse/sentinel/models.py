from django.db import models


class Country(models.Model):
    name = models.CharField(max_length=100)
    reported_mdr_tb = models.BooleanField("Reported MDR TB case")
    reported_xdr_tb = models.BooleanField("Reported XDR TB case")
    documented_adult_mdr_tb = models.BooleanField("Publication documenting adult MDR TB case")
    documented_child_mdr_tb = models.BooleanField("Publication documenting child MDR TB case")
    documented_adult_xdr_tb = models.BooleanField("Publication documenting adult XDR TB case")
    documented_child_xdr_tb = models.BooleanField("Publication documenting child XDR TB case")

    estimated_mdr_tb_cases = models.IntegerField("Estimated MDR TB cases", default=0)
    needing_eval_0 = models.IntegerField("0-4 year olds needing evaluation", default=0)
    needing_eval_5 = models.IntegerField("5-14 year olds needing evaluation", default=0)
    needing_treatment_0 = models.IntegerField("0-4 year olds needing treatment", default=0)
    needing_treatment_5 = models.IntegerField("5-14 year olds needing treatment", default=0)
    needing_therapy_0 = models.IntegerField("0-4 year olds needing preventative therapy", default=0)
    needing_therapy_5 = models.IntegerField("5-14 year olds needing preventative therapy", default=0)

    def mdr_publication_category(self):
        """
        * publication categories:

        0 = no reported case
        1 = reported case(s) but no publication found (for adults or children)
        2 = reported case(s), publications found for both adults and children
        3 = reported case(s), publication found for adult but not children
        """

        if not self.reported_mdr_tb:
            return 0
        elif not (self.documented_adult_mdr_tb and self.documented_child_mdr_tb):
            return 1
        elif (self.documented_adult_mdr_tb and self.documented_child_mdr_tb):
            return 2
        elif self.documented_adult_mdr_tb:
            return 3
        else:
            raise RuntimeError("No publication category")

    def xdr_publication_category(self):
        """
        * publication categories:

        0 = no reported case
        1 = reported case(s) but no publication found (for adults or children)
        2 = reported case(s), publications found for both adults and children
        3 = reported case(s), publication found for adult but not children
        """

        if not self.reported_xdr_tb:
            return 0
        elif not (self.documented_adult_xdr_tb and self.documented_child_xdr_tb):
            return 1
        elif (self.documented_adult_xdr_tb and self.documented_child_xdr_tb):
            return 2
        elif self.documented_adult_xdr_tb:
            return 3
        else:
            raise RuntimeError("No publication category")
