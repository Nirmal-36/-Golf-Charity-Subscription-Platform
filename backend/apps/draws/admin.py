from django.contrib import admin
from .models import DrawRound, DrawEntry, DrawWinner, AdminAuditLog

@admin.register(DrawRound)
class DrawRoundAdmin(admin.ModelAdmin):
    list_display = ('id', 'draw_date', 'status', 'total_pool', 'is_published')
    list_filter = ('status', 'is_published')
    date_hierarchy = 'draw_date'

@admin.register(DrawEntry)
class DrawEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'draw', 'matches', 'tier_won', 'prize_amount')
    list_filter = ('draw', 'tier_won')
    search_fields = ('user__email', 'user__username')

@admin.register(DrawWinner)
class DrawWinnerAdmin(admin.ModelAdmin):
    list_display = ('user', 'draw', 'tier', 'prize_amount', 'status')
    list_filter = ('status', 'tier', 'draw')
    search_fields = ('user__email',)

@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ('admin', 'action', 'resource_type', 'timestamp')
    list_filter = ('resource_type', 'timestamp')
    search_fields = ('admin__email', 'action', 'notes')
