import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(user, success_url, cancel_url, plan_type='monthly'):
    """
    Creates a Stripe Checkout Session for a standard subscription.
    """
    if plan_type == 'yearly':
        plan_name = 'Eagle Yearly Membership'
        amount = 9900  # $99.00
        interval = 'year'
    else:
        plan_name = 'Eagle Monthly Membership'
        amount = 999   # $9.99
        interval = 'month'

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        customer_email=user.email,
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': plan_name,
                    'description': f'Access to rolling scores, prize draws, and charity donations ({interval}ly billing).',
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
        metadata={
            'user_id': user.id,
            'plan_type': plan_type,
            'donation_percentage': str(user.donation_percentage)
        }
    )
    return session

def create_one_time_donation_session(charity, amount, success_url, cancel_url, customer_email=None):
    """
    Creates a Stripe Checkout Session for a one-time donation to a specific charity.
    """
    # Amount is in dollars, convert to cents
    unit_amount = int(float(amount) * 100)

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        customer_email=customer_email,
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f'One-time Donation to {charity.name}',
                    'description': 'Thank you for your independent support toward this cause.',
                },
                'unit_amount': unit_amount,
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'type': 'one_time_donation',
            'charity_id': charity.id,
            'amount': str(amount)
        }
    )
    return session
