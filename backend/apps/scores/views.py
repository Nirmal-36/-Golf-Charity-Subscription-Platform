from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.permissions import IsActiveSubscriber
from .models import GolfScore
from .serializers import GolfScoreSerializer, ScoreSubmitSerializer
from .services import add_score

class ActiveScoreListView(generics.ListAPIView):
    """List the 5 currently active scores for the authenticated user"""
    serializer_class = GolfScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GolfScore.objects.filter(user=self.request.user, is_active=True).order_by('-submitted_at')

class ScoreHistoryListView(generics.ListAPIView):
    """List the full score history for the authenticated user"""
    serializer_class = GolfScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GolfScore.objects.filter(user=self.request.user).order_by('-submitted_at')

class ScoreSubmitView(APIView):
    """Submit a new score. Requires active subscription."""
    permission_classes = [IsActiveSubscriber]

    def post(self, request):
        serializer = ScoreSubmitSerializer(data=request.data)
        if serializer.is_valid():
            score_value = serializer.validated_data['score']
            new_score = add_score(request.user, score_value)
            return Response(
                GolfScoreSerializer(new_score).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
