from django.urls import path
from .views import (
    CharityListView, 
    CharityDetailView, 
    SelectCharityView, 
    UpdateDonationPercentageView,
    CharityRegisterView,
    MyCharityProfileView,
    CharityDonationsView,
    OneTimeDonationView
)
from .admin_views import AdminCharityListCreateView, AdminCharityDetailView

urlpatterns = [
    path('', CharityListView.as_view(), name='charity_list'),
    path('my-profile/', MyCharityProfileView.as_view(), name='my_charity_profile'),
    path('select/', SelectCharityView.as_view(), name='charity_select'),
    path('donation-pct/', UpdateDonationPercentageView.as_view(), name='charity_donation_pct'),
    path('register/', CharityRegisterView.as_view(), name='charity_register'),
    path('donations/', CharityDonationsView.as_view(), name='charity_donations'),
    
    # Admin Charity Management
    path('admin/', AdminCharityListCreateView.as_view(), name='admin_charity_list_create'),
    path('admin/<int:pk>/', AdminCharityDetailView.as_view(), name='admin_charity_detail'),
    
    path('<slug:slug>/', CharityDetailView.as_view(), name='charity_detail'),
    path('<slug:slug>/donate/', OneTimeDonationView.as_view(), name='charity_one_time_donation'),
]
