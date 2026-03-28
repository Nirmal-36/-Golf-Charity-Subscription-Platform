from rest_framework import serializers
from .models import DrawRound, DrawEntry, DrawWinner, AdminAuditLog

class AdminAuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the platform's immutable administrative audit trail.
    Tracks all privileged actions for security and compliance monitoring.
    """
    admin_email = serializers.EmailField(source='admin.email', read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = ['id', 'admin_email', 'action', 'resource_type', 'resource_id', 'timestamp', 'notes']
        read_only_fields = ['admin_email', 'timestamp']

class DrawRoundSerializer(serializers.ModelSerializer):
    """
    Data structure for Draw Round metadata.
    Provides visibility into prize pools, status, and published winning sequences.
    """
    class Meta:
        model = DrawRound
        fields = ['id', 'draw_date', 'status', 'total_pool', 'jackpot_amount', 'jackpot_rolled_over', 'winning_numbers', 'logic_type', 'is_published']
        read_only_fields = ['winning_numbers', 'status']

class DrawEntrySerializer(serializers.ModelSerializer):
    """
    Manages user entries and number selection validation.
    Enforces the 'Exactly 5 unique integers between 1-45' business rule.
    Dynamic status field links back to verification records for won entries.
    """
    draw_date = serializers.DateTimeField(source='draw.draw_date', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = DrawEntry
        fields = ['id', 'draw', 'draw_date', 'user', 'numbers', 'matches', 'tier_won', 'prize_amount', 'status']
        read_only_fields = ['user', 'matches', 'tier_won', 'prize_amount', 'draw', 'draw_date', 'status']

    def get_status(self, obj):
        """
        Retrieves the verification status if the entry is a winner.
        Defaults to 'pending_proof' if a win record exists but is unverified.
        """
        if not obj.tier_won:
            return None
        from .models import DrawWinner
        winner = DrawWinner.objects.filter(draw=obj.draw, user=obj.user).first()
        return winner.status if winner else 'pending_proof'

    def validate_numbers(self, value):
        """
        Rigorous validation for draw numbers.
        Ensures 5 distinct integers within the 1-45 Stableford-indexed range.
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Number selection must be provided as a list.")
        if len(value) != 5:
            raise serializers.ValidationError("Selection must contain exactly 5 numbers.")
        if len(set(value)) != 5:
            raise serializers.ValidationError("All selected numbers must be unique.")
        for num in value:
            if not isinstance(num, int) or num < 1 or num > 45:
                raise serializers.ValidationError("All numbers must be integers between 1 and 45.")
        return value

class DrawWinnerSerializer(serializers.ModelSerializer):
    """
    Official Winner Record Serializer.
    Exposes fields for proof submission and administrator verification status.
    Used for both the Winner Dashboard and the Admin Payout Queue.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    draw_date = serializers.DateTimeField(source='draw.draw_date', read_only=True)

    class Meta:
        model = DrawWinner
        fields = ['id', 'draw', 'draw_date', 'user_email', 'tier', 'prize_amount', 'status', 'proof_screenshot_url', 'proof_submitted_at', 'admin_approved_at', 'admin_notes']
        read_only_fields = ['user_email', 'draw_date', 'tier', 'prize_amount']
