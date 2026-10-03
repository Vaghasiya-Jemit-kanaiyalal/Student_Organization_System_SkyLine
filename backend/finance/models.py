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
                check=models.Q(amount__gt=0),
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
                check=models.Q(amount__gt=0),
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
