from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

class GolfScore(models.Model):
    """
    Represents a single golf round score submitted by a user.
    Uses Stableford format (range 1-45).
    Includes automated logic to maintain only the latest 5 active scores.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scores')
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(45)]
    )
    played_at = models.DateField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-played_at', '-submitted_at']

    def save(self, *args, **kwargs):
        """
        Custom save logic to enforce the 'Last 5 Rolling' requirement.
        Automatically deactivates older scores when a 6th score is submitted.
        """
        if not self.played_at:
            from django.utils import timezone
            self.played_at = timezone.now().date()
            
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Re-evaluate active scores to maintain the rolling window of 5.
            active_scores = GolfScore.objects.filter(
                user=self.user, 
                is_active=True
            ).order_by('-played_at', '-submitted_at')
            
            if active_scores.count() > 5:
                # Identify and deactivate all scores beyond the latest 5.
                scores_to_deactivate = active_scores[5:]
                GolfScore.objects.filter(id__in=[s.id for s in scores_to_deactivate]).update(is_active=False)

    def __str__(self):
        return f"{self.user.email} - {self.score} ({'Active' if self.is_active else 'Inactive'})"
