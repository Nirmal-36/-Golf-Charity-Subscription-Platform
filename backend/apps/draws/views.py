from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import DrawRound, DrawEntry, DrawWinner
from .serializers import DrawRoundSerializer, DrawEntrySerializer, DrawWinnerSerializer
from apps.accounts.permissions import IsActiveSubscriber

class CurrentDrawView(APIView):
    """
    Retrieves the active/scheduled Draw Round for the platform.
    Includes automated fail-safe to initialize a monthly draw if none is scheduled.
    Decorates the response with the authenticated user's entry status and number selection.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        draw = DrawRound.objects.filter(status='scheduled').order_by('draw_date').first()
        if not draw:
            # Platform Safeguard: Ensure a draw is always available for participation.
            # Initializes a draw for the final day of the current month.
            import datetime
            import calendar
            now = timezone.now()
            last_day = calendar.monthrange(now.year, now.month)[1]
            end_of_month = now.replace(day=last_day, hour=12, minute=0, second=0, microsecond=0)
            if now > end_of_month:
                end_of_month = end_of_month + datetime.timedelta(days=30)
                
            draw = DrawRound.objects.create(draw_date=end_of_month)
            
        serializer = DrawRoundSerializer(draw)
        
        # Identity Context: Check if the current user is already an entrant
        user_entered = False
        user_numbers = None
        if request.user.is_authenticated:
            entry = DrawEntry.objects.filter(draw=draw, user=request.user).first()
            if entry:
                user_entered = True
                user_numbers = entry.numbers
            
        data = serializer.data
        data['user_has_entered'] = user_entered
        data['user_numbers'] = user_numbers
        return Response(data)

class EnterDrawView(generics.CreateAPIView):
    """
    Official Entry Point for Draw Participation.
    Requires an active, paid subscription via the IsActiveSubscriber guard.
    Enforces a strict 'One Entry Per User' policy per draw round.
    """
    serializer_class = DrawEntrySerializer
    permission_classes = [IsActiveSubscriber]

    def perform_create(self, serializer):
        draw_id = self.request.data.get('draw_id')
        draw = get_object_or_404(DrawRound, id=draw_id, status='scheduled')

        # Idempotency Check: Prevent duplicate entries
        if DrawEntry.objects.filter(draw=draw, user=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already recorded an entry for this draw round.")

        serializer.save(user=self.request.user, draw=draw)

class MyDrawHistoryView(generics.ListAPIView):
    """
    Member Archive: Displays historical entries and match results for the authenticated user.
    Ordered chronologically by draw date.
    """
    serializer_class = DrawEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DrawEntry.objects.filter(user=self.request.user).order_by('-draw__draw_date')

class DrawResultsView(generics.RetrieveAPIView):
    """
    Public Results Portal: Displays winning numbers and the official winners list.
    Access restricted to rounds that are formally completed and published.
    """
    queryset = DrawRound.objects.filter(status='completed', is_published=True)
    serializer_class = DrawRoundSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Include list of formal winners for transparency
        winners = DrawWinner.objects.filter(draw=instance).order_by('tier')
        winner_serializer = DrawWinnerSerializer(winners, many=True)
        
        data = serializer.data
        data['winners'] = winner_serializer.data
        return Response(data)
