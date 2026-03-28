import os
from django.core.wsgi import get_wsgi_application

# Vercel Serverless Bridge: Eagle Golf Charity Platform
# Prepares the Django WSGI application for the Vercel Python runtime.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

app = get_wsgi_application()
