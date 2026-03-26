from rest_framework import serializers
from .models import DrawRound, DrawEntry, DrawWinner, AdminAuditLog

class AdminAuditLogSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(source='admin.email', read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = ['id', 'admin_email', 'action', 'resource_type', 'resource_id', 'timestamp', 'notes']
        read_only_fields = ['admin_email', 'timestamp']

class DrawRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawRound
        fields = ['id', 'draw_date', 'status', 'total_pool', 'jackpot_amount', 'jackpot_rolled_over', 'winning_numbers']
        read_only_fields = ['jackpot_amount', 'winning_numbers', 'status']

class DrawEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawEntry
        fields = ['id', 'draw', 'user', 'numbers', 'matches', 'tier_won', 'prize_amount']
        read_only_fields = ['user', 'matches', 'tier_won', 'prize_amount', 'draw']

    def validate_numbers(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Numbers must be a list.")
        if len(value) != 5:
            raise serializers.ValidationError("You must select exactly 5 numbers.")
        if len(set(value)) != 5:
            raise serializers.ValidationError("Numbers must be unique.")
        for num in value:
            if not isinstance(num, int) or num < 1 or num > 45:
                raise serializers.ValidationError("Numbers must be integers between 1 and 45.")
        return value

class DrawWinnerSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = DrawWinner
        fields = ['id', 'draw', 'user_email', 'tier', 'prize_amount', 'status', 'proof_submitted_at']
        read_only_fields = ['user_email', 'tier', 'prize_amount']
