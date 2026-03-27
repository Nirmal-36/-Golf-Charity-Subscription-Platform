from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    selected_charity_name = serializers.SerializerMethodField()
    selected_charity_category = serializers.SerializerMethodField()
    selected_charity_logo = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'is_staff', 'is_active', 'user_role', 'subscription_status', 'subscription_plan', 
            'subscription_end_date', 'selected_charity', 'selected_charity_name',
            'selected_charity_category', 'selected_charity_logo',
            'donation_percentage', 'total_donated', 'last_login'
        )
        read_only_fields = (
            'subscription_status', 'subscription_plan', 'subscription_end_date',
            'total_donated', 'last_login', 'selected_charity_name', 'selected_charity_category', 'selected_charity_logo'
        )

    def get_selected_charity_name(self, obj):
        return obj.selected_charity.name if obj.selected_charity else None

    def get_selected_charity_category(self, obj):
        return obj.selected_charity.category if obj.selected_charity else None

    def get_selected_charity_logo(self, obj):
        if not obj.selected_charity:
            return None
        return obj.selected_charity.logo_image.url if obj.selected_charity.logo_image else obj.selected_charity.logo_url

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'first_name', 'last_name', 'user_role')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_role=validated_data.get('user_role', 'member')
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

from django.db import transaction
from apps.charities.models import Charity
from apps.core.emails import send_charity_welcome_email

class OrganizationRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    # Org Fields
    org_name = serializers.CharField(max_length=200, write_only=True)
    org_category = serializers.CharField(max_length=100, write_only=True)
    org_description = serializers.CharField(write_only=True)
    org_logo_url = serializers.URLField(required=False, allow_blank=True, write_only=True)

    def create(self, validated_data):
        with transaction.atomic():
            # Create User
            user = User.objects.create_user(
                email=validated_data['email'],
                username=validated_data['username'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                user_role='organization'
            )
            
            # Create linked Charity
            Charity.objects.create(
                name=validated_data['org_name'],
                category=validated_data['org_category'],
                description=validated_data['org_description'],
                logo_url=validated_data.get('org_logo_url', ''),
                contact_email=validated_data['email'],
                managed_by=user,
                is_active=True,
                is_approved=False
            )
            
            # Send Welcome Email
            send_charity_welcome_email.delay(user.email, validated_data['org_name'])
            
            return user
