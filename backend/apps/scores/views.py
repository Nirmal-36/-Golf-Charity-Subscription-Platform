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
        return GolfScore.objects.filter(user=self.request.user, is_active=True).order_by('-played_at', '-submitted_at')

class ScoreHistoryListView(generics.ListAPIView):
    """List the full score history for the authenticated user"""
    serializer_class = GolfScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GolfScore.objects.filter(user=self.request.user).order_by('-played_at', '-submitted_at')

class ScoreSubmitView(APIView):
    """Submit a new score. Requires active subscription."""
    permission_classes = [IsActiveSubscriber]

    def post(self, request):
        serializer = ScoreSubmitSerializer(data=request.data)
        if serializer.is_valid():
            score_value = serializer.validated_data['score']
            played_at = serializer.validated_data.get('played_at')
            new_score = add_score(request.user, score_value, played_at=played_at)
            return Response(
                GolfScoreSerializer(new_score).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ScoreDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific score. Owner only."""
    serializer_class = GolfScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GolfScore.objects.filter(user=self.request.user)

class AdminUserScoresView(generics.ListAPIView):
    """Admin: list all scores for a specific user, with optional edit."""
    serializer_class = GolfScoreSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return GolfScore.objects.filter(user_id=user_id).order_by('-played_at', '-submitted_at')

class AdminScoreDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: retrieve, update or delete any score."""
    serializer_class = GolfScoreSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = GolfScore.objects.all()
