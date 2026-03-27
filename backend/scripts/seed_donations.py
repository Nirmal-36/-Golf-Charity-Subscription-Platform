import os
import sys
import django
from decimal import Decimal
from django.utils import timezone

# Setup Django environment
sys.path.append('/Users/nirmalmadhunala/Desktop/Golf Charity Subscription Platform/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'golf_charity_backend.settings')
django.setup()

from apps.accounts.models import User
from apps.charities.models import Charity
from apps.subscriptions.models import Donation

def seed_donations():
    print("SEEDING DEMO DONATIONS...")
    
    # Get all charities
    charities = Charity.objects.all()
    if not charities.exists():
        print("No charities found. Please seed charities first.")
        return

    # Get some users
    users = User.objects.filter(user_role='subscriber')[:5]
    if not users.exists():
        print("No subscribers found. Creating some...")
        for i in range(5):
            User.objects.create_user(
                email=f'supporter{i}@example.com',
                password='password123',
                user_role='subscriber',
                subscription_plan='monthly' if i % 2 == 0 else 'yearly'
            )
        users = User.objects.filter(user_role='subscriber')[:5]

    for charity in charities:
        print(f"Adding donations for {charity.name}...")
        for i, user in enumerate(users):
            # Create 2 donations per user
            for j in range(2):
                Donation.objects.create(
                    user=user,
                    charity=charity,
                    amount=Decimal('15.00') if user.subscription_plan == 'monthly' else Decimal('150.00'),
                    plan_type=user.subscription_plan,
                    timestamp=timezone.now() - timezone.timedelta(days=i*10 + j*2),
                    stripe_invoice_id=f'in_demo_{charity.id}_{user.id}_{j}'
                )
    
    print("SUCCESS: 10 demo donations created per charity!")

if __name__ == '__main__':
    seed_donations()
