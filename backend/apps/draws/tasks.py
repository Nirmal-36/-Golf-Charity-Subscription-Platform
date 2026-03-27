import random
from celery import shared_task
from django.utils import timezone
from .models import DrawRound, DrawWinner

@shared_task
def execute_monthly_draw():
    """
    Automated task to execute the monthly draw.
    Picks 5 custom random winning numbers.
    Calculates hits for each entry.
    Credits tier winners and rolls over jackpot if no tier-5 winner exists.
    """
    try:
        draw = DrawRound.objects.filter(
            status='scheduled', 
            draw_date__lte=timezone.now()
        ).order_by('draw_date').first()
        
        if not draw:
            return "No scheduled draw found to execute."

        # Update status so it doesn't get picked up twice
        draw.status = 'running'
        draw.save()

        # Step 1: Pick 5 random unique winning numbers between 1 and 45
        winning_numbers = random.sample(range(1, 46), 5)
        draw.winning_numbers = list(winning_numbers)

        tier_5_winner_found = False
        
        # Determine Prize Pools from the total pool
        # Example split: Tier 3 gets 15%, Tier 4 gets 25%, Tier 5 gets 60%
        # NOTE: A more complex system might distribute evenly across all winners in a tier.
        # This MVP logic provides a flat rate prize_amount per entry based on the pool percentage.
        t3_pool = draw.total_pool * Decimal('0.15')
        t4_pool = draw.total_pool * Decimal('0.25')
        t5_pool = draw.jackpot_amount # Tier 5 gets the rolling jackpot!

        # For this simple prototype, we just calculate raw matches. 
        # A full production version would divide t3_pool by the number of tier 3 winners.
        
        for entry in draw.entries.all():
            entry_nums = set(entry.numbers)
            winning_nums = set(winning_numbers)
            
            matches = len(entry_nums.intersection(winning_nums))
            entry.matches = matches
            
            if matches in [3, 4, 5]:
                entry.tier_won = matches
                
                # Mock prize calculation
                prize = 0
                if matches == 3: prize = 50.00
                elif matches == 4: prize = 500.00
                elif matches == 5: 
                    prize = float(t5_pool)
                    tier_5_winner_found = True
                    
                entry.prize_amount = prize
                
                DrawWinner.objects.create(
                    draw=draw,
                    user=entry.user,
                    tier=matches,
                    prize_amount=prize
                )
                
            entry.save()

        if not tier_5_winner_found:
            draw.jackpot_rolled_over = True
            
            # Create the NEXT month's draw and roll over the jackpot
            # Note: For MVP we use date.month + 1, using python relativedelta is safer
            import datetime
            next_draw_date = draw.draw_date + datetime.timedelta(days=32)
            next_draw_date = next_draw_date.replace(day=1)
            
            DrawRound.objects.create(
                draw_date=next_draw_date,
                status='scheduled',
                total_pool=0,
                jackpot_amount=draw.jackpot_amount # The rolled over amount
            )

        draw.status = 'completed'
        draw.save()

        return f"Draw {draw.id} executed successfully. Numbers: {winning_numbers}"

    except Exception as e:
        return f"Error executing draw: {str(e)}"
