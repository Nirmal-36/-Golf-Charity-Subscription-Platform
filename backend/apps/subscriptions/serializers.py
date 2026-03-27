from rest_framework import serializers
from .models import Donation

class DonationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Donation
        fields = ['id', 'user_email', 'amount', 'plan_type', 'timestamp', 'stripe_invoice_id']
