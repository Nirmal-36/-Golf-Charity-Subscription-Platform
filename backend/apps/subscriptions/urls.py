from django.urls import path
from .views import CreateCheckoutSessionView, StripeWebhookView, CreatePortalSessionView, SubscriptionHistoryView

urlpatterns = [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('create-portal-session/', CreatePortalSessionView.as_view(), name='create-portal-session'),
    path('history/', SubscriptionHistoryView.as_view(), name='subscription-history'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
