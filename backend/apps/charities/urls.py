from django.urls import path
from .views import (
    CharityListView, 
    CharityDetailView, 
    SelectCharityView, 
    UpdateDonationPercentageView,
    CharityRegisterView
)
from .admin_views import AdminCharityListCreateView, AdminCharityDetailView

urlpatterns = [
    path('', CharityListView.as_view(), name='charity_list'),
    path('select/', SelectCharityView.as_view(), name='charity_select'),
    path('donation-pct/', UpdateDonationPercentageView.as_view(), name='charity_donation_pct'),
    path('register/', CharityRegisterView.as_view(), name='charity_register'),
    
    # Admin Charity Management
    path('admin/', AdminCharityListCreateView.as_view(), name='admin_charity_list_create'),
    path('admin/<int:pk>/', AdminCharityDetailView.as_view(), name='admin_charity_detail'),
    
    path('<slug:slug>/', CharityDetailView.as_view(), name='charity_detail'),
]
