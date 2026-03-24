from django.urls import path
from .views import CurrentDrawView, EnterDrawView, MyDrawHistoryView, DrawResultsView

urlpatterns = [
    path('current/', CurrentDrawView.as_view(), name='current-draw'),
    path('enter/', EnterDrawView.as_view(), name='enter-draw'),
    path('my-history/', MyDrawHistoryView.as_view(), name='my-draw-history'),
    path('<int:pk>/results/', DrawResultsView.as_view(), name='draw-results'),
]
