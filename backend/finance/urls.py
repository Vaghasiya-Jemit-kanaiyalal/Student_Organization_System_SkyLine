from django.urls import path
from .views import (
    FinanceDashboardView,
    TransactionListCreateView,
    ReimbursementListCreateView,
    ApproveReimbursementView,
    RejectReimbursementView,
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

# Clean API routes matching the system requirements: /api/payments/... and /api/merchandise/...
payment_urlpatterns = [
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

