from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'email', 'username', 'subscription_status', 
        'subscription_plan', 'selected_charity', 'total_donated'
    )
    list_filter = ('subscription_status', 'subscription_plan', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Subscription Data', {
            'fields': (
                'stripe_customer_id', 'subscription_status', 
                'subscription_plan', 'subscription_end_date'
            )
        }),
        ('Charity & Donations', {
            'fields': (
                'selected_charity', 'donation_percentage', 'total_donated'
            )
        }),
    )
