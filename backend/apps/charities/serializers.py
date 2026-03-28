from rest_framework import serializers
from .models import Charity, CharityImage, CharityEvent

class CharityImageSerializer(serializers.ModelSerializer):
    """
    Media Asset Serializer: Manages visual content for charity profiles.
    Used for both high-impact banners and supporting gallery images.
    """
    class Meta:
        model = CharityImage
        fields = ('id', 'image', 'caption', 'is_banner')

class CharityEventSerializer(serializers.ModelSerializer):
    """
    Engagement Serializer: Represents upcoming fundraising or community events.
    Enables charities to showcase their active impact on the platform.
    """
    class Meta:
        model = CharityEvent
        fields = ('id', 'title', 'description', 'event_date', 'location', 'image', 'link_url')

class CharitySerializer(serializers.ModelSerializer):
    """
    Primary Profile Serializer: Aggregates metadata, financial impact, 
    and community metrics for a Charity Partner.
    Includes nested imagery and event data for high-fidelity frontend rendering.
    """
    managed_by = serializers.PrimaryKeyRelatedField(read_only=True)
    supporter_count = serializers.SerializerMethodField()
    images = CharityImageSerializer(many=True, read_only=True)
    events = CharityEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Charity
        fields = ('id', 'name', 'slug', 'description', 'logo_url', 'logo_image', 'category', 'contact_email', 'total_received', 'is_active', 'is_approved', 'managed_by', 'supporter_count', 'images', 'events')
        read_only_fields = ('id', 'slug', 'total_received', 'is_active', 'is_approved', 'managed_by', 'supporter_count')

    def get_supporter_count(self, obj):
        """
        Dynamically calculates active platform support.
        Returns the count of authenticated members with an active subscription 
        who have selected this charity.
        """
        from apps.accounts.models import User
        return User.objects.filter(selected_charity=obj, subscription_status='active').count()

class AdminCharitySerializer(serializers.ModelSerializer):
    """
    Administrative Command Serializer: Exposes all internal fields, 
    including vetting status and administrative flags.
    """
    class Meta:
        model = Charity
        fields = '__all__'

class SelectCharitySerializer(serializers.Serializer):
    """
    Lightweight Payload Serializer: Used specifically for members to 
    update their philanthropic designation.
    """
    charity_id = serializers.IntegerField()
