from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Comprehensive User Serializer for profile management.
    Includes flattened read-only fields for selected charity metadata 
    to simplify frontend consumption.
    """
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
            'total_donated', 'last_login', 'selected_charity_name', 
            'selected_charity_category', 'selected_charity_logo'
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
    """
    Standard Member Registration Serializer.
    Enforces minimum password security and requires an initial charity selection.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    selected_charity_id = serializers.IntegerField(required=True, write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'first_name', 'last_name', 'user_role', 'selected_charity_id')

    def create(self, validated_data):
        selected_charity_id = validated_data.pop('selected_charity_id')
        charity = Charity.objects.get(id=selected_charity_id)
        
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_role=validated_data.get('user_role', 'member'),
            selected_charity=charity
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Enhanced JWT Serializer providing granular error feedback for login failures.
    Distinguishes between deactivated accounts, missing accounts, and incorrect credentials.
    Includes full user profile data in the successful response payload.
    """
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get('password')
        
        try:
            user = User.objects.get(**{self.username_field: username})
            if not user.is_active:
                raise serializers.ValidationError({
                    "detail": "Your account has been deactivated. Please contact administration."
                })
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "detail": "No account found with this email address. Please register to join the club."
            })

        try:
            data = super().validate(attrs)
        except Exception:
            raise serializers.ValidationError({
                "detail": "Incorrect password. Please verify your credentials or reset your password."
            })

        # Embed serialized user data in the response
        data['user'] = UserSerializer(self.user).data
        return data

class OrganizationRegisterSerializer(serializers.Serializer):
    """
    Dual-Creation Serializer for Charity Partners.
    Atomically creates both the administrative User account and the linked Charity profile.
    Triggers the initial SendGrid welcome sequence upon successful registration.
    """
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already registered.")
        return value
    
    # Organization Metadata
    org_name = serializers.CharField(max_length=200, write_only=True)
    org_category = serializers.CharField(max_length=100, write_only=True)
    org_description = serializers.CharField(write_only=True)
    org_logo_url = serializers.URLField(required=False, allow_blank=True, write_only=True)

    def create(self, validated_data):
        with transaction.atomic():
            # Step 1: Initialize User Account
            user = User.objects.create_user(
                email=validated_data['email'],
                username=validated_data['username'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                user_role='organization'
            )
            
            # Step 2: Initialize linked Charity Profile
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
            
            # Step 3: Trigger Welcome Notification
            send_charity_welcome_email.delay(user.email, validated_data['org_name'])
            
            return user
