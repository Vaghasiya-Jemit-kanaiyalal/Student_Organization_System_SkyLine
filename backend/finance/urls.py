from django.urls import path
from .views import (
    FinanceDashboardView,
    TransactionListCreateView,
    ReimbursementListCreateView,
    ApproveReimbursementView,
    RejectReimbursementView,
)

urlpatterns = [
    # Finance dashboard / summary
    path('', FinanceDashboardView.as_view(), name='finance-dashboard'),
    path('summary/', FinanceDashboardView.as_view(), name='finance-summary'),

    # Transactions: /api/finance/transactions/
    path('transactions/', TransactionListCreateView.as_view(), name='finance-transactions'),

    # Reimbursements: /api/finance/reimbursements/
    path('reimbursements/', ReimbursementListCreateView.as_view(), name='finance-reimbursements'),
    path('reimbursements/<int:pk>/approve/', ApproveReimbursementView.as_view(), name='finance-reimbursement-approve'),
    path('reimbursements/<int:pk>/reject/', RejectReimbursementView.as_view(), name='finance-reimbursement-reject'),
]
