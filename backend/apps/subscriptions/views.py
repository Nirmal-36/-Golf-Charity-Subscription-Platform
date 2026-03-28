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
    """
    Onboarding Interface: Initializes a Stripe Checkout Session for new subscriptions.
    Supports both Monthly and Yearly membership tiers based on request parameters.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        success_url = request.data.get('success_url', 'http://localhost:5173/success')
        cancel_url = request.data.get('cancel_url', 'http://localhost:5173/cancel')
        plan_type = request.data.get('plan_type', 'monthly')
        
        try:
            session = create_checkout_session(request.user, success_url, cancel_url, plan_type=plan_type)
            return Response({'checkout_url': session.url})
        except Exception as e:
            return Response({'error': f"Stripe Session Creation Failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class CreatePortalSessionView(APIView):
    """
    Self-Service Management: Generates a Stripe Billing Portal link.
    Allows members to update payment methods, download invoices, 
    and manage subscription tiers autonomously.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return_url = request.data.get('return_url', 'http://localhost:5173/subscription/details')
        
        try:
            if not request.user.stripe_customer_id:
                return Response({'error': 'No active billing profile identified. Please subscribe to access the portal.'}, status=status.HTTP_400_BAD_REQUEST)
                
            session = stripe.billing_portal.Session.create(
                customer=request.user.stripe_customer_id,
                return_url=return_url,
            )
            return Response({'portal_url': session.url})
        except Exception as e:
            return Response({'error': f"Portal Initialization Failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class SubscriptionHistoryView(APIView):
    """
    Member Archive: Retrieves historical Stripe invoices for the authenticated user.
    Provides transparent access to past contributions and membership payments.
    """
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
            return Response({'error': f"Invoice Retrieval Failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Automated Reconciliation Hub: Processes real-time event notifications from Stripe.
    Coordinates subscription lifecycle updates, payment confirmations, and 
    philanthropic financial allocations.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            # Security: Verify that the notification originated from Stripe
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            print(f"WEBHOOK RECEIVED: {event['type']}")
        except ValueError as e:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            return HttpResponse(status=400)

        # Event Dispatcher: Routing based on Stripe Event Type
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            metadata = session.get('metadata', {})
            
            if metadata.get('type') == 'one_time_donation':
                self.handle_one_time_donation(session)
            else:
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
        """
        Subscription Initialization: Link a Stripe customer/subscription to a platform user.
        Calculates the professional end date for the first billing period.
        """
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
                
                # Persistence Logic: Extract explicit period boundaries from Stripe
                if user.stripe_subscription_id:
                    sub = stripe.Subscription.retrieve(user.stripe_subscription_id)
                    from django.utils import timezone
                    import datetime
                    
                    # Robust failover for timestamp extraction
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
                
                # Communication Hook: Trigger the personalized welcome sequence
                try:
                    from apps.core.emails import send_welcome_email
                    send_welcome_email.delay(user.email, plan_type)
                except Exception as e:
                    print(f"FAILED TO QUEUE WELCOME EMAIL: {str(e)}")
            except User.DoesNotExist:
                pass

    def handle_invoice_payment_succeeded(self, invoice):
        """
        Financial Split Engine: Processes successful recurring payments.
        Executes the platform's core multi-tier allocation:
        1. 40% -> Current Monthly Prize Pool
        2. 10%+ -> Member's Selected Charity
        3. 50% -> Platform Operations & Growth
        Also creates a formal Donation record for tax/transparency purposes.
        """
        customer_id = invoice.get('customer')
        amount_paid = invoice.get('amount_paid', 0) / 100  # Fractional conversion (Cents to USD)
        
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'active'
                
                # Persistence: Advance the membership expiration date
                sub_id = invoice.get('subscription')
                if sub_id:
                    sub = stripe.Subscription.retrieve(sub_id)
                    from django.utils import timezone
                    import datetime
                    
                    end_ts = getattr(sub, 'current_period_end', None)
                    if not end_ts:
                        # Fallback: Extract from the current invoice period definition
                        if invoice.get('lines') and invoice['lines']['data']:
                             end_ts = invoice['lines']['data'][0]['period']['end']
                    
                    if end_ts:
                        user.subscription_end_date = timezone.make_aware(
                            datetime.datetime.fromtimestamp(end_ts)
                        )
                
                # Allocation Logic: The "Heart" of the Platform
                prize_allocation = amount_paid * 0.40
                charity_percentage = float(user.donation_percentage) / 100
                charity_allocation = amount_paid * charity_percentage
                
                # Step 1: Capitalize the active prize pool
                current_draw = DrawRound.objects.filter(status='scheduled').order_by('draw_date').first()
                if current_draw:
                    current_draw.total_pool = float(current_draw.total_pool) + prize_allocation
                    current_draw.save()
                
                # Step 2: Attribute impact to the Charity and Member
                if user.selected_charity:
                    charity = user.selected_charity
                    charity.total_received = float(charity.total_received) + charity_allocation
                    charity.save()
                    
                    user.total_donated = float(user.total_donated) + charity_allocation
                    
                    # Step 3: Formalize the philanthropic transaction
                    Donation.objects.create(
                        user=user,
                        charity=charity,
                        amount=charity_allocation,
                        plan_type=user.subscription_plan,
                        stripe_invoice_id=invoice.get('id', '')
                    )
                
                user.save()
                print(f"FINANCIAL RECONCILIATION: ${prize_allocation} (Prize) | ${charity_allocation} (Charity) | ${amount_paid - prize_allocation - charity_allocation} (Ops)")
                
            except User.DoesNotExist:
                pass

    def handle_invoice_payment_failed(self, invoice):
        """
        Lifecycle Guard: Handles failed subscription renewals.
        Immediately transitions the user to an 'inactive' state to restrict 
        access to pending draws.
        """
        customer_id = invoice.get('customer')
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'inactive'
                user.save()
            except User.DoesNotExist:
                pass

    def handle_subscription_deleted(self, subscription):
        """
        Lifecycle Exit: Finalizes a subscription cancellation.
        Clears Stripe references and marks the membership as inactive.
        """
        customer_id = subscription.get('customer')
        if customer_id:
            try:
                user = User.objects.get(stripe_customer_id=customer_id)
                user.subscription_status = 'inactive'
                user.stripe_subscription_id = ''
                user.save()
            except User.DoesNotExist:
                pass

    def handle_one_time_donation(self, session):
        """
        Philanthropic Accelerator: Processes independent, one-time contributions.
        Attributes 100% of the net amount to the target charity.
        """
        metadata = session.get('metadata', {})
        charity_id = metadata.get('charity_id')
        amount = float(metadata.get('amount', 0))
        customer_email = session.get('customer_details', {}).get('email')
        
        if charity_id:
            try:
                from apps.charities.models import Charity
                from apps.accounts.models import User
                from .models import Donation
                
                charity = Charity.objects.get(id=charity_id)
                charity.total_received = float(charity.total_received) + amount
                charity.save()
                
                # Step 1: Link to member account if exists (Ghost donors allowed)
                user = User.objects.filter(email=customer_email).first()
                
                # Step 2: Formalize the independent donation
                Donation.objects.create(
                    user=user,
                    charity=charity,
                    amount=amount,
                    plan_type='one_time',
                    stripe_invoice_id=session.get('id', '')
                )
                print(f"ONE-TIME IMPACT RECORDED: ${amount} to {charity.name}")
            except Charity.DoesNotExist:
                pass
