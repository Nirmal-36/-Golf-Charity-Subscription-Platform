from django.contrib import admin
from .models import Donation

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'charity', 'amount', 'plan_type', 'timestamp')
    list_filter = ('plan_type', 'timestamp', 'charity')
    search_fields = ('user__email', 'charity__name', 'stripe_invoice_id')
    readonly_fields = ('timestamp',)

    def user_email(self, obj):
        return obj.user.email if obj.user else "Anonymous"
    user_email.short_description = "Donor Email"
