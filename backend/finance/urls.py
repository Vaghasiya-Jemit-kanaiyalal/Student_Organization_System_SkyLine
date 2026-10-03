from django.urls import path
from .views import (
    ApproveReimbursementView,
    ExpenseListView,
    FinanceDashboardView,
    FinanceReportsView,
    IncomeListView,
    MarkPaidReimbursementView,
    RecordPaymentView,
    RefundTransactionView,
    ReimbursementListCreateView,
    ReimbursementReceiptView,
    RejectReimbursementView,
    TransactionDetailView,
    TransactionListCreateView,
)

urlpatterns = [
    # Dashboard / summary
    path('', FinanceDashboardView.as_view(), name='finance-dashboard'),
    path('dashboard/', FinanceDashboardView.as_view(), name='finance-dashboard-alias'),
    path('summary/', FinanceDashboardView.as_view(), name='finance-summary'),

    # Ledger
    path('transactions/', TransactionListCreateView.as_view(), name='finance-transactions'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='finance-transaction-detail'),
    path('transactions/<int:pk>/refund/', RefundTransactionView.as_view(), name='finance-transaction-refund'),

    path('income/', IncomeListView.as_view(), name='finance-income'),
    path('expenses/', ExpenseListView.as_view(), name='finance-expenses'),

    # Payment posting (membership / tickets / merch / fundraiser)
    path('payments/record/', RecordPaymentView.as_view(), name='finance-record-payment'),

    # Reports
    path('reports/', FinanceReportsView.as_view(), name='finance-reports'),

    # Reimbursements
    path('reimbursements/', ReimbursementListCreateView.as_view(), name='finance-reimbursements'),
    path(
        'reimbursements/<int:pk>/approve/',
        ApproveReimbursementView.as_view(),
        name='finance-reimbursement-approve',
    ),
    path(
        'reimbursements/<int:pk>/reject/',
        RejectReimbursementView.as_view(),
        name='finance-reimbursement-reject',
    ),
    path(
        'reimbursements/<int:pk>/mark-paid/',
        MarkPaidReimbursementView.as_view(),
        name='finance-reimbursement-mark-paid',
    ),
    path(
        'reimbursements/<int:pk>/receipt/',
        ReimbursementReceiptView.as_view(),
        name='finance-reimbursement-receipt',
    ),
]
