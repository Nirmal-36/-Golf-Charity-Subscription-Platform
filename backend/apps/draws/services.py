import random
from django.utils import timezone
from .models import DrawRound, DrawEntry, DrawWinner
from apps.scores.models import GolfScore
from django.db import transaction
from django.db.models import Count
from decimal import Decimal

class DrawService:
    @staticmethod
    def get_weighted_numbers():
        """
        Calculates weights for numbers 1-45 based on global GolfScore frequency.
        Returns 5 unique numbers.
        """
        # Count frequencies of scores (1-45)
        frequencies = GolfScore.objects.values('score').annotate(count=Count('id')).order_by('score')
        freq_map = {f['score']: f['count'] for f in frequencies}
        
        # Build probability list
        population = list(range(1, 46))
        # Default weight of 1 to ensure all numbers have a chance
        weights = [freq_map.get(num, 0) + 1 for num in population]
        
        # Sample 5 unique numbers
        # random.choices with weights can return duplicates, so we sample manually or use a loop
        winning_numbers = []
        temp_pop = list(population)
        temp_weights = list(weights)
        
        for _ in range(5):
            choice = random.choices(temp_pop, weights=temp_weights, k=1)[0]
            winning_numbers.append(choice)
            idx = temp_pop.index(choice)
            temp_pop.pop(idx)
            temp_weights.pop(idx)
            
        return sorted(winning_numbers)

    @staticmethod
    @transaction.atomic
    def execute_draw(draw_id, dry_run=False, logic_type=None):
        draw = DrawRound.objects.get(id=draw_id)
        if draw.status != 'scheduled' and not dry_run:
            return {"error": "Draw is already executed or running."}

        # Determine logic type
        effective_logic = logic_type or draw.logic_type
        
        # 1. Pick 5 unique winning numbers
        if effective_logic == 'weighted':
            winning_numbers = DrawService.get_weighted_numbers()
        else:
            winning_numbers = sorted(random.sample(range(1, 46), 5))
            
        if not dry_run:
            draw.status = 'running'
            draw.logic_type = effective_logic
            draw.winning_numbers = list(winning_numbers)
            draw.save()

        winners_data = []
        tier_5_winner_found = False
        
        # Tier prizes (Phase 12 specs)
        T4_PRIZE = 500.00
        T3_PRIZE = 50.00
        
        for entry in draw.entries.all():
            entry_nums = set(entry.numbers)
            winning_nums = set(winning_numbers)
            matches = len(entry_nums.intersection(winning_nums))
            
            prize_amount = 0
            tier = None
            
            if matches == 5:
                tier_5_winner_found = True
                tier = 5
                prize_amount = float(draw.jackpot_amount)
            elif matches == 4:
                tier = 4
                prize_amount = T4_PRIZE
            elif matches == 3:
                tier = 3
                prize_amount = T3_PRIZE
            
            if not dry_run:
                entry.matches = matches
                if tier:
                    entry.tier_won = tier
                    entry.prize_amount = prize_amount
                    DrawWinner.objects.create(
                        draw=draw,
                        user=entry.user,
                        tier=tier,
                        prize_amount=prize_amount,
                        status='pending_proof'
                    )
                entry.save()

            if tier:
                winners_data.append({
                    "user": entry.user.username,
                    "email": entry.user.email,
                    "tier": tier,
                    "prize": prize_amount
                })

        # Handle Lifecycle (Rollover & Next Month) - ONLY if not dry_run
        if not dry_run:
            if not tier_5_winner_found:
                draw.jackpot_rolled_over = True
                # Rollover current jackpot + 40% of subs added during this month
                # (total_pool is updated via webhooks)
                next_jackpot = float(draw.jackpot_amount) + float(draw.total_pool)
                
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
                import datetime
                next_date = draw.draw_date + datetime.timedelta(days=32)
                next_date = next_date.replace(day=1)
                
                DrawRound.objects.create(
                    draw_date=next_date,
                    status='scheduled',
                    jackpot_amount=1000.00, # Fresh start
                    total_pool=0
                )

            draw.status = 'completed'
            draw.save()

        return {
            "id": draw.id,
            "logic_type": effective_logic,
            "winning_numbers": winning_numbers,
            "winners": winners_data,
            "jackpot_won": tier_5_winner_found,
            "is_simulation": dry_run
        }
