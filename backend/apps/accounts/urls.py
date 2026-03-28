from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, 
    OrganizationRegisterView, 
    CustomTokenObtainPairView, 
    UserProfileView,
    RequestOTPView,
    ResetPasswordOTPView,
    ChangePasswordView
)
from .admin_views import AdminUserDetailView, AdminToggleUserStatusView, AdminPasswordResetView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('register/organization/', OrganizationRegisterView.as_view(), name='auth_register_organization'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    
    # Password Management (OTP)
    path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
    path('reset-password-otp/', ResetPasswordOTPView.as_view(), name='reset_password_otp'),
    path('change-password-otp/', ChangePasswordView.as_view(), name='change_password_otp'),
    
    # Admin User Management
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:pk>/toggle-status/', AdminToggleUserStatusView.as_view(), name='admin_user_toggle_status'),
    path('admin/users/<int:pk>/reset-password/', AdminPasswordResetView.as_view(), name='admin_user_reset_password'),
]
