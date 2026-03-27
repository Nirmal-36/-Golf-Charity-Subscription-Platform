from rest_framework import generics, permissions
from .models import Charity
from .serializers import CharitySerializer, AdminCharitySerializer

class AdminCharityListCreateView(generics.ListCreateAPIView):
    """
    Admin-only view to list or create charities.
    """
    queryset = Charity.objects.all().order_by('name')
    serializer_class = AdminCharitySerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCharityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin-only view to retrieve, update, or delete any charity.
    """
    queryset = Charity.objects.all()
    serializer_class = AdminCharitySerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'pk'
