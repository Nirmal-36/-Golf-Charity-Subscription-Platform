from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import DrawWinner, DrawRound
from .serializers import DrawWinnerSerializer
from apps.core.storage import storage_client
from apps.core.emails import send_admin_proof_notification

class UploadProofView(APIView):
    """
    Allow winners to upload scorecard proof to claims their prize.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, winner_id):
        winner = get_object_or_404(DrawWinner, id=winner_id, user=request.user)
        
        if 'proof' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        file = request.FILES['proof']
        file_ext = file.name.split('.')[-1]
        filename = f"winner_proofs/{winner.draw.id}/{winner.user.id}_{int(timezone.now().timestamp())}.{file_ext}"
        
        # Upload to Supabase
        public_url = storage_client.upload_file(
            bucket="winner-proofs",
            path=filename,
            file_data=file.read()
        )
        
        if not public_url:
            return Response({"error": "Failed to upload to storage"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        winner.proof_screenshot_url = public_url
        winner.status = 'proof_submitted'
        winner.proof_submitted_at = timezone.now()
        winner.save()
        
        # Notify admin (Async)
        try:
            from apps.core.emails import send_admin_proof_notification
            send_admin_proof_notification.delay(winner.user.email, winner.draw.id)
        except Exception as e:
            print(f"Error sending admin notification: {e}")
        
        return Response(
            {"detail": "Proof uploaded successfully. Admin will review it."},
            status=status.HTTP_200_OK
        )

class MyWinsView(generics.ListAPIView):
    """
    List all wins for the logged in user.
    """
    serializer_class = DrawWinnerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DrawWinner.objects.filter(user=self.request.user).order_by('-draw__draw_date')
