from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Charity
from .serializers import CharitySerializer, SelectCharitySerializer
from apps.subscriptions.models import Donation
from apps.subscriptions.serializers import DonationSerializer

class CharityListView(generics.ListAPIView):
    """List all active charities"""
    serializer_class = CharitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Charity.objects.filter(is_active=True).order_by('name')
        category = self.request.query_params.get('category')
        if category:
            return queryset.filter(category=category)
        return queryset

class CharityDetailView(generics.RetrieveAPIView):
    """View details of a specific charity"""
    queryset = Charity.objects.filter(is_active=True)
    serializer_class = CharitySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class SelectCharityView(APIView):
    """Allows an authenticated user to select their chosen charity"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SelectCharitySerializer(data=request.data)
        if serializer.is_valid():
            charity_id = serializer.validated_data['charity_id']
            charity = get_object_or_404(Charity, id=charity_id, is_active=True)
            
            user = request.user
            user.selected_charity = charity
            user.save()
            
            return Response({'status': 'charity selected', 'charity_id': charity.id})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateDonationPercentageView(APIView):
    """Update donation percentage (minimum 10%)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        percentage = request.data.get('percentage')
        try:
            percentage = float(percentage)
            if percentage < 10.0:
                return Response(
                    {'error': 'Minimum donation percentage is 10%.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            if percentage > 100.0:
                return Response(
                    {'error': 'Maximum donation percentage is 100%.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            user = request.user
            user.donation_percentage = percentage
            user.save()
            return Response({'status': 'percentage updated', 'percentage': percentage})
            
        except (TypeError, ValueError):
            return Response({'error': 'Invalid percentage.'}, status=status.HTTP_400_BAD_REQUEST)

class CharityRegisterView(generics.CreateAPIView):
    """Public endpoint for charities to apply for partnership"""
    queryset = Charity.objects.all()
    serializer_class = CharitySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # All public applications are disabled by default until admin review
        charity = serializer.save(is_active=False)
        
        # Send Welcome Email if contact_email is provided
        if charity.contact_email:
            from apps.core.emails import send_charity_welcome_email
            send_charity_welcome_email.delay(charity.contact_email, charity.name)

class MyCharityProfileView(APIView):
    """Returns the charity profile managed by the authenticated user"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        charity = Charity.objects.filter(managed_by=request.user).first()
        if not charity:
            return Response(
                {"detail": "No charity profile linked to this account."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CharitySerializer(charity)
        return Response(serializer.data)

    def patch(self, request):
        charity = Charity.objects.filter(managed_by=request.user).first()
        if not charity:
            return Response(
                {"detail": "No charity profile linked to this account."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Explicitly handle logo removal if logo_image is sent as an empty string
        data = request.data.copy()
        if 'logo_image' in data and data['logo_image'] == '':
            charity.logo_image.delete(save=False)
            data['logo_image'] = None

        serializer = CharitySerializer(charity, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CharityDonationsView(generics.ListAPIView):
    """Returns all donations directed to the authenticated user's charity"""
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        charity = get_object_or_404(Charity, managed_by=self.request.user)
        return Donation.objects.filter(charity=charity).order_by('-timestamp')
