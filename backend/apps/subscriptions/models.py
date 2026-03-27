from django.db import models
from django.conf import settings
from apps.charities.models import Charity

class Donation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='donations')
    charity = models.ForeignKey(Charity, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    plan_type = models.CharField(max_length=20) # monthly/yearly
    timestamp = models.DateTimeField(auto_now_add=True)
    stripe_invoice_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"${self.amount} to {self.charity.name} by {self.user.email if self.user else 'Deleted User'}"
