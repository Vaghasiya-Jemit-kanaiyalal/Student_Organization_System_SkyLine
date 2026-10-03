"""
Finance ledger helpers — idempotent payment posting and refund handling.
"""
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import Transaction


CATEGORY_BY_REFERENCE = {
    Transaction.ReferenceType.MEMBERSHIP: Transaction.Category.MEMBERSHIP_FEE,
    Transaction.ReferenceType.EVENT_TICKET: Transaction.Category.EVENT_TICKET,
    Transaction.ReferenceType.MERCHANDISE: Transaction.Category.MERCHANDISE,
    Transaction.ReferenceType.FUNDRAISER: Transaction.Category.FUNDRAISER,
    Transaction.ReferenceType.REIMBURSEMENT: Transaction.Category.REIMBURSEMENT,
}


def _normalize_amount(amount):
    value = Decimal(str(amount))
    if value <= 0:
        raise ValueError('Amount must be positive.')
    return value.quantize(Decimal('0.01'))


def get_existing_by_reference(reference_type, reference_id):
    if not reference_id:
        return None
    return Transaction.objects.filter(
        reference_type=reference_type,
        reference_id=str(reference_id),
    ).first()


@transaction.atomic
def record_income_payment(
    *,
    title,
    amount,
    reference_type,
    reference_id,
    description='',
    party_name='',
    category=None,
    date=None,
    recorded_by=None,
    status=Transaction.Status.PAID,
):
    """
    Create an INCOME ledger row for a successful payment.
    Duplicate (reference_type, reference_id) returns the existing row — no second insert.
    """
    reference_id = str(reference_id or '').strip()
    if not reference_id:
        raise ValueError('reference_id is required for payment recording.')

    existing = get_existing_by_reference(reference_type, reference_id)
    if existing:
        return existing, False

    amount = _normalize_amount(amount)
    resolved_category = category or CATEGORY_BY_REFERENCE.get(
        reference_type, Transaction.Category.OTHER
    )

    try:
        txn = Transaction.objects.create(
            title=title,
            amount=amount,
            transaction_type=Transaction.Type.INCOME,
            category=resolved_category,
            description=description,
            party_name=party_name or '',
            status=status,
            reference_type=reference_type,
            reference_id=reference_id,
            date=date or timezone.now().date(),
            recorded_by=recorded_by,
        )
    except IntegrityError:
        existing = get_existing_by_reference(reference_type, reference_id)
        if existing:
            return existing, False
        raise

    return txn, True


@transaction.atomic
def record_expense_payment(
    *,
    title,
    amount,
    reference_type,
    reference_id,
    description='',
    party_name='',
    category=Transaction.Category.OTHER,
    date=None,
    recorded_by=None,
    status=Transaction.Status.PAID,
):
    """
    Create an EXPENSE ledger row with idempotent reference keys.
    """
    reference_id = str(reference_id or '').strip()
    if not reference_id:
        raise ValueError('reference_id is required for expense recording.')

    existing = get_existing_by_reference(reference_type, reference_id)
    if existing:
        return existing, False

    amount = _normalize_amount(amount)

    try:
        txn = Transaction.objects.create(
            title=title,
            amount=amount,
            transaction_type=Transaction.Type.EXPENSE,
            category=category,
            description=description,
            party_name=party_name or '',
            status=status,
            reference_type=reference_type,
            reference_id=reference_id,
            date=date or timezone.now().date(),
            recorded_by=recorded_by,
        )
    except IntegrityError:
        existing = get_existing_by_reference(reference_type, reference_id)
        if existing:
            return existing, False
        raise

    return txn, True


@transaction.atomic
def mark_transaction_refunded(txn, *, recorded_by=None, notes=''):
    """
    Mark an existing PAID income transaction as REFUNDED without deleting history.
    Does not create a duplicate income row; totals exclude REFUNDED statuses.
    """
    if txn.transaction_type != Transaction.Type.INCOME:
        raise ValueError('Only income transactions can be refunded via this helper.')
    if txn.status == Transaction.Status.REFUNDED:
        return txn, False
    if txn.status not in (Transaction.Status.PAID, Transaction.Status.PENDING):
        raise ValueError(f'Cannot refund transaction in status {txn.status}.')

    txn.status = Transaction.Status.REFUNDED
    if notes:
        suffix = f' | Refund note: {notes}'
        txn.description = (txn.description or '') + suffix
    txn.save(update_fields=['status', 'description', 'updated_at'])
    return txn, True


def active_income_queryset():
    return Transaction.objects.filter(
        transaction_type=Transaction.Type.INCOME,
        status=Transaction.Status.PAID,
    )


def active_expense_queryset():
    return Transaction.objects.filter(
        transaction_type=Transaction.Type.EXPENSE,
        status__in=[Transaction.Status.PAID, Transaction.Status.APPROVED],
    )
