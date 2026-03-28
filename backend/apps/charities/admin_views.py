from rest_framework import generics, permissions
from .models import Charity
from .serializers import CharitySerializer, AdminCharitySerializer

class AdminCharityListCreateView(generics.ListCreateAPIView):
    """
    Administrative Charity Ledger: Allows designated administrators to 
    list, filter, and manually onboard new Charity Partners.
    """
    queryset = Charity.objects.all().order_by('name')
    serializer_class = AdminCharitySerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCharityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vetting & Lifecycle Interface: Provides full administrative control 
    over a specific charity profile.
    Used for approval/deactivation workflows and granular metadata adjustments.
    """
    queryset = Charity.objects.all()
    serializer_class = AdminCharitySerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'pk'
