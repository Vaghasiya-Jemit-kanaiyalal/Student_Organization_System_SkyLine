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
from .payment_views import (
    EventCreatePaymentView,
    MerchandiseOrderCreatePaymentView,
    RazorpayPaymentVerifyView,
    RazorpayWebhookView,
    MerchandiseProductListView,
    MerchandiseOrderListView,
    MerchandiseOrderDetailView,
    MerchandiseOrderPdfDownloadView,
    MerchandiseOrderQrVerifyView,
    MerchandiseOrderCollectView,
    DemoPaymentCreateView,
    DemoPaymentProcessView,
    DemoPaymentCompleteView,
    UserTransactionListView,
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

# Clean API routes matching the system requirements: /api/payments/... and /api/merchandise/...
payment_urlpatterns = [
    # Demo Payment Lifecycle
    path('payments/demo/create/', DemoPaymentCreateView.as_view(), name='demo-payment-create'),
    path('payments/demo/process/', DemoPaymentProcessView.as_view(), name='demo-payment-process'),
    path('payments/demo/complete/', DemoPaymentCompleteView.as_view(), name='demo-payment-complete'),
    path('payments/transactions/', UserTransactionListView.as_view(), name='user-transactions-list'),

    # Event Payment Creation
    path('events/<int:event_id>/create-payment/', EventCreatePaymentView.as_view(), name='event-create-payment'),

    # Razorpay Verification & Webhook
    path('payments/razorpay/verify/', RazorpayPaymentVerifyView.as_view(), name='razorpay-verify'),
    path('payments/razorpay/webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),

    # Merchandise Catalog & Orders
    path('merchandise/products/', MerchandiseProductListView.as_view(), name='merchandise-products-list'),
    path('merchandise/orders/', MerchandiseOrderListView.as_view(), name='merchandise-orders-list'),
    path('merchandise/orders/create-payment/', MerchandiseOrderCreatePaymentView.as_view(), name='merchandise-create-payment'),
    path('merchandise/orders/<str:order_id>/create-payment/', MerchandiseOrderCreatePaymentView.as_view(), name='merchandise-order-create-payment'),
    path('merchandise/orders/verify-qr/', MerchandiseOrderQrVerifyView.as_view(), name='merchandise-verify-qr'),
    path('merchandise/orders/<str:order_id>/', MerchandiseOrderDetailView.as_view(), name='merchandise-order-detail'),
    path('merchandise/orders/<str:order_id>/pdf/', MerchandiseOrderPdfDownloadView.as_view(), name='merchandise-order-pdf'),
    path('merchandise/orders/<str:order_id>/collect/', MerchandiseOrderCollectView.as_view(), name='merchandise-order-collect'),
]

