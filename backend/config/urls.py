"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/scores/', include('apps.scores.urls')),
    path('api/charities/', include('apps.charities.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls')),
]
