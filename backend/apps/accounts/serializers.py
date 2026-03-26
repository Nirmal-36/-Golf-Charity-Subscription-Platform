from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    selected_charity_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'is_staff', 'is_active', 'subscription_status', 'subscription_plan', 
            'subscription_end_date', 'selected_charity', 'selected_charity_name',
            'donation_percentage', 'total_donated', 'last_login'
        )
        read_only_fields = (
            'subscription_status', 'subscription_plan', 'subscription_end_date',
            'total_donated', 'last_login', 'selected_charity_name'
        )

    def get_selected_charity_name(self, obj):
        return obj.selected_charity.name if obj.selected_charity else None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Pre-check for deactivated accounts to provide a better error message
        username = attrs.get(self.username_field)
        try:
            user = User.objects.get(**{self.username_field: username})
            if not user.is_active:
                raise serializers.ValidationError({
                    "detail": "Your account has been deactivated by an administrator. Please contact support."
                })
        except User.DoesNotExist:
            pass # Standard TokenObtainPairSerializer will handle non-existent users

        data = super().validate(attrs)
        # Add extra user info to the payload
        data['user'] = UserSerializer(self.user).data
        return data
