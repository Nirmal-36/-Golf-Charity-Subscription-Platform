import random
from celery import shared_task
from django.utils import timezone
from .models import DrawRound, DrawWinner

from .services import DrawService

@shared_task
def execute_monthly_draw():
    """
    Automated Heartbeat Task: Periodic Draw Execution.
    Scans for scheduled Draw Rounds that have passed their execution date.
    Iteratively processes each round using the centralized DrawService to 
    maintain logic consistency across manual and automated triggers.
    """
    try:
        # Standard query for all pending production draws
        overdue_draws = DrawRound.objects.filter(
            status='scheduled', 
            draw_date__lte=timezone.now()
        ).order_by('draw_date')
        
        if not overdue_draws.exists():
            return "Task completed: No overdue draw rounds identified."

        results = []
        for draw in overdue_draws:
            # Atomic execution of the draw prize engine
            res = DrawService.execute_draw(draw.id)
            results.append(f"Round {draw.id}: {res}")
            
        return "Batch Success:\n" + "\n".join(results)

    except Exception as e:
        # Log critical failure for visibility in Celery Flower/Monitoring
        return f"Critical Draw Task Failure: {str(e)}"
