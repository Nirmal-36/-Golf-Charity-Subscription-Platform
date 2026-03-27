import random
from celery import shared_task
from django.utils import timezone
from .models import DrawRound, DrawWinner

from .services import DrawService

@shared_task
def execute_monthly_draw():
    """
    Heartbeat task to check for and execute any overdue scheduled draws.
    Uses the centralized DrawService for consistent logic.
    """
    try:
        overdue_draws = DrawRound.objects.filter(
            status='scheduled', 
            draw_date__lte=timezone.now()
        ).order_by('draw_date')
        
        if not overdue_draws.exists():
            return "No overdue draws found."

        results = []
        for draw in overdue_draws:
            res = DrawService.execute_draw(draw.id)
            results.append(f"Draw {draw.id}: {res}")
            
        return "\n".join(results)

    except Exception as e:
        return f"Error in draw heartbeat: {str(e)}"
