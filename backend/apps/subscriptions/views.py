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
from apps.draws.models import DrawRound
from apps.charities.models import Charity
from .models import Donation
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
            print(f"WEBHOOK RECEIVED: {event['type']}")
        except ValueError as e:
            print("WEBHOOK ERROR: Invalid payload")
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            print("WEBHOOK ERROR: Invalid signature. Check STRIPE_WEBHOOK_SECRET.")
            return HttpResponse(status=400)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            print(f"WEBHOOK: Handling checkout.session.completed for user_id: {session.get('metadata', {}).get('user_id')}")
            self.handle_checkout_session(session)
            
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            print(f"WEBHOOK: Handling invoice.payment_succeeded for customer: {invoice.get('customer')}")
            self.handle_invoice_payment_succeeded(invoice)
            
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            print(f"WEBHOOK: Handling invoice.payment_failed for customer: {invoice.get('customer')}")
            self.handle_invoice_payment_failed(invoice)

        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            print(f"WEBHOOK: Handling customer.subscription.deleted for customer: {subscription.get('customer')}")
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
                
                # Fetch end date from Stripe (Phase 13 robust fix)
                if user.stripe_subscription_id:
                    sub = stripe.Subscription.retrieve(user.stripe_subscription_id)
                    from django.utils import timezone
                    import datetime
                    
                    # Robust fallback: use latest_invoice period end if current_period_end is missing
                    end_ts = getattr(sub, 'current_period_end', None)
                    if not end_ts and sub.latest_invoice:
                        inv = stripe.Invoice.retrieve(sub.latest_invoice)
                        if inv.lines.data:
                            end_ts = inv.lines.data[0].period.end
                    
                    if end_ts:
                        user.subscription_end_date = timezone.make_aware(
                            datetime.datetime.fromtimestamp(end_ts)
                        )
                
                user.save()
                
                # Send Welcome Email (Phase 13 Improvement)
                try:
                    from apps.core.emails import send_welcome_email
                    send_welcome_email.delay(user.email, plan_type)
                except Exception as e:
                    print(f"FAILED TO QUEUE WELCOME EMAIL: {str(e)}")
            except User.DoesNotExist:
                pass

    def handle_invoice_payment_succeeded(self, invoice):
        customer_id = invoice.get('customer')
        amount_paid = invoice.get('amount_paid', 0) / 100  # Convert cents to dollars
        
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'active'
                
                # Update next billing date (Phase 13 robust fix)
                sub_id = invoice.get('subscription')
                if sub_id:
                    sub = stripe.Subscription.retrieve(sub_id)
                    from django.utils import timezone
                    import datetime
                    
                    # Robust fallback: use invoice period end if current_period_end is missing
                    end_ts = getattr(sub, 'current_period_end', None)
                    if not end_ts:
                        # Since we are in the invoice handler, we use this invoice's period end
                        if invoice.get('lines') and invoice['lines']['data']:
                             end_ts = invoice['lines']['data'][0]['period']['end']
                    
                    if end_ts:
                        user.subscription_end_date = timezone.make_aware(
                            datetime.datetime.fromtimestamp(end_ts)
                        )
                
                # Financial Split Logic (Phase 12)
                # 40% Prize Pool, 10%+ Charity, 50% Platform
                prize_allocation = amount_paid * 0.40
                charity_percentage = float(user.donation_percentage) / 100
                charity_allocation = amount_paid * charity_percentage
                
                # 1. Update Current Draw Pool
                current_draw = DrawRound.objects.filter(status='scheduled').order_by('draw_date').first()
                if current_draw:
                    current_draw.total_pool = float(current_draw.total_pool) + prize_allocation
                    current_draw.save()
                
                # 2. Update Charity & User Stats
                if user.selected_charity:
                    charity = user.selected_charity
                    charity.total_received = float(charity.total_received) + charity_allocation
                    charity.save()
                    
                    user.total_donated = float(user.total_donated) + charity_allocation
                    
                    # 3. Create Donation record (Phase 21)
                    Donation.objects.create(
                        user=user,
                        charity=charity,
                        amount=charity_allocation,
                        plan_type=user.subscription_plan,
                        stripe_invoice_id=invoice.get('id', '')
                    )
                
                user.save()
                print(f"FINANCIAL SPLIT COMPLETE: ${prize_allocation} to Prize, ${charity_allocation} to {user.selected_charity.name if user.selected_charity else 'None'}")
                
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
