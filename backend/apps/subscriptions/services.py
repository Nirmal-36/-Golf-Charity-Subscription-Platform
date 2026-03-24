import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(user, success_url, cancel_url):
    """
    Creates a Stripe Checkout Session for a standard subscription.
    """
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        customer_email=user.email,
        line_items=[{
            # Using a placeholder price or dynamic data
            # Typically you'd create a Product and Price in the Stripe Dashboard
            # and use the Price ID here. For development without a dashboard:
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': 'Golf Charity Monthly Subscription',
                    'description': 'Access to rolling scores, prize draws, and charity donations.',
                },
                'unit_amount': 2000, # $20.00
                'recurring': {
                    'interval': 'month',
                },
            },
            'quantity': 1,
        }],
        mode='subscription',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'user_id': user.id
        }
    )
    return session
