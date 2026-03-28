from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cancelled', 'Cancelled'),
        ('lapsed', 'Lapsed'),
    ]
    
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    ROLE_CHOICES = [
        ('member', 'Member'),
        ('organization', 'Organization'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)
    subscription_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='lapsed'
    )
    subscription_plan = models.CharField(
        max_length=10, 
        choices=PLAN_CHOICES, 
        blank=True
    )
    user_role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member'
    )
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    
    selected_charity = models.ForeignKey(
        'charities.Charity', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL
    )
    donation_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00
    )
    total_donated = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        from django.utils import timezone
        from datetime import timedelta
        # Expire after 15 minutes
        return timezone.now() > self.created_at + timedelta(minutes=15)

    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp}"
