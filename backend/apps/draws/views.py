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
    Returns the currently scheduled draw, or creates one if none exists.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        draw = DrawRound.objects.filter(status='scheduled').order_by('draw_date').first()
        if not draw:
            # For development safety, create a mock draw at the end of the current month
            import datetime
            import calendar
            now = timezone.now()
            last_day = calendar.monthrange(now.year, now.month)[1]
            end_of_month = now.replace(day=last_day, hour=12, minute=0, second=0, microsecond=0)
            if now > end_of_month:
                # push to next month
                end_of_month = end_of_month + datetime.timedelta(days=30)
                
            draw = DrawRound.objects.create(draw_date=end_of_month)
            
        serializer = DrawRoundSerializer(draw)
        
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
    Submit 5 numbers for the current draw.
    """
    serializer_class = DrawEntrySerializer
    permission_classes = [IsActiveSubscriber]

    def perform_create(self, serializer):
        draw_id = self.request.data.get('draw_id')
        draw = get_object_or_404(DrawRound, id=draw_id, status='scheduled')

        if DrawEntry.objects.filter(draw=draw, user=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already entered this draw.")

        serializer.save(user=self.request.user, draw=draw)

class MyDrawHistoryView(generics.ListAPIView):
    """
    List past entries for the logged in user.
    """
    serializer_class = DrawEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DrawEntry.objects.filter(user=self.request.user).order_by('-draw__draw_date')

class DrawResultsView(generics.RetrieveAPIView):
    """
    View the winning numbers and winners for a specific draw.
    """
    queryset = DrawRound.objects.filter(status='completed')
    serializer_class = DrawRoundSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        winners = DrawWinner.objects.filter(draw=instance).order_by('tier')
        winner_serializer = DrawWinnerSerializer(winners, many=True)
        
        data = serializer.data
        data['winners'] = winner_serializer.data
        return Response(data)
