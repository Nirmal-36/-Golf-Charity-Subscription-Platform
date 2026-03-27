from django.db import models

class Charity(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    logo_url = models.URLField(max_length=500, blank=True)
    logo_image = models.ImageField(upload_to='charities/logos/', blank=True, null=True)
    category = models.CharField(max_length=100)
    contact_email = models.EmailField(blank=True, null=True)
    total_received = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    managed_by = models.OneToOneField(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_charity'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
            
        if self.pk:
            old_instance = Charity.objects.get(pk=self.pk)
            if self.is_approved and not old_instance.is_approved:
                if self.managed_by and self.managed_by.email:
                    from apps.core.emails import send_charity_approval_email
                    send_charity_approval_email.delay(self.managed_by.email, self.name)
                    
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Charities"
