from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer

User = get_user_model()

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Administrative interface for granular user management.
    Allows retrieval, modification, or removal of any user account by administrators.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'pk'

class AdminToggleUserStatusView(APIView):
    """
    Emergency Deactivation/Reactivation control for user accounts.
    Toggles the 'is_active' flag to immediately restrict or grant platform access.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        
        status_text = "activated" if user.is_active else "deactivated"
        return Response({
            "status": f"User {status_text} successfully.",
            "is_active": user.is_active
        })

class AdminPasswordResetView(APIView):
    """
    Administrative Override for account security.
    Allows designated administrators to manually force a password reset for a user.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        new_password = request.data.get('password')
        
        if not new_password:
            return Response({"error": "New password is required for override."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"status": "Administrative password reset completed successfully."})
