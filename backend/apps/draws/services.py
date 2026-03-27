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

        # Tiers & Pool Partitioning (Phase 29: Requirement 07)
        # Match 5: 40% (Rollover)
        # Match 4: 35% (No Rollover)
        # Match 3: 25% (No Rollover)
        
        pool_total_raw = float(draw.total_pool)
        tier_5_pool = (pool_total_raw * 0.40) + float(draw.jackpot_amount)
        tier_4_pool = (pool_total_raw * 0.35)
        tier_3_pool = (pool_total_raw * 0.25)

        # Pass 1: Categorize all winners to enable equal splitting
        tier_winners = {5: [], 4: [], 3: []}
        
        all_entries = list(draw.entries.all())
        winning_nums = set(winning_numbers)

        for entry in all_entries:
            entry_nums = set(entry.numbers)
            matches = len(entry_nums.intersection(winning_nums))
            
            if matches == 5:
                tier_winners[5].append(entry)
            elif matches == 4:
                tier_winners[4].append(entry)
            elif matches == 3:
                tier_winners[3].append(entry)

        # Pass 2: Calculate individual prizes and record winners
        winners_data = []
        
        # Helper to process a tier
        def process_tier(tier_num, tier_pool, winner_list):
            if not winner_list:
                return 0
            
            # Split pool equally among winners
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

        # Handle Lifecycle (Rollover & Next Month) - ONLY if not dry_run
        if not dry_run:
            import datetime
            next_date = draw.draw_date + datetime.timedelta(days=32)
            next_date = next_date.replace(day=1)

            if t5_count == 0:
                draw.jackpot_rolled_over = True
                # Rollover current 5-match pool (Jackpot + 40% share)
                next_jackpot = tier_5_pool
            else:
                # Fresh start with base jackpot if won
                next_jackpot = 1000.00 # Standard Reset Amount
            
            # Create next month's DrawRound
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
