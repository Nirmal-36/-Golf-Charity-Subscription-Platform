import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def active_test_user(db):
    return User.objects.create_user(
        username="activeuser",
        email="active@example.com",
        password="password123",
        subscription_status='active'
    )

@pytest.fixture
def active_authenticated_client(api_client, active_test_user):
    api_client.force_authenticate(user=active_test_user)
    return api_client

@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client
