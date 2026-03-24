from django.db import models

class Charity(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    logo_url = models.URLField(blank=True)
    category = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    total_received = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Charities"
