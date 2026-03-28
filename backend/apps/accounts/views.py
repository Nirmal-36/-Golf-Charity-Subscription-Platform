from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    OrganizationRegisterSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class OrganizationRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = OrganizationRegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

import random
import logging
from .models import PasswordResetOTP
from apps.core.emails import send_otp_email

logger = logging.getLogger(__name__)

def send_otp_resilient(email, otp_code, purpose):
    """
    Attempts to send OTP via Celery, falls back to sync if broker is down.
    """
    try:
        send_otp_email.delay(email, otp_code, purpose)
    except Exception as e:
        logger.warning(f"Celery failed to queue OTP email: {e}. Falling back to synchronous send.")
        send_otp_email(email, otp_code, purpose)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class RequestOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        purpose = request.data.get('purpose', 'password reset')
        try:
            user = User.objects.get(email=email)
            # If authenticated and changing, ensure emails match
            if request.user.is_authenticated and request.user.email != email:
                 return Response({"detail": "Email mismatch."}, status=status.HTTP_400_BAD_REQUEST)
                 
            otp_code = ''.join(random.choices('0123456789', k=6))
            PasswordResetOTP.objects.create(user=user, otp=otp_code)
            send_otp_resilient(user.email, otp_code, purpose)
            return Response({"detail": f"Verification code sent to {email}."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "No account found with this email address."}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not all([email, otp_code, new_password]):
            return Response({"detail": "Please provide email, code, and new password."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp_code, is_used=False).latest('created_at')
            
            if otp_obj.is_expired():
                return Response({"detail": "Verification code has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(new_password)
            user.save()
            otp_obj.is_used = True
            otp_obj.save()
            return Response({"detail": "Password updated successfully. You can now log in."}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({"detail": "Invalid verification code or email."}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(generics.GenericAPIView):
    """
    Authenticated view for users to change their password while logged in.
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        user = request.user
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not all([otp_code, new_password]):
            return Response({"detail": "Please provide verification code and new password."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp_code, is_used=False).latest('created_at')
            if otp_obj.is_expired():
                return Response({"detail": "Verification code has expired."}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(new_password)
            user.save()
            otp_obj.is_used = True
            otp_obj.save()
            return Response({"detail": "Your password has been changed successfully."}, status=status.HTTP_200_OK)
        except PasswordResetOTP.DoesNotExist:
            return Response({"detail": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)
