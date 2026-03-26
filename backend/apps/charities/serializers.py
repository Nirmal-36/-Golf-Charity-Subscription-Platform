from rest_framework import serializers
from .models import Charity

class CharitySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False)
    
    class Meta:
        model = Charity
        fields = ('id', 'name', 'slug', 'description', 'logo_url', 'category', 'total_received', 'is_active', 'is_approved')

class SelectCharitySerializer(serializers.Serializer):
    charity_id = serializers.IntegerField()
