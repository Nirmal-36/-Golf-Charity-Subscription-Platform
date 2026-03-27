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

        # Revenue calculation based on Phase 12 pricing ($9.99/mo, $99/yr)
        monthly_revenue = (
            User.objects.filter(subscription_status='active', subscription_plan='monthly').count() * 9.99 +
            User.objects.filter(subscription_status='active', subscription_plan='yearly').count() * 8.25 # $99 / 12
        )
        
        # 40% of revenue goes to Prize Pool
        total_prize_pool = float(monthly_revenue) * 0.40
        total_paid = DrawWinner.objects.filter(status='paid').aggregate(Sum('prize_amount'))['prize_amount__sum'] or 0
        prize_pool_balance = max(0, total_prize_pool - float(total_paid))

        # Analytics: Charity distribution (top 5)
        charity_stats = User.objects.exclude(selected_charity=None).values('selected_charity__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        # Analytics: Recent draw participation (last 5 rounds)
        draw_stats = DrawRound.objects.filter(status='completed').annotate(
            total_entries=Count('entries')
        ).order_by('-draw_date').values('draw_date', 'total_entries')[:5]

        return Response({
            "total_users": total_users,
            "active_subscribers": active_subscribers,
            "total_donated": total_donated,
            "total_winners": total_winners,
            "pending_winners": pending_winners,
            "monthly_revenue": monthly_revenue,
            "prize_pool_balance": prize_pool_balance,
            "charity_stats": charity_stats,
            "draw_stats": list(draw_stats)
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

class AdminDrawDetailView(generics.RetrieveUpdateAPIView):
    """
    View or edit a specific draw round (e.g., change date or jackpot).
    """
    queryset = DrawRound.objects.all()
    serializer_class = DrawRoundSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'pk'

class AdminManualDrawTriggerView(APIView):
    """
    Manually trigger the draw execution for a specific round.
    Supports is_dry_run (simulation) and custom logic_type.
    """
    permission_classes = [permissions.IsAdminUser]
 
    def post(self, request, pk):
        is_dry_run = request.data.get('is_dry_run', False)
        logic_type = request.data.get('logic_type')
        
        draw = get_object_or_404(DrawRound, pk=pk)
        
        # Only allow re-runs if it's a dry-run or if it's scheduled
        if not is_dry_run and draw.status != 'scheduled':
            return Response({"error": "Only scheduled draws can be officially executed."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .services import DrawService
            results = DrawService.execute_draw(draw.id, dry_run=is_dry_run, logic_type=logic_type)
            
            # Record Audit Log
            AdminAuditLog.objects.create(
                admin=request.user,
                action=f"{'Simulated' if is_dry_run else 'Manually Triggered'} Draw #{draw.id}",
                resource_type="DrawRound",
                resource_id=draw.id,
                notes=f"Logic: {results.get('logic_type')}. Winners found: {len(results.get('winners', []))}"
            )
            
            return Response({
                "status": f"Draw {'simulated' if is_dry_run else 'executed'} successfully.",
                "results": results
            })
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminPublishDrawView(APIView):
    """
    Formally publishes the results of a completed draw round.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        draw = get_object_or_404(DrawRound, pk=pk, status='completed')
        draw.is_published = True
        draw.save()

        # Audit Log
        AdminAuditLog.objects.create(
            admin=request.user,
            action=f"Published Draw Results #{draw.id}",
            resource_type="DrawRound",
            resource_id=draw.id
        )

        return Response({"status": "Results published successfully. Users can now view winners."})
class AdminPayWinnerView(APIView):
    """
    Simulates or executes a Stripe Payout for a winner.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, winner_id):
        winner = get_object_or_404(DrawWinner, id=winner_id, status='approved')
        
        # In production: 
        # stripe.Transfer.create(amount=int(winner.prize_amount * 100), currency="usd", destination=winner.user.stripe_connect_id)
        
        winner.status = 'paid'
        winner.save()

        # Audit Log
        AdminAuditLog.objects.create(
            admin=request.user,
            action=f"Processed Payout for Winner #{winner.id}",
            resource_type="DrawWinner",
            resource_id=winner.id,
            notes=f"Prize: ${winner.prize_amount} paid via system trigger."
        )

        return Response({"status": "Payout processed successfully."})

class AdminOverdueDrawCheckView(APIView):
    """
    Checks for and executes any overdue scheduled draws.
    Useful for local dev where Celery Beat might not be running.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from .tasks import execute_monthly_draw
        
        # Phase 29 Enhancement: Sync total_pool from live subscriber data
        # This ensures Match 3/4 pools are populated based on 40% of current active revenue
        draw = DrawRound.objects.filter(status='scheduled').order_by('draw_date').first()
        if draw:
            active_users = User.objects.filter(is_active=True, subscription_status='active')
            monthly_revenue = (
                active_users.filter(subscription_plan='monthly').count() * 9.99 +
                active_users.filter(subscription_plan='yearly').count() * 8.25 # $99 / 12
            )
            # Allocation is 40% of revenue
            pool_calculation = float(monthly_revenue) * 0.40
            draw.total_pool = pool_calculation
            draw.save()

        result = execute_monthly_draw() # Still checks for overdue draws
        return Response({
            "status": "Check completed", 
            "result": result,
            "synced_pool": pool_calculation if draw else 0
        })

class AdminDrawHistoryView(generics.ListAPIView):
    """
    List all past draw rounds (completed or running).
    """
    queryset = DrawRound.objects.filter(status__in=['completed', 'running']).order_by('-draw_date')
    serializer_class = DrawRoundSerializer
    permission_classes = [permissions.IsAdminUser]
