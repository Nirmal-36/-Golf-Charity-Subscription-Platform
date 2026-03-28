from .base import *

# In development, run Celery tasks synchronously to avoid Redis dependency
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
