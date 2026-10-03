from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsTreasurer, IsTreasurerOrAdminReadOnly
from .models import Transaction, ReimbursementRequest
from .serializers import (
    TransactionSerializer,
    ReimbursementRequestSerializer,
    ReimbursementReviewActionSerializer,
)


class FinanceDashboardView(APIView):
    """
    GET /api/finance/
    Protected: Treasurer full access; Admin read-only summary.
    """
    permission_classes = [IsTreasurerOrAdminReadOnly]

    def get(self, request):
        total_income = Transaction.objects.filter(
            transaction_type=Transaction.Type.INCOME
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_expenses = Transaction.objects.filter(
            transaction_type=Transaction.Type.EXPENSE
        ).aggregate(total=Sum('amount'))['total'] or 0

        net_balance = total_income - total_expenses

        pending_reimbursements = ReimbursementRequest.objects.filter(
            status=ReimbursementRequest.Status.PENDING
        ).count()

        recent_transactions = Transaction.objects.select_related('recorded_by').all()[:5]

        return Response({
            "success": True,
            "data": {
                "total_income": float(total_income),
                "total_expenses": float(total_expenses),
                "net_balance": float(net_balance),
                "pending_reimbursements_count": pending_reimbursements,
                "recent_transactions": TransactionSerializer(recent_transactions, many=True).data
            }
        }, status=status.HTTP_200_OK)


class TransactionListCreateView(generics.ListCreateAPIView):
    """
    GET /api/finance/transactions/ -> List transactions (Treasurer; Admin read-only)
    POST /api/finance/transactions/ -> Record a transaction (Treasurer only)
    """
    permission_classes = [IsTreasurerOrAdminReadOnly]
    serializer_class = TransactionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTreasurer()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = Transaction.objects.select_related('recorded_by').all()
        t_type = self.request.query_params.get('type', None)
        category = self.request.query_params.get('category', None)

        if t_type:
            queryset = queryset.filter(transaction_type=t_type.upper())
        if category:
            queryset = queryset.filter(category=category.upper())

        return queryset


class ReimbursementListCreateView(generics.ListCreateAPIView):
    """
    GET /api/finance/reimbursements/
    - Treasurer/Admin: views all reimbursements
    - Member: views own reimbursements
    POST /api/finance/reimbursements/
    - Any authenticated user can submit a reimbursement claim
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReimbursementRequestSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['TREASURER', 'ADMIN'] or user.is_superuser:
            queryset = ReimbursementRequest.objects.select_related('requested_by', 'reviewed_by').all()
            status_param = self.request.query_params.get('status', None)
            if status_param:
                queryset = queryset.filter(status=status_param.upper())
            return queryset
        return ReimbursementRequest.objects.filter(requested_by=user).select_related('requested_by', 'reviewed_by')


class ApproveReimbursementView(APIView):
    """
    POST /api/finance/reimbursements/<int:pk>/approve/
    Protected: Only Treasurer or Admin can approve reimbursement.
    Automatically generates an EXPENSE transaction upon approval.
    """
    permission_classes = [IsTreasurer]

    def post(self, request, pk):
        try:
            claim = ReimbursementRequest.objects.get(pk=pk)
        except ReimbursementRequest.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Reimbursement claim not found."
            }, status=status.HTTP_404_NOT_FOUND)

        if claim.status != ReimbursementRequest.Status.PENDING:
            return Response({
                "success": False,
                "error": "InvalidOperation",
                "details": f"Claim has already been reviewed ({claim.status})."
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReimbursementReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        claim.status = ReimbursementRequest.Status.APPROVED
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.treasurer_notes = serializer.validated_data.get('treasurer_notes', '')
        claim.save()

        # Automatically record as an expense transaction
        Transaction.objects.create(
            title=f"Reimbursement: {claim.title} ({claim.requested_by.full_name})",
            amount=claim.amount,
            transaction_type=Transaction.Type.EXPENSE,
            category=Transaction.Category.REIMBURSEMENT,
            description=f"Approved reimbursement for {claim.requested_by.full_name}. Notes: {claim.treasurer_notes}",
            date=timezone.now().date(),
            recorded_by=request.user
        )

        return Response({
            "success": True,
            "message": f"Reimbursement claim of ${claim.amount} approved and expense recorded.",
            "data": ReimbursementRequestSerializer(claim).data
        }, status=status.HTTP_200_OK)


class RejectReimbursementView(APIView):
    """
    POST /api/finance/reimbursements/<int:pk>/reject/
    Protected: Only Treasurer or Admin can reject reimbursement.
    """
    permission_classes = [IsTreasurer]

    def post(self, request, pk):
        try:
            claim = ReimbursementRequest.objects.get(pk=pk)
        except ReimbursementRequest.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Reimbursement claim not found."
            }, status=status.HTTP_404_NOT_FOUND)

        if claim.status != ReimbursementRequest.Status.PENDING:
            return Response({
                "success": False,
                "error": "InvalidOperation",
                "details": f"Claim has already been reviewed ({claim.status})."
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReimbursementReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        claim.status = ReimbursementRequest.Status.REJECTED
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.treasurer_notes = serializer.validated_data.get('treasurer_notes', '')
        claim.save()

        return Response({
            "success": True,
            "message": f"Reimbursement claim of ${claim.amount} has been REJECTED.",
            "data": ReimbursementRequestSerializer(claim).data
        }, status=status.HTTP_200_OK)
