from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import DrawWinner, DrawRound, DrawEntry, AdminAuditLog
from .serializers import DrawWinnerSerializer, DrawRoundSerializer, AdminAuditLogSerializer
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class AdminStatsView(APIView):
    """
    Returns platform-wide KPIs for the admin dashboard.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        active_subscribers = User.objects.filter(subscription_status='active').count()
        total_donated = User.objects.aggregate(Sum('total_donated'))['total_donated__sum'] or 0
        total_winners = DrawWinner.objects.count()
        pending_winners = DrawWinner.objects.filter(status='proof_submitted').count()

        return Response({
            "total_users": total_users,
            "active_subscribers": active_subscribers,
            "total_donated": total_donated,
            "total_winners": total_winners,
            "pending_winners": pending_winners,
            # Mock revenue calculation: $20 per active subscriber
            "monthly_revenue": active_subscribers * 20.00
        })

class AdminPendingWinnersView(generics.ListAPIView):
    """
    List winners who have submitted proof and are awaiting approval.
    """
    serializer_class = DrawWinnerSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return DrawWinner.objects.filter(status='proof_submitted').order_by('proof_submitted_at')

class AdminApproveWinnerView(APIView):
    """
    Approve or reject a winner's proof and log the action.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, winner_id):
        winner = get_object_or_404(DrawWinner, id=winner_id)
        action = request.data.get('action') # 'approve' or 'reject'
        notes = request.data.get('notes', '')

        if action == 'approve':
            winner.status = 'approved'
            winner.admin_approved_at = timezone.now()
        elif action == 'reject':
            winner.status = 'rejected'
        elif action == 'mark_paid':
            winner.status = 'paid'
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        winner.admin_notes = notes
        winner.save()

        # Notify winner on approval
        if action == 'approve':
            try:
                from apps.core.emails import send_winner_approval_notification
                send_winner_approval_notification.delay(winner.user.email, winner.draw.id, winner.prize_amount)
            except:
                pass

        # Record Audit Log
        AdminAuditLog.objects.create(
            admin=request.user,
            action=f"{action.capitalize()} Winner #{winner.id} ({winner.user.email})",
            resource_type="DrawWinner",
            resource_id=winner.id,
            notes=notes
        )
        
        return Response({"status": f"Winner {action}d successfully."})

class AdminPayoutsView(generics.ListAPIView):
    """
    List winners who are approved and waiting for payment, or already paid.
    """
    serializer_class = DrawWinnerSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return DrawWinner.objects.filter(status__in=['approved', 'paid']).order_by('-admin_approved_at')

class AdminAuditLogListView(generics.ListAPIView):
    """
    List all administrative audit logs.
    """
    serializer_class = AdminAuditLogSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = AdminAuditLog.objects.all().order_by('-timestamp')

class AdminUsersListView(generics.ListAPIView):
    """
    List all users with their subscription and donation data.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
