import random
from django.utils import timezone
from .models import DrawRound, DrawEntry, DrawWinner
from django.db import transaction
from decimal import Decimal

class DrawService:
    @staticmethod
    @transaction.atomic
    def execute_draw(draw_id):
        draw = DrawRound.objects.get(id=draw_id)
        if draw.status != 'scheduled':
            return {"error": "Draw is already executed or running."}

        draw.status = 'running'
        draw.save()

        # 1. Pick 5 unique winning numbers between 1 and 45
        winning_numbers = sorted(random.sample(range(1, 46), 5))
        draw.winning_numbers = list(winning_numbers)

        winners_data = []
        tier_5_winner_found = False

        # Prize Calculation Logic (Phase 12)
        # Tier 5: 100% of rolling jackpot_amount
        # Tier 4: Fixed or split from remaining pool
        # Tier 3: Fixed or split from remaining pool
        
        # For simplicity in this implementation:
        # Tier 3 = $50 fixed
        # Tier 4 = $500 fixed
        # These are subtracted from the total_pool.
        
        for entry in draw.entries.all():
            entry_nums = set(entry.numbers)
            winning_nums = set(winning_numbers)
            matches = len(entry_nums.intersection(winning_nums))
            
            entry.matches = matches
            prize_amount = 0
            
            if matches == 5:
                tier_5_winner_found = True
                entry.tier_won = 5
                prize_amount = float(draw.jackpot_amount)
            elif matches == 4:
                entry.tier_won = 4
                prize_amount = 500.00
            elif matches == 3:
                entry.tier_won = 3
                prize_amount = 50.00
            
            if prize_amount > 0:
                entry.prize_amount = prize_amount
                DrawWinner.objects.create(
                    draw=draw,
                    user=entry.user,
                    tier=entry.tier_won,
                    prize_amount=prize_amount,
                    status='pending_proof'
                )
                winners_data.append({
                    "user": entry.user.email,
                    "tier": entry.tier_won,
                    "prize": prize_amount
                })
            
            entry.save()

        # Handle Jackpot Rollover
        if not tier_5_winner_found:
            draw.jackpot_rolled_over = True
            # Roll over current jackpot + current month's pool (40% of subs) to next month
            next_jackpot = float(draw.jackpot_amount) + float(draw.total_pool)
            
            # Create next month's draw
            import datetime
            next_date = draw.draw_date + datetime.timedelta(days=32)
            next_date = next_date.replace(day=1)
            
            DrawRound.objects.create(
                draw_date=next_date,
                status='scheduled',
                jackpot_amount=next_jackpot,
                total_pool=0
            )
        else:
            # Jackpot was won, start next month fresh with default pool or small starter
            import datetime
            next_date = draw.draw_date + datetime.timedelta(days=32)
            next_date = next_date.replace(day=1)
            
            DrawRound.objects.create(
                draw_date=next_date,
                status='scheduled',
                jackpot_amount=1000.00, # Fresh jackpot start
                total_pool=0
            )

        draw.status = 'completed'
        draw.save()

        return {
            "id": draw.id,
            "winning_numbers": winning_numbers,
            "winners": winners_data,
            "jackpot_won": tier_5_winner_found
        }
