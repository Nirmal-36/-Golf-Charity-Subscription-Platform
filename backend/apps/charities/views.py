from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Charity
from .serializers import CharitySerializer, SelectCharitySerializer
from apps.subscriptions.models import Donation
from apps.subscriptions.serializers import DonationSerializer

class CharityListView(generics.ListAPIView):
    """
    Public Charity Directory: Returns a list of all vetted and active Charity Partners.
    Supports optional filtering by category for streamlined exploration.
    """
    serializer_class = CharitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Charity.objects.filter(is_active=True).order_by('name')
        category = self.request.query_params.get('category')
        if category:
            return queryset.filter(category=category)
        return queryset

class CharityDetailView(generics.RetrieveAPIView):
    """
    Profile Insight: Provides comprehensive details, impact stories, and 
    media for a specific Charity Partner identified by its slug.
    """
    queryset = Charity.objects.filter(is_active=True)
    serializer_class = CharitySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class SelectCharityView(APIView):
    """
    Identity Personalization: Allows authenticated members to designate a 
    specific Charity Partner as the primary recipient of their subscription donations.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SelectCharitySerializer(data=request.data)
        if serializer.is_valid():
            charity_id = serializer.validated_data['charity_id']
            charity = get_object_or_404(Charity, id=charity_id, is_active=True)
            
            user = request.user
            user.selected_charity = charity
            user.save()
            
            return Response({'status': 'Target charity updated successfully.', 'charity_id': charity.id})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateDonationPercentageView(APIView):
    """
    Philanthropic Tuning: Allows members to adjust the percentage of their 
    subscription fee directed to their selected charity.
    Enforces a platform-wide minimum of 10% for baseline impact.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        percentage = request.data.get('percentage')
        try:
            percentage = float(percentage)
            if percentage < 10.0:
                return Response(
                    {'error': 'A minimum donation of 10% is required for platform sustainability.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            if percentage > 100.0:
                return Response({'error': 'Donation percentage cannot exceed 100%.'}, status=status.HTTP_400_BAD_REQUEST)
                
            user = request.user
            user.donation_percentage = percentage
            user.save()
            return Response({'status': 'Donation preference updated.', 'percentage': percentage})
            
        except (TypeError, ValueError):
            return Response({'error': 'Invalid percentage value provided.'}, status=status.HTTP_400_BAD_REQUEST)

class CharityRegisterView(generics.CreateAPIView):
    """
    Partnership Application: Public endpoint for non-profits to apply for platform inclusion.
    Profiles are initialized in an 'Inactive' state pending administrative vetting.
    Triggers an automated application receipt email.
    """
    queryset = Charity.objects.all()
    serializer_class = CharitySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        charity = serializer.save(is_active=False)
        
        if charity.contact_email:
            from apps.core.emails import send_charity_welcome_email
            send_charity_welcome_email.delay(charity.contact_email, charity.name)

class MyCharityProfileView(APIView):
    """
    Partner Dashboard: Allows authenticated Charity Partners to manage their public-facing 
    profile, update narrative descriptions, and moderate visual assets.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        charity = Charity.objects.filter(managed_by=request.user).first()
        if not charity:
            return Response(
                {"detail": "No charity partner profile is currently linked to this account."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CharitySerializer(charity)
        return Response(serializer.data)

    def patch(self, request):
        charity = Charity.objects.filter(managed_by=request.user).first()
        if not charity:
            return Response(
                {"detail": "No charity partner profile identified for update."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Identity Logic: Handle explicit asset removal or partial updates.
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
    """
    Partner Audit: Returns a historical ledger of all donations specifically 
    directed to the authenticated partner's organization.
    """
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        charity = get_object_or_404(Charity, managed_by=self.request.user)
        return Donation.objects.filter(charity=charity).order_by('-timestamp')

class OneTimeDonationView(APIView):
    """
    Public Philanthropy: Standardized entry point for one-time Stripe donations.
    Handles Stripe Checkout session initialization for both authenticated 
    members and anonymous public donors.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        charity = get_object_or_404(Charity, slug=slug, is_active=True)
        amount = request.data.get('amount')
        success_url = request.data.get('success_url', 'http://localhost:5173/donation/success')
        cancel_url = request.data.get('cancel_url', f'http://localhost:5173/charity/{slug}')
        
        if not amount or float(amount) <= 0:
            return Response({'error': 'A valid donation amount is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from apps.subscriptions.services import create_one_time_donation_session
            # Priority: Use authenticated email if available, otherwise use provided input
            customer_email = request.user.email if request.user.is_authenticated else request.data.get('email')
            
            session = create_one_time_donation_session(
                charity=charity,
                amount=amount,
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=customer_email
            )
            return Response({'checkout_url': session.url})
        except Exception as e:
            return Response({'error': f"Stripe Session Initialization Failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
