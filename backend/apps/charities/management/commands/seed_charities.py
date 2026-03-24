import random
from django.core.management.base import BaseCommand
from apps.charities.models import Charity
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seeds the database with 10 mock charities'

    def handle(self, *args, **kwargs):
        charities_data = [
            {'name': 'Green Earth Initiative', 'category': 'Environment', 'desc': 'Protecting global golf courses and surrounding environments.'},
            {'name': 'Youth Golf Foundation', 'category': 'Youth Sport', 'desc': 'Providing underprivileged youth with access to golf coaching and equipment.'},
            {'name': 'Veterans Outing Club', 'category': 'Veterans', 'desc': 'Hosting therapeutic golf outings for returning active military veterans.'},
            {'name': 'Fairway Health Partners', 'category': 'Health', 'desc': 'Funding medical research through charity golf tournaments.'},
            {'name': 'Links for Learning', 'category': 'Education', 'desc': 'Scholarship funds generated from community golf days.'},
            {'name': 'Water Hazard Rescue', 'category': 'Environment', 'desc': 'Cleaning up local water systems and lakes around golf courses.'},
            {'name': 'Golfers Against Hunger', 'category': 'Community', 'desc': 'Partnering with local food banks to provide meals to those in need.'},
            {'name': 'Accessible Fairways', 'category': 'Disability', 'desc': 'Modifying courses to become wheelchair and adaptive-golf friendly.'},
            {'name': 'Putt for Paws', 'category': 'Animal Welfare', 'desc': 'Funding local animal shelters through putting competitions.'},
            {'name': 'Senior Swing Society', 'category': 'Community', 'desc': 'Promoting physical and mental health for seniors through weekly golf events.'},
        ]

        if Charity.objects.exists():
            self.stdout.write(self.style.WARNING("Charities already exist. Skipping seed."))
            return

        for data in charities_data:
            Charity.objects.create(
                name=data['name'],
                slug=slugify(data['name']),
                description=data['desc'],
                category=data['category'],
                # Mock high resolution images via Unsplash Source (or generic placeholder)
                logo_url=f"https://ui-avatars.com/api/?name={data['name'].replace(' ', '+')}&background=1B4332&color=fff&size=200"
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded 10 charities!"))
