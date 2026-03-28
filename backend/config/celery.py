"""
Celery Infrastructure: Task Queue Distributed Architecture
Initializes the application instance for background processing, 
scheduled heartbeats, and high-deliverability email dispatch.
"""

import os
from celery import Celery

# Load environment targeting
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('golf_charity')

# Configuration: Namespace 'CELERY' maps to settings starting with CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automated Discovery: Detects tasks.py modules across all local apps
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Infrastructure Diagnostic: Simple heartbeat validation."""
    print(f'Celery Heartbeat Request Identified: {self.request!r}')
