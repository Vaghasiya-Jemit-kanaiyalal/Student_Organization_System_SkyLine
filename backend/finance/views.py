from calendar import month_name
from datetime import date
from decimal import Decimal

from django.db.models import Q, Sum
from django.http import FileResponse, Http404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsTreasurer, IsTreasurerOrAdminReadOnly
from .models import ReimbursementRequest, Transaction
from .serializers import (
    RecordPaymentSerializer,
    RefundTransactionSerializer,
    ReimbursementRequestSerializer,
    ReimbursementReviewActionSerializer,
    TransactionSerializer,
)
from .services import (
    active_expense_queryset,
    active_income_queryset,
    mark_transaction_refunded,
    record_expense_payment,
    record_income_payment,
)


def _decimal_or_zero(value):
    return float(value or 0)


def _sum_by_category(queryset, categories):
    result = {}
    for cat in categories:
        total = queryset.filter(category=cat).aggregate(total=Sum('amount'))['total'] or 0
        result[cat] = _decimal_or_zero(total)
    return result


def _parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def _apply_date_filters(queryset, request):
    start = _parse_date(request.query_params.get('start_date'))
    end = _parse_date(request.query_params.get('end_date'))
    if start:
        queryset = queryset.filter(date__gte=start)
    if end:
        queryset = queryset.filter(date__lte=end)
    return queryset


def _is_finance_officer(user):
    return bool(
        user and user.is_authenticated and (
            user.role in ['TREASURER', 'ADMIN'] or user.is_superuser
        )
    )


class FinanceDashboardView(APIView):
    """
    GET /api/finance/  |  GET /api/finance/dashboard/  |  GET /api/finance/summary/
    Protected: Treasurer full access; Admin read-only summary from live ledger rows.
    """
    permission_classes = [IsTreasurerOrAdminReadOnly]

    def get(self, request):
        income_qs = active_income_queryset()
        expense_qs = active_expense_queryset()
        income_qs = _apply_date_filters(income_qs, request)
        expense_qs = _apply_date_filters(expense_qs, request)

        total_income = income_qs.aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = expense_qs.aggregate(total=Sum('amount'))['total'] or 0
        net_balance = total_income - total_expenses

        pending_reimbursements = ReimbursementRequest.objects.filter(
            status=ReimbursementRequest.Status.PENDING
        )
        pending_count = pending_reimbursements.count()
        pending_amount = pending_reimbursements.aggregate(total=Sum('amount'))['total'] or 0

        revenue_breakdown = {
            'membership': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.MEMBERSHIP_FEE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'events': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.EVENT_TICKET)
                .aggregate(total=Sum('amount'))['total']
            ),
            'merchandise': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.MERCHANDISE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'fundraiser': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.FUNDRAISER)
                .aggregate(total=Sum('amount'))['total']
            ),
            'sponsorship': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.SPONSORSHIP)
                .aggregate(total=Sum('amount'))['total']
            ),
            'other': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.OTHER)
                .aggregate(total=Sum('amount'))['total']
            ),
        }

        expense_breakdown = _sum_by_category(
            expense_qs,
            [
                Transaction.Category.EVENT_EXPENSE,
                Transaction.Category.MERCHANDISE,
                Transaction.Category.FUNDRAISER_EXPENSE,
                Transaction.Category.OPERATIONAL,
                Transaction.Category.REIMBURSEMENT,
                Transaction.Category.OTHER,
            ],
        )

        recent_transactions = Transaction.objects.select_related('recorded_by').all()[:10]
        recent_reimbursements = (
            ReimbursementRequest.objects.select_related('requested_by', 'reviewed_by', 'event')
            .all()[:5]
        )

        # Monthly trend (last 6 calendar months present in data, or current year)
        monthly = []
        today = timezone.now().date()
        for months_ago in range(5, -1, -1):
            year = today.year
            month = today.month - months_ago
            while month <= 0:
                month += 12
                year -= 1
            label = f'{month_name[month][:3]} {year}'
            month_income = income_qs.filter(date__year=year, date__month=month).aggregate(
                total=Sum('amount')
            )['total'] or 0
            month_expense = expense_qs.filter(date__year=year, date__month=month).aggregate(
                total=Sum('amount')
            )['total'] or 0
            monthly.append({
                'label': label,
                'year': year,
                'month': month,
                'income': _decimal_or_zero(month_income),
                'expenses': _decimal_or_zero(month_expense),
                'net': _decimal_or_zero(month_income - month_expense),
            })

        return Response({
            'success': True,
            'data': {
                'total_income': _decimal_or_zero(total_income),
                'total_expenses': _decimal_or_zero(total_expenses),
                'net_balance': _decimal_or_zero(net_balance),
                'current_balance': _decimal_or_zero(net_balance),
                'pending_reimbursements_count': pending_count,
                'pending_reimbursements_amount': _decimal_or_zero(pending_amount),
                'revenue_breakdown': revenue_breakdown,
                'expense_breakdown': expense_breakdown,
                'monthly_trend': monthly,
                'recent_transactions': TransactionSerializer(
                    recent_transactions, many=True, context={'request': request}
                ).data,
                'recent_reimbursements': ReimbursementRequestSerializer(
                    recent_reimbursements, many=True, context={'request': request}
                ).data,
            },
        }, status=status.HTTP_200_OK)


class TransactionListCreateView(generics.ListCreateAPIView):
    """
    GET /api/finance/transactions/ -> List transactions (Treasurer; Admin read-only)
    POST /api/finance/transactions/ -> Record a transaction (Treasurer only)
    Supports filters: type, category, status, search, start_date, end_date, ordering
    """
    permission_classes = [IsTreasurerOrAdminReadOnly]
    serializer_class = TransactionSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTreasurer()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Transaction.objects.select_related('recorded_by').all()
        params = self.request.query_params

        t_type = params.get('type')
        category = params.get('category')
        txn_status = params.get('status')
        search = params.get('search')
        ordering = params.get('ordering')

        if t_type:
            queryset = queryset.filter(transaction_type=t_type.upper())
        if category:
            queryset = queryset.filter(category=category.upper())
        if txn_status:
            queryset = queryset.filter(status=txn_status.upper())
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(transaction_id__icontains=search)
                | Q(party_name__icontains=search)
                | Q(reference_id__icontains=search)
            )

        queryset = _apply_date_filters(queryset, self.request)

        allowed_ordering = {
            'amount', '-amount', 'date', '-date', 'created_at', '-created_at', 'title', '-title'
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        payload = {
            'success': True,
            'data': serializer.data,
            'count': queryset.count() if page is None else self.paginator.page.paginator.count,
        }
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(payload, status=status.HTTP_200_OK)


class IncomeListView(TransactionListCreateView):
    """GET /api/finance/income/ — paid income only (refunded excluded from default)."""

    def get_queryset(self):
        qs = super().get_queryset().filter(transaction_type=Transaction.Type.INCOME)
        include_refunded = self.request.query_params.get('include_refunded', '').lower() in (
            '1', 'true', 'yes'
        )
        if not include_refunded and not self.request.query_params.get('status'):
            qs = qs.filter(status=Transaction.Status.PAID)
        return qs

    def post(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data['transaction_type'] = Transaction.Type.INCOME
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ExpenseListView(TransactionListCreateView):
    """GET /api/finance/expenses/ — expense ledger + approve/reject/mark-paid style status."""

    def get_queryset(self):
        return super().get_queryset().filter(transaction_type=Transaction.Type.EXPENSE)

    def post(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data['transaction_type'] = Transaction.Type.EXPENSE
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TransactionDetailView(generics.RetrieveAPIView):
    permission_classes = [IsTreasurer]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.select_related('recorded_by').all()


class RefundTransactionView(APIView):
    """
    POST /api/finance/transactions/<pk>/refund/
    Marks income as REFUNDED; preserves original row for audit history.
    """
    permission_classes = [IsTreasurer]

    def post(self, request, pk):
        try:
            txn = Transaction.objects.get(pk=pk)
        except Transaction.DoesNotExist:
            return Response({
                'success': False,
                'error': 'NotFound',
                'details': 'Transaction not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = RefundTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated, changed = mark_transaction_refunded(
                txn,
                recorded_by=request.user,
                notes=serializer.validated_data.get('notes', ''),
            )
        except ValueError as exc:
            return Response({
                'success': False,
                'error': 'InvalidOperation',
                'details': str(exc),
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'message': 'Transaction already refunded.' if not changed else 'Transaction marked as refunded.',
            'data': TransactionSerializer(updated, context={'request': request}).data,
        }, status=status.HTTP_200_OK)


class RecordPaymentView(APIView):
    """
    POST /api/finance/payments/record/
    Authenticated members (or officers) record a successful payment into the ledger.
    Idempotent on (reference_type, reference_id).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RecordPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        party = data.get('party_name') or getattr(request.user, 'full_name', '') or request.user.email

        try:
            txn, created = record_income_payment(
                title=data['title'],
                amount=data['amount'],
                reference_type=data['reference_type'],
                reference_id=data['reference_id'],
                description=data.get('description', ''),
                party_name=party,
                category=data.get('category'),
                date=data.get('date'),
                recorded_by=request.user,
            )
        except ValueError as exc:
            return Response({
                'success': False,
                'error': 'ValidationError',
                'details': str(exc),
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'created': created,
            'message': 'Income recorded.' if created else 'Existing payment already recorded (idempotent).',
            'data': TransactionSerializer(txn, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ReimbursementListCreateView(generics.ListCreateAPIView):
    """
    GET/POST /api/finance/reimbursements/
    Members see/create own claims; Treasurer/Admin see all.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReimbursementRequestSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if _is_finance_officer(user):
            queryset = ReimbursementRequest.objects.select_related(
                'requested_by', 'reviewed_by', 'event', 'linked_transaction'
            ).all()
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param.upper())
            return queryset
        return ReimbursementRequest.objects.filter(requested_by=user).select_related(
            'requested_by', 'reviewed_by', 'event', 'linked_transaction'
        )


class ApproveReimbursementView(APIView):
    """
    POST /api/finance/reimbursements/<pk>/approve/
    Approves claim only — expense is created when marked paid (no double posting).
    """
    permission_classes = [IsTreasurer]

    def post(self, request, pk):
        try:
            claim = ReimbursementRequest.objects.get(pk=pk)
        except ReimbursementRequest.DoesNotExist:
            return Response({
                'success': False,
                'error': 'NotFound',
                'details': 'Reimbursement claim not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        if claim.status != ReimbursementRequest.Status.PENDING:
            return Response({
                'success': False,
                'error': 'InvalidOperation',
                'details': f'Claim cannot be approved from status {claim.status}.',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReimbursementReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        claim.status = ReimbursementRequest.Status.APPROVED
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.treasurer_notes = serializer.validated_data.get('treasurer_notes', '')
        claim.save()

        return Response({
            'success': True,
            'message': f'Reimbursement claim of {claim.amount} approved. Mark as paid to post the expense.',
            'data': ReimbursementRequestSerializer(claim, context={'request': request}).data,
        }, status=status.HTTP_200_OK)


class RejectReimbursementView(APIView):
    permission_classes = [IsTreasurer]

    def post(self, request, pk):
        try:
            claim = ReimbursementRequest.objects.get(pk=pk)
        except ReimbursementRequest.DoesNotExist:
            return Response({
                'success': False,
                'error': 'NotFound',
                'details': 'Reimbursement claim not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        if claim.status != ReimbursementRequest.Status.PENDING:
            return Response({
                'success': False,
                'error': 'InvalidOperation',
                'details': f'Claim cannot be rejected from status {claim.status}.',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReimbursementReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        claim.status = ReimbursementRequest.Status.REJECTED
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.treasurer_notes = serializer.validated_data.get('treasurer_notes', '')
        claim.save()

        return Response({
            'success': True,
            'message': f'Reimbursement claim of {claim.amount} has been REJECTED.',
            'data': ReimbursementRequestSerializer(claim, context={'request': request}).data,
        }, status=status.HTTP_200_OK)


class MarkPaidReimbursementView(APIView):
    """
    POST /api/finance/reimbursements/<pk>/mark-paid/
    Finalizes payout and creates a single EXPENSE transaction (idempotent).
    """
    permission_classes = [IsTreasurer]

    def post(self, request, pk):
        try:
            claim = ReimbursementRequest.objects.select_related(
                'requested_by', 'linked_transaction'
            ).get(pk=pk)
        except ReimbursementRequest.DoesNotExist:
            return Response({
                'success': False,
                'error': 'NotFound',
                'details': 'Reimbursement claim not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        if claim.status == ReimbursementRequest.Status.REJECTED:
            return Response({
                'success': False,
                'error': 'InvalidOperation',
                'details': 'Cannot pay a rejected reimbursement.',
            }, status=status.HTTP_400_BAD_REQUEST)

        if claim.status == ReimbursementRequest.Status.PENDING:
            return Response({
                'success': False,
                'error': 'InvalidOperation',
                'details': 'Approve the reimbursement before marking it paid.',
            }, status=status.HTTP_400_BAD_REQUEST)

        if claim.status == ReimbursementRequest.Status.PAID and claim.linked_transaction_id:
            return Response({
                'success': True,
                'message': 'Reimbursement already marked paid.',
                'data': ReimbursementRequestSerializer(claim, context={'request': request}).data,
            }, status=status.HTTP_200_OK)

        if claim.status != ReimbursementRequest.Status.APPROVED and claim.status != ReimbursementRequest.Status.PAID:
            return Response({
                'success': False,
                'error': 'InvalidOperation',
                'details': f'Cannot mark paid from status {claim.status}.',
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReimbursementReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notes = serializer.validated_data.get('treasurer_notes', '') or claim.treasurer_notes

        activity = claim.related_activity or (claim.event.title if claim.event_id else '')
        description = claim.description
        if activity:
            description = f'{description} | Activity: {activity}'
        if notes:
            description = f'{description} | Notes: {notes}'

        txn, created = record_expense_payment(
            title=f'Reimbursement: {claim.title} ({claim.requested_by.full_name})',
            amount=claim.amount,
            reference_type=Transaction.ReferenceType.REIMBURSEMENT,
            reference_id=f'reimbursement-{claim.pk}',
            description=description,
            party_name=claim.requested_by.full_name,
            category=Transaction.Category.REIMBURSEMENT,
            recorded_by=request.user,
            status=Transaction.Status.PAID,
        )

        claim.status = ReimbursementRequest.Status.PAID
        claim.paid_at = timezone.now()
        claim.linked_transaction = txn
        if notes:
            claim.treasurer_notes = notes
        if not claim.reviewed_by_id:
            claim.reviewed_by = request.user
            claim.reviewed_at = timezone.now()
        claim.save()

        return Response({
            'success': True,
            'created_expense': created,
            'message': f'Reimbursement of {claim.amount} marked paid and expense recorded.',
            'data': ReimbursementRequestSerializer(claim, context={'request': request}).data,
        }, status=status.HTTP_200_OK)


class ReimbursementReceiptView(APIView):
    """
    GET /api/finance/reimbursements/<pk>/receipt/
    Secure receipt download — owner or finance officer only.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            claim = ReimbursementRequest.objects.get(pk=pk)
        except ReimbursementRequest.DoesNotExist:
            raise Http404

        is_owner = claim.requested_by_id == request.user.id
        if not (is_owner or _is_finance_officer(request.user)):
            return Response({
                'success': False,
                'error': 'PermissionDenied',
                'details': 'You are not allowed to access this receipt.',
            }, status=status.HTTP_403_FORBIDDEN)

        if not claim.receipt_file:
            return Response({
                'success': False,
                'error': 'NotFound',
                'details': 'No receipt file attached to this claim.',
            }, status=status.HTTP_404_NOT_FOUND)

        return FileResponse(
            claim.receipt_file.open('rb'),
            as_attachment=False,
            filename=claim.receipt_file.name.split('/')[-1],
        )


class FinanceReportsView(APIView):
    """
    GET /api/finance/reports/
    Income/expense summaries, category breakdowns, monthly & semester aggregates.
    Query: start_date, end_date, semester=fall|spring|summer|all, year=YYYY
    """
    permission_classes = [IsTreasurer]

    def get(self, request):
        year = request.query_params.get('year')
        try:
            year = int(year) if year else timezone.now().year
        except ValueError:
            year = timezone.now().year

        semester = (request.query_params.get('semester') or 'all').lower()
        start = _parse_date(request.query_params.get('start_date'))
        end = _parse_date(request.query_params.get('end_date'))

        # Semester date windows (Northern Hemisphere academic calendar)
        if not start and not end and semester != 'all':
            if semester == 'fall':
                start, end = date(year, 8, 1), date(year, 12, 31)
                semester_label = f'Fall {year}'
            elif semester == 'spring':
                start, end = date(year, 1, 1), date(year, 5, 31)
                semester_label = f'Spring {year}'
            elif semester == 'summer':
                start, end = date(year, 6, 1), date(year, 7, 31)
                semester_label = f'Summer {year}'
            else:
                semester_label = f'Academic Year {year}'
        else:
            semester_label = f'Custom Range' if start or end else f'Year {year}'

        income_qs = active_income_queryset()
        expense_qs = active_expense_queryset()

        if start:
            income_qs = income_qs.filter(date__gte=start)
            expense_qs = expense_qs.filter(date__gte=start)
        elif semester == 'all' and not request.query_params.get('start_date'):
            income_qs = income_qs.filter(date__year=year)
            expense_qs = expense_qs.filter(date__year=year)

        if end:
            income_qs = income_qs.filter(date__lte=end)
            expense_qs = expense_qs.filter(date__lte=end)

        total_income = income_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        total_expenses = expense_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')

        income_summary = {
            'membership': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.MEMBERSHIP_FEE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'events': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.EVENT_TICKET)
                .aggregate(total=Sum('amount'))['total']
            ),
            'merchandise': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.MERCHANDISE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'fundraiser': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.FUNDRAISER)
                .aggregate(total=Sum('amount'))['total']
            ),
            'sponsorship': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.SPONSORSHIP)
                .aggregate(total=Sum('amount'))['total']
            ),
            'other': _decimal_or_zero(
                income_qs.filter(category=Transaction.Category.OTHER)
                .aggregate(total=Sum('amount'))['total']
            ),
        }

        expense_summary = {
            'events': _decimal_or_zero(
                expense_qs.filter(category=Transaction.Category.EVENT_EXPENSE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'merchandise': _decimal_or_zero(
                expense_qs.filter(category=Transaction.Category.MERCHANDISE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'fundraiser': _decimal_or_zero(
                expense_qs.filter(category=Transaction.Category.FUNDRAISER_EXPENSE)
                .aggregate(total=Sum('amount'))['total']
            ),
            'operations': _decimal_or_zero(
                expense_qs.filter(category=Transaction.Category.OPERATIONAL)
                .aggregate(total=Sum('amount'))['total']
            ),
            'reimbursements': _decimal_or_zero(
                expense_qs.filter(category=Transaction.Category.REIMBURSEMENT)
                .aggregate(total=Sum('amount'))['total']
            ),
            'other': _decimal_or_zero(
                expense_qs.filter(category=Transaction.Category.OTHER)
                .aggregate(total=Sum('amount'))['total']
            ),
        }

        monthly_summary = []
        for month in range(1, 13):
            mi = income_qs.filter(date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            me = expense_qs.filter(date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            if mi or me:
                monthly_summary.append({
                    'month': month,
                    'label': month_name[month],
                    'income': _decimal_or_zero(mi),
                    'expenses': _decimal_or_zero(me),
                    'net': _decimal_or_zero(mi - me),
                })

        return Response({
            'success': True,
            'data': {
                'period': {
                    'label': semester_label,
                    'semester': semester,
                    'year': year,
                    'start_date': start.isoformat() if start else None,
                    'end_date': end.isoformat() if end else None,
                },
                'total_income': _decimal_or_zero(total_income),
                'total_expenses': _decimal_or_zero(total_expenses),
                'net_balance': _decimal_or_zero(total_income - total_expenses),
                'income_summary': income_summary,
                'expense_summary': expense_summary,
                'monthly_summary': monthly_summary,
                'semester_summary': {
                    'label': semester_label,
                    'income': income_summary,
                    'expenses': expense_summary,
                    'total_income': _decimal_or_zero(total_income),
                    'total_expenses': _decimal_or_zero(total_expenses),
                    'net_balance': _decimal_or_zero(total_income - total_expenses),
                },
            },
        }, status=status.HTTP_200_OK)
