import random
from django.utils import timezone
from .models import DrawRound, DrawEntry, DrawWinner
from apps.scores.models import GolfScore
from django.db import transaction
from django.db.models import Count
from decimal import Decimal

class DrawService:
    """
    Handles the core business logic for the monthly prize draw, including 
    winning number generation, prize calculation, and rollover management.
    """

    @staticmethod
    def get_weighted_numbers():
        """
        Generates 5 unique winning numbers (1-45) using weighted probability 
        based on the global frequency of golf scores submitted by platform users.
        """
        # Aggregate global score frequencies to build a probability map
        frequencies = GolfScore.objects.values('score').annotate(count=Count('id')).order_by('score')
        freq_map = {f['score']: f['count'] for f in frequencies}
        
        population = list(range(1, 46))
        # Ensure all numbers have at least a baseline weight of 1
        weights = [freq_map.get(num, 0) + 1 for num in population]
        
        winning_numbers = []
        temp_pop = list(population)
        temp_weights = list(weights)
        
        # Sample 5 unique numbers without replacement
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
        """
        Orchestrates the draw execution process. 
        - Generates winning numbers (Random or Weighted).
        - Categorizes winners into Tiers 3, 4, and 5.
        - Calculates and splits the prize pool.
        - Handles jackpot rollovers and schedules the next month's round.
        """
        draw = DrawRound.objects.get(id=draw_id)
        if draw.status != 'scheduled' and not dry_run:
            return {"error": "Draw is already executed or running."}

        effective_logic = logic_type or draw.logic_type
        
        # 1. Determine Winning Numbers
        if effective_logic == 'weighted':
            winning_numbers = DrawService.get_weighted_numbers()
        else:
            winning_numbers = sorted(random.sample(range(1, 46), 5))
            
        if not dry_run:
            draw.status = 'running'
            draw.logic_type = effective_logic
            draw.winning_numbers = list(winning_numbers)
            draw.save()

        # 2. Pool Partitioning (40% Tier 5 / 35% Tier 4 / 25% Tier 3)
        pool_total_raw = float(draw.total_pool)
        tier_5_pool = (pool_total_raw * 0.40) + float(draw.jackpot_amount)
        tier_4_pool = (pool_total_raw * 0.35)
        tier_3_pool = (pool_total_raw * 0.25)

        tier_winners = {5: [], 4: [], 3: []}
        all_entries = list(draw.entries.all())
        winning_nums = set(winning_numbers)

        # Pass 1: Categorize entries by match count
        for entry in all_entries:
            entry_nums = set(entry.numbers)
            matches = len(entry_nums.intersection(winning_nums))
            
            if matches == 5:
                tier_winners[5].append(entry)
            elif matches == 4:
                tier_winners[4].append(entry)
            elif matches == 3:
                tier_winners[3].append(entry)

        # Pass 2: Calculate individual payouts and record winners
        winners_data = []
        
        def process_tier(tier_num, tier_pool, winner_list):
            if not winner_list:
                return 0
            
            # Prizes are split equally among all winners in the same tier
            individual_prize = round(tier_pool / len(winner_list), 2)
            
            for entry in winner_list:
                if not dry_run:
                    entry.matches = tier_num
                    entry.tier_won = tier_num
                    entry.prize_amount = individual_prize
                    DrawWinner.objects.create(
                        draw=draw,
                        user=entry.user,
                        tier=tier_num,
                        prize_amount=individual_prize,
                        status='pending_proof'
                    )
                    entry.save()

                winners_data.append({
                    "user": entry.user.username,
                    "email": entry.user.email,
                    "tier": tier_num,
                    "prize": individual_prize
                })
            return len(winner_list)

        t5_count = process_tier(5, tier_5_pool, tier_winners[5])
        t4_count = process_tier(4, tier_4_pool, tier_winners[4])
        t3_count = process_tier(3, tier_3_pool, tier_winners[3])

        # 3. Handle Lifecycle (Rollover & Next Month Scheduling)
        if not dry_run:
            import datetime
            # Schedule next draw for the 1st of the following month
            next_date = draw.draw_date + datetime.timedelta(days=32)
            next_date = next_date.replace(day=1)

            if t5_count == 0:
                draw.jackpot_rolled_over = True
                # Carry forward the Tier 5 pool if no winner
                next_jackpot = tier_5_pool
            else:
                # Reset to baseline jackpot if won
                next_jackpot = 1000.00
            
            DrawRound.objects.create(
                draw_date=next_date,
                status='scheduled',
                jackpot_amount=next_jackpot,
                total_pool=0
            )

            draw.status = 'completed'
            draw.save()

        return {
            "id": draw.id,
            "logic_type": effective_logic,
            "winning_numbers": winning_numbers,
            "winners": winners_data,
            "jackpot_won": t5_count > 0,
            "is_simulation": dry_run,
            "pool_details": {
                "total": pool_total_raw,
                "tier_5_available": tier_5_pool,
                "tier_4_available": tier_4_pool,
                "tier_3_available": tier_3_pool
            }
        }
