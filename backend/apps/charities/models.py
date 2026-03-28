from django.db import models
from django.dispatch import receiver

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

class CharityImage(models.Model):
    charity = models.ForeignKey(Charity, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='charities/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    is_banner = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.charity.name}"

class CharityEvent(models.Model):
    charity = models.ForeignKey(Charity, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to='charities/events/', blank=True, null=True)
    link_url = models.URLField(blank=True, help_text="Link to external event page or registration")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.charity.name}"

    class Meta:
        ordering = ['event_date']
@receiver(models.signals.post_delete, sender=Charity)
def delete_associated_organization_user(sender, instance, **kwargs):
    """
    If a Charity is deleted, ensure the associated organization user is also deleted.
    """
    if instance.managed_by:
        try:
            instance.managed_by.delete()
        except Exception as e:
            print(f"Error deleting associated user for charity {instance.name}: {e}")
