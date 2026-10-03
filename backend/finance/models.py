import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


def receipt_upload_path(instance, filename):
    return f'receipts/reimbursements/{instance.requested_by_id}/{uuid.uuid4().hex}_{filename}'


class Transaction(models.Model):
    """
    Centralized financial ledger for the student organization.
    Income from memberships, tickets, merchandise, and fundraisers, plus
    expenses (including paid reimbursements), are recorded here.
    """

    class Type(models.TextChoices):
        INCOME = 'INCOME', _('Income')
        EXPENSE = 'EXPENSE', _('Expense')

    class Category(models.TextChoices):
        MEMBERSHIP_FEE = 'MEMBERSHIP_FEE', _('Membership Fee')
        EVENT_TICKET = 'EVENT_TICKET', _('Event Ticket')
        MERCHANDISE = 'MERCHANDISE', _('Merchandise')
        FUNDRAISER = 'FUNDRAISER', _('Fundraiser')
        SPONSORSHIP = 'SPONSORSHIP', _('Sponsorship')
        EVENT_EXPENSE = 'EVENT_EXPENSE', _('Event Expense')
        FUNDRAISER_EXPENSE = 'FUNDRAISER_EXPENSE', _('Fundraiser Expense')
        OPERATIONAL = 'OPERATIONAL', _('Operational')
        REIMBURSEMENT = 'REIMBURSEMENT', _('Reimbursement')
        OTHER = 'OTHER', _('Other')

    class Status(models.TextChoices):
        PAID = 'PAID', _('Paid')
        PENDING = 'PENDING', _('Pending')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    class ReferenceType(models.TextChoices):
        MEMBERSHIP = 'MEMBERSHIP', _('Membership Purchase')
        EVENT_TICKET = 'EVENT_TICKET', _('Event Ticket Purchase')
        MERCHANDISE = 'MERCHANDISE', _('Merchandise Order')
        FUNDRAISER = 'FUNDRAISER', _('Fundraiser Payment')
        REIMBURSEMENT = 'REIMBURSEMENT', _('Reimbursement Payout')
        MANUAL = 'MANUAL', _('Manual Entry')
        REFUND = 'REFUND', _('Refund Adjustment')

    transaction_id = models.CharField(
        _('transaction ID'),
        max_length=40,
        unique=True,
        blank=True,
        help_text=_('Human-readable unique ledger ID (auto-generated if blank).'),
    )
    title = models.CharField(_('transaction title'), max_length=200)
    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    transaction_type = models.CharField(
        _('type'),
        max_length=10,
        choices=Type.choices,
        default=Type.INCOME,
    )
    category = models.CharField(
        _('category'),
        max_length=30,
        choices=Category.choices,
        default=Category.OTHER,
    )
    description = models.TextField(_('description'), blank=True)
    party_name = models.CharField(
        _('student / customer / vendor'),
        max_length=150,
        blank=True,
    )
    status = models.CharField(
        _('payment / ledger status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PAID,
    )
    reference_type = models.CharField(
        _('source reference type'),
        max_length=30,
        choices=ReferenceType.choices,
        default=ReferenceType.MANUAL,
        blank=True,
    )
    reference_id = models.CharField(
        _('source reference ID'),
        max_length=100,
        blank=True,
        db_index=True,
        help_text=_('Idempotency key for the originating payment or claim.'),
    )
    date = models.DateField(_('transaction date'))
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_transactions',
    )
    created_at = models.DateTimeField(_('recorded at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = _('Transaction')
        verbose_name_plural = _('Transactions')
        constraints = [
            models.UniqueConstraint(
                fields=['reference_type', 'reference_id'],
                condition=~models.Q(reference_id=''),
                name='uniq_finance_txn_reference',
            ),
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name='finance_transaction_amount_positive',
            ),
        ]

    def clean(self):
        if self.amount is not None and self.amount <= 0:
            raise ValidationError({'amount': _('Amount must be positive.')})

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            prefix = 'INC' if self.transaction_type == self.Type.INCOME else 'EXP'
            self.transaction_id = f'TXN-{prefix}-{uuid.uuid4().hex[:8].upper()}'
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.transaction_type}] {self.transaction_id} {self.title} - {self.amount}"


class ReimbursementRequest(models.Model):
    """
    Reimbursement claims submitted for organization expenses.
    Flow: PENDING → APPROVED|REJECTED → (if approved) PAID → linked expense Transaction.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        PAID = 'PAID', _('Paid')

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reimbursements',
    )
    title = models.CharField(_('claim title'), max_length=200)
    amount = models.DecimalField(
        _('claim amount'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    description = models.TextField(_('purpose and details'))
    receipt_reference = models.CharField(
        _('receipt reference or URL'),
        max_length=255,
        blank=True,
    )
    receipt_file = models.FileField(
        _('receipt file'),
        upload_to=receipt_upload_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['pdf', 'png', 'jpg', 'jpeg', 'webp'])],
    )
    event = models.ForeignKey(
        'volunteers.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reimbursements',
    )
    related_activity = models.CharField(
        _('event / fundraiser label'),
        max_length=200,
        blank=True,
        help_text=_('Free-text activity label when no Event FK is available.'),
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reimbursements',
    )
    reviewed_at = models.DateTimeField(_('reviewed at'), null=True, blank=True)
    paid_at = models.DateTimeField(_('paid at'), null=True, blank=True)
    treasurer_notes = models.TextField(_('treasurer notes'), blank=True)
    linked_transaction = models.OneToOneField(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_reimbursement',
    )
    created_at = models.DateTimeField(_('requested at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Reimbursement Request')
        verbose_name_plural = _('Reimbursement Requests')
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gt=0),
                name='finance_reimbursement_amount_positive',
            ),
        ]

    def clean(self):
        if self.amount is not None and self.amount <= 0:
            raise ValidationError({'amount': _('Amount must be positive.')})

    def __str__(self):
        return (
            f"{self.title} ({self.amount}) by "
            f"{self.requested_by.full_name} [{self.status}]"
        )


class Payment(models.Model):
    """
    Skyline Core Payment record for Event Tickets, Merchandise, Memberships, and Donations.
    Supports both simulated DemoPaymentService and future Payment Gateways.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        PROCESSING = 'PROCESSING', _('Processing')
        SUCCESS = 'SUCCESS', _('Success')
        FAILED = 'FAILED', _('Failed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        REFUNDED = 'REFUNDED', _('Refunded')

    class PaymentType(models.TextChoices):
        EVENT_TICKET = 'EVENT_TICKET', _('Event Ticket')
        MERCHANDISE = 'MERCHANDISE', _('Merchandise')
        MEMBERSHIP = 'MEMBERSHIP', _('Membership')
        DONATION = 'DONATION', _('Donation')
        OTHER_PURCHASE = 'OTHER_PURCHASE', _('Other Purchase')

    class PaymentMode(models.TextChoices):
        DEMO = 'DEMO', _('Demo / Simulated')
        RAZORPAY = 'RAZORPAY', _('Razorpay Gateway')
        OFFLINE = 'OFFLINE', _('Offline / Cash')

    transaction_id = models.CharField(
        _('transaction ID'),
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(_('amount'), max_digits=12, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=10, default='INR')
    payment_mode = models.CharField(
        _('payment mode'),
        max_length=20,
        choices=PaymentMode.choices,
        default=PaymentMode.DEMO,
        db_index=True
    )
    razorpay_order_id = models.CharField(_('razorpay order ID'), max_length=100, blank=True, default='', db_index=True)
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
        default=PaymentType.EVENT_TICKET,
        db_index=True
    )
    event = models.ForeignKey(
        'volunteers.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    ticket = models.ForeignKey(
        'volunteers.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ticket_payments'
    )
    merchandise_order = models.ForeignKey(
        'finance.MerchandiseOrder',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_payments'
    )
    metadata = models.JSONField(_('extra payment metadata'), default=dict, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['payment_mode']),
            models.Index(fields=['status']),
            models.Index(fields=['payment_type']),
        ]

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            import random
            today_str = timezone.now().strftime('%Y%m%d')
            rand_code = f"{random.randint(100000, 999999)}"
            self.transaction_id = f"SKY-DEMO-{today_str}-{rand_code}"
        if not self.razorpay_order_id:
            self.razorpay_order_id = f"order_{self.transaction_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id} ({self.payment_type}) - ₹{self.amount} [{self.status}]"



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
