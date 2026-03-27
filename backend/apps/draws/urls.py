from django.urls import path
from .views import CurrentDrawView, EnterDrawView, MyDrawHistoryView, DrawResultsView
from .winner_views import UploadProofView, MyWinsView
from .admin_views import (
    AdminStatsView, AdminPendingWinnersView, AdminApproveWinnerView, 
    AdminUsersListView, AdminPayoutsView, AdminAuditLogListView,
    AdminDrawDetailView, AdminManualDrawTriggerView, AdminPayWinnerView
)

urlpatterns = [
    path('current/', CurrentDrawView.as_view(), name='current-draw'),
    path('enter/', EnterDrawView.as_view(), name='enter-draw'),
    path('my-history/', MyDrawHistoryView.as_view(), name='my-draw-history'),
    path('<int:pk>/results/', DrawResultsView.as_view(), name='draw-results'),
    
    # Winners
    path('my-wins/', MyWinsView.as_view(), name='my-wins'),
    path('wins/<int:winner_id>/upload-proof/', UploadProofView.as_view(), name='upload-proof'),
    
    # Admin Endpoints
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/pending-winners/', AdminPendingWinnersView.as_view(), name='admin-pending-winners'),
    path('admin/winners/<int:winner_id>/review/', AdminApproveWinnerView.as_view(), name='admin-approve-winner'),
    path('admin/winners/<int:winner_id>/pay/', AdminPayWinnerView.as_view(), name='admin-pay-winner'),
    path('admin/users/', AdminUsersListView.as_view(), name='admin-users-list'),
    path('admin/payouts/', AdminPayoutsView.as_view(), name='admin-payouts'),
    path('admin/audit-logs/', AdminAuditLogListView.as_view(), name='admin-audit-logs'),
    path('admin/draws/<int:pk>/', AdminDrawDetailView.as_view(), name='admin-draw-detail'),
    path('admin/draws/<int:pk>/trigger/', AdminManualDrawTriggerView.as_view(), name='admin-draw-trigger'),
]
