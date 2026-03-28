from rest_framework import serializers
from .models import Charity, CharityImage, CharityEvent

class CharityImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharityImage
        fields = ('id', 'image', 'caption', 'is_banner')

class CharityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharityEvent
        fields = ('id', 'title', 'description', 'event_date', 'location', 'image', 'link_url')

class CharitySerializer(serializers.ModelSerializer):
    managed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    supporter_count = serializers.SerializerMethodField()
    images = CharityImageSerializer(many=True, read_only=True)
    events = CharityEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Charity
        fields = ('id', 'name', 'slug', 'description', 'logo_url', 'logo_image', 'category', 'contact_email', 'total_received', 'is_active', 'is_approved', 'managed_by', 'supporter_count', 'images', 'events')
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
