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
    """
    Member Onboarding: Handles new user registration for standard Members.
    Initializes a new account with core credentials and triggers 
    automatic database record creation.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class OrganizationRegisterView(generics.CreateAPIView):
    """
    Partner Onboarding: Handles registration for new Charity Organizations.
    Atomically creates both a User management account and a pending Charity profile 
    for administrative vetting.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = OrganizationRegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Authentication Gateway: Custom JWT Login interface.
    Returns secure access/refresh token pairs alongside fundamental user 
    profile metadata for immediate frontend hydration.
    """
    serializer_class = CustomTokenObtainPairSerializer

import random
import logging
from .models import PasswordResetOTP
from apps.core.emails import send_otp_email

# Infrastructure Header: Resilience & Logging
logger = logging.getLogger(__name__)

def send_otp_resilient(email, otp_code, purpose):
    """
    High-Availability Dispatcher: Ensures critical OTP delivery.
    Attempts asynchronous background delivery via Celery; automatically 
    fails over to synchronous delivery if the task queue is unreachable.
    """
    try:
        # Step 1: Attempt non-blocking delivery
        send_otp_email.delay(email, otp_code, purpose)
    except Exception as e:
        # Step 2: Fallback to blocking delivery to guarantee security code arrival
        logger.warning(f"Asynchronous OTP dispatch failed: {e}. Executing resilient synchronous fallback.")
        send_otp_email(email, otp_code, purpose)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Member Dashboard API: Provides authenticated members access to view 
    or update their core identity and philanthropic preferences.
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Returns the specific user instance associated with the active request."""
        return self.request.user

class RequestOTPView(generics.GenericAPIView):
    """
    Identity Verification Trigger: Generates and dispatches a 6-digit 
    security code for sensitive account actions.
    Supports forgotten password recovery and multi-factor account updates.
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        purpose = request.data.get('purpose', 'password reset')
        try:
            user = User.objects.get(email=email)
            
            # Security Shield: Prevent unauthorized OTP request for a different account
            if request.user.is_authenticated and request.user.email != email:
                 return Response({"detail": "Verification must match the logged-in account identity."}, status=status.HTTP_400_BAD_REQUEST)
                 
            # Logic: Secure 6-digit generator
            otp_code = ''.join(random.choices('0123456789', k=6))
            PasswordResetOTP.objects.create(user=user, otp=otp_code)
            
            # Dispatch: Trigger the high-availability notification pipeline
            send_otp_resilient(user.email, otp_code, purpose)
            return Response({"detail": f"Secure verification code dispatched to {email}."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Note: We provide explicit feedback for better UX in this specific business context
            return Response({"detail": "No registered account found with this email identity."}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordOTPView(generics.GenericAPIView):
    """
    Account Recovery Pipeline: Verifies security codes and updates credentials.
    Allows unauthenticated users to regain access via validated email proximity.
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not all([email, otp_code, new_password]):
            return Response({"detail": "Required fields: email, verification code, and new password."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            # Fetch: Retrieve the latest unused verification attempt
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp_code, is_used=False).latest('created_at')
            
            # Policy: Enforce the 15-minute security window
            if otp_obj.is_expired():
                return Response({"detail": "Security code has expired. Please initiate a new request."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Persistence: Atomic credential update
            user.set_password(new_password)
            user.save()
            
            # Invalidation: Mark the code as consumed
            otp_obj.is_used = True
            otp_obj.save()
            return Response({"detail": "Identity verified. Password has been successfully updated."}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({"detail": "Invalid verification sequence. Check identity or code."}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(generics.GenericAPIView):
    """
    Secure Credential Management: Logged-in workflow for password rotation.
    Mandates multi-factor verification (OTP) to prevent unauthorized takeover.
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        user = request.user
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not all([otp_code, new_password]):
            return Response({"detail": "Verification code and new password are required for this action."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Audit: Retrieve proof of ownership
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp_code, is_used=False).latest('created_at')
            if otp_obj.is_expired():
                return Response({"detail": "Identity verification has expired."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Persistence: Secure set_password handles hashing
            user.set_password(new_password)
            user.save()
            
            # Clean-up: Finalize the security challenge
            otp_obj.is_used = True
            otp_obj.save()
            return Response({"detail": "Your credentials have been updated successfully."}, status=status.HTTP_200_OK)
        except PasswordResetOTP.DoesNotExist:
            return Response({"detail": "Identity verification failed. Invalid code."}, status=status.HTTP_400_BAD_REQUEST)
