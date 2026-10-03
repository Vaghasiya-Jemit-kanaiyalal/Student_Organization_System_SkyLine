from django.contrib import admin
from .models import Transaction, ReimbursementRequest


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'amount', 'transaction_type', 'category', 'date', 'recorded_by', 'created_at')
    list_filter = ('transaction_type', 'category', 'date')
    search_fields = ('title', 'description', 'recorded_by__full_name')


@admin.register(ReimbursementRequest)
class ReimbursementRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'amount', 'requested_by', 'status', 'reviewed_by', 'reviewed_at', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'description', 'requested_by__full_name', 'requested_by__email')
