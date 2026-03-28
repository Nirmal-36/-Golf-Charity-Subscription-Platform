from django.db import models
from django.conf import settings
from apps.charities.models import Charity

class Donation(models.Model):
    """
    Philanthropic Ledger: Records individual financial contributions to Charity Partners.
    Captures both automated subscription-percentage splits and one-time direct donations.
    Provides a permanent audit trail for platform impact reporting.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='donations',
        help_text="The member responsible for the donation. Null for guest one-time donors."
    )
    charity = models.ForeignKey(
        Charity, 
        on_delete=models.CASCADE, 
        related_name='donations',
        help_text="The designated recipient organization."
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="The net USD amount attributed to the charity."
    )
    plan_type = models.CharField(
        max_length=20,
        help_text="The source of the funds (monthly/yearly subscription split or one_time payment)."
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    stripe_invoice_id = models.CharField(
        max_length=100, 
        blank=True,
        help_text="External reference to the Stripe transaction (Invoice ID or Checkout Session ID)."
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Philanthropic Donation"
        verbose_name_plural = "Philanthropic Donations"

    def __str__(self):
        donor = self.user.email if self.user else "Anonymous Donor"
        return f"${self.amount} -> {self.charity.name} ({donor})"
