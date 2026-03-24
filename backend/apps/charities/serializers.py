from rest_framework import serializers
from .models import Charity

class CharitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Charity
        fields = ('id', 'name', 'slug', 'description', 'logo_url', 'category', 'total_received', 'is_active')

class SelectCharitySerializer(serializers.Serializer):
    charity_id = serializers.IntegerField()
