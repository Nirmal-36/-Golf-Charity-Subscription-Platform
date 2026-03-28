from django.urls import path
from .views import ActiveScoreListView, ScoreHistoryListView, ScoreSubmitView, ScoreDetailView, AdminUserScoresView, AdminScoreDetailView

urlpatterns = [
    path('', ActiveScoreListView.as_view(), name='score_active_list'),
    path('history/', ScoreHistoryListView.as_view(), name='score_history_list'),
    path('add/', ScoreSubmitView.as_view(), name='score_submit'),
    path('<int:pk>/', ScoreDetailView.as_view(), name='score_detail'),
    # Admin endpoints
    path('admin/user/<int:user_id>/', AdminUserScoresView.as_view(), name='admin_user_scores'),
    path('admin/<int:pk>/', AdminScoreDetailView.as_view(), name='admin_score_detail'),
]

