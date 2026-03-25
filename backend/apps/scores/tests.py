import pytest
from rest_framework import status
from .models import GolfScore

@pytest.mark.django_db
class TestScoreRollingWindow:
    def test_rolling_score_limit(self, active_authenticated_client, active_test_user):
        # 1. Submit 5 scores
        url = "/api/scores/add/"
        for i in range(1, 6):
            res = active_authenticated_client.post(url, {"score": 30 + i})
            assert res.status_code == status.HTTP_201_CREATED
        
        assert GolfScore.objects.filter(user=active_test_user, is_active=True).count() == 5
        
        # 2. Submit 6th score
        active_authenticated_client.post(url, {"score": 40})
        
        # 3. Verify total active remains 5
        active_scores = GolfScore.objects.filter(user=active_test_user, is_active=True)
        assert active_scores.count() == 5
        
        # 4. Verify the oldest one (score 31) was deactivated
        assert not GolfScore.objects.filter(user=active_test_user, score=31).first().is_active

    def test_score_validation_bounds(self, active_authenticated_client):
        # Test lower bound (min 1)
        url = "/api/scores/add/"
        res = active_authenticated_client.post(url, {"score": 0})
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test upper bound (max 45)
        res = active_authenticated_client.post(url, {"score": 46})
        assert res.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test valid score
        res = active_authenticated_client.post(url, {"score": 45})
        assert res.status_code == status.HTTP_201_CREATED
