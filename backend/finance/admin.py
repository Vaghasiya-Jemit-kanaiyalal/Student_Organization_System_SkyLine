from django.contrib import admin
from .models import Transaction, ReimbursementRequest


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_id',
        'title',
        'amount',
        'transaction_type',
        'category',
        'status',
        'reference_type',
        'reference_id',
        'date',
        'recorded_by',
        'created_at',
    )
    list_filter = ('transaction_type', 'category', 'status', 'date')
    search_fields = (
        'transaction_id',
        'title',
        'description',
        'party_name',
        'reference_id',
        'recorded_by__full_name',
    )
    readonly_fields = ('transaction_id', 'created_at', 'updated_at')


@admin.register(ReimbursementRequest)
class ReimbursementRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'amount',
        'requested_by',
        'status',
        'reviewed_by',
        'reviewed_at',
        'paid_at',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = (
        'title',
        'description',
        'requested_by__full_name',
        'requested_by__email',
        'related_activity',
    )
    readonly_fields = ('created_at', 'updated_at', 'linked_transaction')
