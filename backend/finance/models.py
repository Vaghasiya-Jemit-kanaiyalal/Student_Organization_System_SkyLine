from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Transaction(models.Model):
    """
    Financial records for the student organization.
    """
    class Type(models.TextChoices):
        INCOME = 'INCOME', _('Income')
        EXPENSE = 'EXPENSE', _('Expense')

    class Category(models.TextChoices):
        MEMBERSHIP_FEE = 'MEMBERSHIP_FEE', _('Membership Fee')
        SPONSORSHIP = 'SPONSORSHIP', _('Sponsorship')
        EVENT_EXPENSE = 'EVENT_EXPENSE', _('Event Expense')
        MERCHANDISE = 'MERCHANDISE', _('Merchandise')
        OPERATIONAL = 'OPERATIONAL', _('Operational')
        REIMBURSEMENT = 'REIMBURSEMENT', _('Reimbursement')
        OTHER = 'OTHER', _('Other')

    title = models.CharField(_('transaction title'), max_length=200)
    amount = models.DecimalField(_('amount'), max_digits=12, decimal_places=2)
    transaction_type = models.CharField(
        _('type'),
        max_length=10,
        choices=Type.choices,
        default=Type.INCOME
    )
    category = models.CharField(
        _('category'),
        max_length=30,
        choices=Category.choices,
        default=Category.OTHER
    )
    description = models.TextField(_('description'), blank=True)
    date = models.DateField(_('transaction date'))
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_transactions'
    )
    created_at = models.DateTimeField(_('recorded at'), auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = _('Transaction')
        verbose_name_plural = _('Transactions')

    def __str__(self):
        return f"[{self.transaction_type}] {self.title} - ${self.amount}"


class ReimbursementRequest(models.Model):
    """
    Reimbursement claims submitted for student organization expenses.
    Treasurer reviews and either approves or rejects.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reimbursements'
    )
    title = models.CharField(_('claim title'), max_length=200)
    amount = models.DecimalField(_('claim amount'), max_digits=10, decimal_places=2)
    description = models.TextField(_('purpose and details'))
    receipt_reference = models.CharField(
        _('receipt reference or URL'),
        max_length=255,
        blank=True
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reimbursements'
    )
    reviewed_at = models.DateTimeField(_('reviewed at'), null=True, blank=True)
    treasurer_notes = models.TextField(_('treasurer notes'), blank=True)
    created_at = models.DateTimeField(_('requested at'), auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Reimbursement Request')
        verbose_name_plural = _('Reimbursement Requests')

    def __str__(self):
        return f"{self.title} (${self.amount}) by {self.requested_by.full_name} [{self.status}]"


class Payment(models.Model):
    """
    Razorpay & Skyline Core Payment record for Event Tickets, Merchandise, and Memberships.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SUCCESS = 'SUCCESS', _('Success')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')

    class PaymentType(models.TextChoices):
        EVENT_TICKET = 'EVENT_TICKET', _('Event Ticket')
        MERCHANDISE = 'MERCHANDISE', _('Merchandise')
        MEMBERSHIP = 'MEMBERSHIP', _('Membership')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(_('amount'), max_digits=12, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=10, default='INR')
    razorpay_order_id = models.CharField(_('razorpay order ID'), max_length=100, db_index=True)
    razorpay_payment_id = models.CharField(
        _('razorpay payment ID'),
        max_length=100,
        blank=True,
        null=True,
        db_index=True
    )
    razorpay_signature = models.CharField(_('razorpay signature'), max_length=255, blank=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    payment_type = models.CharField(
        _('payment type'),
        max_length=30,
        choices=PaymentType.choices,
        default=PaymentType.EVENT_TICKET
    )
    metadata = models.JSONField(_('extra payment metadata'), default=dict, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        indexes = [
            models.Index(fields=['razorpay_order_id']),
            models.Index(fields=['razorpay_payment_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Payment #{self.id} ({self.payment_type}) - ₹{self.amount} [{self.status}]"


class MerchandiseProduct(models.Model):
    """
    Catalog of official student organization apparel, gear, and accessories.
    """
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(_('item name'), max_length=200)
    type = models.CharField(_('type / apparel class'), max_length=100, default='Apparel')
    category = models.CharField(_('category'), max_length=100, default='General')
    regular_price = models.DecimalField(_('regular price'), max_digits=10, decimal_places=2, default=500.00)
    member_price = models.DecimalField(_('member price'), max_digits=10, decimal_places=2, default=350.00)
    description = models.TextField(_('description'), blank=True)
    image = models.TextField(
        _('product image url'),
        blank=True,
        default='https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
    )
    tag = models.CharField(_('featured tag'), max_length=100, blank=True)
    size_stock = models.JSONField(
        _('stock per size map'),
        default=dict,
        blank=True,
        help_text=_('JSON map of size to available quantity, e.g. {"S": 12, "M": 24, "L": 18}')
    )
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = _('Merchandise Product')
        verbose_name_plural = _('Merchandise Products')

    def __str__(self):
        return f"{self.name} ({self.type}) - Regular: ₹{self.regular_price} | Member: ₹{self.member_price}"

    @property
    def total_stock(self):
        if not self.size_stock or not isinstance(self.size_stock, dict):
            return 0
        return sum(int(v) for v in self.size_stock.values() if str(v).isdigit())


class MerchandiseOrder(models.Model):
    """
    Confirmed or pending student merchandise purchase with collection pass.
    """
    class OrderStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class CollectionStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending Payment')
        READY = 'READY_FOR_COLLECTION', _('Ready for Collection')
        COLLECTED = 'COLLECTED', _('Collected')

    order_id = models.CharField(_('order ID'), max_length=50, unique=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='merchandise_orders'
    )
    merchandise = models.ForeignKey(
        MerchandiseProduct,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    variant = models.CharField(_('size / variant'), max_length=50, default='M')
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    unit_price = models.DecimalField(_('unit price'), max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(_('total amount'), max_digits=10, decimal_places=2, default=0.00)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='merchandise_orders'
    )
    order_status = models.CharField(
        _('order status'),
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True
    )
    collection_status = models.CharField(
        _('collection status'),
        max_length=30,
        choices=CollectionStatus.choices,
        default=CollectionStatus.PENDING,
        db_index=True
    )
    qr_token = models.CharField(
        _('secure collection QR token'),
        max_length=120,
        unique=True,
        null=True,
        blank=True,
        db_index=True
    )
    qr_code = models.FileField(upload_to='merchandise/qr/', null=True, blank=True)
    pdf_file = models.FileField(upload_to='merchandise/pdf/', null=True, blank=True)
    collected_at = models.DateTimeField(_('collected at timestamp'), null=True, blank=True)
    collected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collected_orders'
    )
    pickup_location = models.CharField(_('pickup location'), max_length=255, default='Student Union Desk - Campus Hub')
    notes = models.TextField(_('notes / fulfillment notes'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Merchandise Order')
        verbose_name_plural = _('Merchandise Orders')

    def __str__(self):
        return f"{self.order_id} - {self.user.full_name} ({self.variant}) [{self.collection_status}]"

