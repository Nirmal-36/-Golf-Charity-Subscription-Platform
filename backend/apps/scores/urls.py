from django.urls import path
from .views import ActiveScoreListView, ScoreHistoryListView, ScoreSubmitView

urlpatterns = [
    path('', ActiveScoreListView.as_view(), name='score_active_list'),
    path('history/', ScoreHistoryListView.as_view(), name='score_history_list'),
    path('add/', ScoreSubmitView.as_view(), name='score_submit'),
]
