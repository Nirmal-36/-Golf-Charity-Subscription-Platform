from rest_framework import serializers
from .models import Charity

class CharitySerializer(serializers.ModelSerializer):
    managed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    supporter_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Charity
        fields = ('id', 'name', 'slug', 'description', 'logo_url', 'logo_image', 'category', 'contact_email', 'total_received', 'is_active', 'is_approved', 'managed_by', 'supporter_count')
        read_only_fields = ('id', 'slug', 'total_received', 'is_active', 'is_approved', 'managed_by', 'supporter_count')

    def get_supporter_count(self, obj):
        # Count users who have selected this charity
        from apps.accounts.models import User
        return User.objects.filter(selected_charity=obj, subscription_status='active').count()

class AdminCharitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Charity
        fields = '__all__'

class SelectCharitySerializer(serializers.Serializer):
    charity_id = serializers.IntegerField()
