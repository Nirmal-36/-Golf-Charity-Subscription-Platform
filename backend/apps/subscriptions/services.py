import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

import stripe
from django.conf import settings

# Global Initialization: Stripe API Gateway
stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(user, success_url, cancel_url, plan_type='monthly'):
    """
    Stripe Checkout: Membership Onboarding.
    Initializes a hosted checkout session for recurring subscription billing.
    Configures plan metadata (Monthly $9.99 / Yearly $99.00) and user identity 
    for webhook reconciliation.
    """
    if plan_type == 'yearly':
        plan_name = 'Eagle Yearly Membership'
        amount = 9900  # $99.00 USD
        interval = 'year'
    else:
        plan_name = 'Eagle Monthly Membership'
        amount = 999   # $9.99 USD
        interval = 'month'

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        customer_email=user.email,
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': plan_name,
                    'description': f'Premium access to rolling scores, monthly prize draws, and impactful charity support ({interval}ly billing).',
                },
                'unit_amount': amount,
                'recurring': {
                    'interval': interval,
                },
            },
            'quantity': 1,
        }],
        mode='subscription',
        success_url=success_url,
        cancel_url=cancel_url,
        # Audit Trail: Metadata injected for Stripe Webhook reconciliation
        metadata={
            'user_id': user.id,
            'plan_type': plan_type,
            'donation_percentage': str(user.donation_percentage)
        }
    )
    return session

def create_one_time_donation_session(charity, amount, success_url, cancel_url, customer_email=None):
    """
    Stripe Checkout: Philanthropic Direct Donation.
    Initializes a one-time payment session targeted at a specific Charity Partner.
    Converts decimal amount to fractional units (cents) for Stripe processing.
    """
    # Precision: Decimal to Integer conversion for API compliance
    unit_amount = int(float(amount) * 100)

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        customer_email=customer_email,
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f'One-time Contribution: {charity.name}',
                    'description': 'Direct philanthropic support through the Eagle Golf Charity Platform.',
                },
                'unit_amount': unit_amount,
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
        # Verification: Metadata for tracking individual donation impact
        metadata={
            'type': 'one_time_donation',
            'charity_id': charity.id,
            'amount': str(amount)
        }
    )
    return session
