from django.urls import path
from .views import (
    CharityListView, 
    CharityDetailView, 
    SelectCharityView, 
    UpdateDonationPercentageView
)

urlpatterns = [
    path('', CharityListView.as_view(), name='charity_list'),
    path('select/', SelectCharityView.as_view(), name='charity_select'),
    path('donation-pct/', UpdateDonationPercentageView.as_view(), name='charity_donation_pct'),
    path('<slug:slug>/', CharityDetailView.as_view(), name='charity_detail'),  # Put slug last so it doesn't catch 'select' or 'donation-pct'
]
