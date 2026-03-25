from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer

User = get_user_model()

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin-only view to retrieve, update, or delete any user.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'pk'

class AdminToggleUserStatusView(APIView):
    """
    Toggle a user's is_active status.
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
    Force reset a user's password to a temporary one or a provided one.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        new_password = request.data.get('password')
        
        if not new_password:
            return Response({"error": "New password is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"status": "Password reset successfully."})
