from .models import GolfScore

def add_score(user, score_value, played_at=None):
    """
    Adds a new score for the user.
    Maintains a rolling window of max 5 active scores by deactivating the oldest ones (based on played_at).
    """
    # Create the score first (the model's save method will handle the rolling window)
    return GolfScore.objects.create(user=user, score=score_value, played_at=played_at)
