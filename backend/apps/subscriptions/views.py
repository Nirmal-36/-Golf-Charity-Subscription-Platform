import json
import stripe
from django.conf import settings
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.accounts.models import User
from .services import create_checkout_session

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        success_url = request.data.get('success_url', 'http://localhost:5173/success')
        cancel_url = request.data.get('cancel_url', 'http://localhost:5173/cancel')
        plan_type = request.data.get('plan_type', 'monthly')
        
        try:
            session = create_checkout_session(request.user, success_url, cancel_url, plan_type=plan_type)
            return Response({'checkout_url': session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CreatePortalSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return_url = request.data.get('return_url', 'http://localhost:5173/subscription/details')
        
        try:
            if not request.user.stripe_customer_id:
                return Response({'error': 'No billing history found. Please subscribe first.'}, status=status.HTTP_400_BAD_REQUEST)
                
            session = stripe.billing_portal.Session.create(
                customer=request.user.stripe_customer_id,
                return_url=return_url,
            )
            return Response({'portal_url': session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SubscriptionHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.stripe_customer_id:
            return Response({'invoices': []})
            
        try:
            invoices = stripe.Invoice.list(
                customer=request.user.stripe_customer_id,
                limit=10
            )
            history = []
            for inv in invoices.data:
                history.append({
                    'id': inv.id,
                    'amount': inv.amount_paid / 100,
                    'status': inv.status,
                    'date': inv.created,
                    'pdf': inv.invoice_pdf,
                    'number': inv.number,
                    'currency': inv.currency.upper()
                })
            return Response({'invoices': history})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            # Invalid payload
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return HttpResponse(status=400)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self.handle_checkout_session(session)
            
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            self.handle_invoice_payment_succeeded(invoice)
            
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            self.handle_invoice_payment_failed(invoice)

        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            self.handle_subscription_deleted(subscription)

        return HttpResponse(status=200)

    def handle_checkout_session(self, session):
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        plan_type = metadata.get('plan_type', 'monthly')
        
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                user.stripe_customer_id = session.get('customer')
                user.stripe_subscription_id = session.get('subscription')
                user.subscription_status = 'active'
                user.subscription_plan = plan_type
                user.save()
            except User.DoesNotExist:
                pass

    def handle_invoice_payment_succeeded(self, invoice):
        customer_id = invoice.get('customer')
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'active'
                user.save()
            except User.DoesNotExist:
                pass

    def handle_invoice_payment_failed(self, invoice):
        customer_id = invoice.get('customer')
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'inactive'
                user.save()
            except User.DoesNotExist:
                pass

    def handle_subscription_deleted(self, subscription):
        customer_id = subscription.get('customer')
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'inactive'
                user.stripe_subscription_id = ''
                user.save()
            except User.DoesNotExist:
                pass
