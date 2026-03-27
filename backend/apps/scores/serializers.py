from rest_framework import serializers
from .models import GolfScore

class GolfScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = GolfScore
        fields = ('id', 'score', 'played_at', 'submitted_at', 'is_active')
        read_only_fields = ('id', 'submitted_at', 'is_active')

class ScoreSubmitSerializer(serializers.Serializer):
    score = serializers.IntegerField(min_value=1, max_value=45)
    played_at = serializers.DateField(required=False)
