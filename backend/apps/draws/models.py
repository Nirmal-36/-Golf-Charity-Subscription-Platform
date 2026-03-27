from django.db import models
from django.conf import settings

class DrawRound(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('running', 'Running'),
        ('completed', 'Completed')
    ]
    
    LOGIC_CHOICES = [
        ('random', 'Random (Lottery)'),
        ('weighted', 'Algorithmic (Weighted)')
    ]
    
    draw_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    logic_type = models.CharField(max_length=20, choices=LOGIC_CHOICES, default='random')
    is_published = models.BooleanField(default=False)
    total_pool = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    jackpot_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    jackpot_rolled_over = models.BooleanField(default=False)
    winning_numbers = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Draw {self.id} on {self.draw_date.strftime('%Y-%m-%d')}"

class DrawEntry(models.Model):
    draw = models.ForeignKey(DrawRound, on_delete=models.CASCADE, related_name='entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='draw_entries')
    numbers = models.JSONField() # e.g. [3, 15, 27, 41, 7]
    matches = models.PositiveIntegerField(default=0)
    tier_won = models.PositiveIntegerField(null=True, blank=True)
    prize_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ('draw', 'user') # Users can only have 1 entry per draw

    def __str__(self):
        return f"{self.user.email} - Draw {self.draw.id}"

class DrawWinner(models.Model):
    STATUS_CHOICES = [
        ('pending_proof', 'Pending Proof'),
        ('proof_submitted', 'Proof Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid')
    ]
    
    draw = models.ForeignKey(DrawRound, on_delete=models.CASCADE, related_name='winners')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wins')
    tier = models.PositiveIntegerField()
    prize_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_proof')
    proof_screenshot_url = models.URLField(blank=True)
    proof_submitted_at = models.DateTimeField(null=True, blank=True)
    admin_approved_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Winner: {self.user.email} - Tier {self.tier}"

class AdminAuditLog(models.Model):
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=255) # e.g. "Approved Winner #12"
    resource_type = models.CharField(max_length=50) # e.g. "DrawWinner"
    resource_id = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.admin.email} - {self.action} at {self.timestamp}"
