from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

class GolfScore(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scores')
    score = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(45)]
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.email} - {self.score}"
