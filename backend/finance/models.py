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
