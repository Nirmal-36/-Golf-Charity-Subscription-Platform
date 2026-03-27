import os
import sys
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.charities.models import Charity
from apps.accounts.models import User

def cleanup():
    print("Purging dummy data...")
    # Delete test charities
    Charity.objects.filter(name__icontains="Dummy").delete()
    Charity.objects.filter(name__icontains="Test").delete()
    Charity.objects.filter(name__icontains="Repro").delete()
    
    # Create Real-World Charities
    charities = [
        {
            "name": "UNICEF Golf Initiative",
            "category": "High Impact",
            "description": "Providing life-saving nutrition, water, and vaccines to children in need through community-driven golf events and sustainable funding.",
            "logo_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=200",
        },
        {
            "name": "Green Earth Golfers",
            "category": "Environment",
            "description": "Preserving biodiversity and protecting natural habitats. We partner with golf courses to implement eco-friendly land management and reforestation.",
            "logo_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200",
        },
        {
            "name": "Junior Masters Foundation",
            "category": "Education",
            "description": "Empowering youth from underprivileged backgrounds through golf scholarship programs, mentorship, and leadership training on and off the course.",
            "logo_url": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200",
        }
    ]
    
    for c_data in charities:
        Charity.objects.get_or_create(
            name=c_data["name"],
            defaults={
                "category": c_data["category"],
                "description": c_data["description"],
                "logo_url": c_data["logo_url"],
                "is_active": True,
                "is_approved": True
            }
        )
    
    print("Database sanitized and seeded with professional partners.")

if __name__ == "__main__":
    cleanup()
