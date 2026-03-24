from .models import GolfScore

def add_score(user, score_value):
    """
    Adds a new score for the user.
    Maintains a rolling window of max 5 active scores by deactivating the oldest ones.
    """
    active_scores = GolfScore.objects.filter(user=user, is_active=True).order_by('-submitted_at')
    
    # If we already have 5 active scores, we need to deactivate the oldest one before adding the new one.
    # We keep the 4 newest, and deactivate anything from index 4 onwards.
    if active_scores.count() >= 5:
        scores_to_deactivate = active_scores[4:]
        for score in scores_to_deactivate:
            score.is_active = False
            score.save()
            
    return GolfScore.objects.create(user=user, score=score_value)
