from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Transaction, ReimbursementRequest


INCOME_CATEGORY_LABELS = {
    Transaction.Category.MEMBERSHIP_FEE: 'Membership Fees',
    Transaction.Category.EVENT_TICKET: 'Event Ticket Sales',
    Transaction.Category.MERCHANDISE: 'Merchandise Sales',
    Transaction.Category.FUNDRAISER: 'Fundraisers',
    Transaction.Category.SPONSORSHIP: 'Donations',
    Transaction.Category.OTHER: 'Other Income',
}

EXPENSE_CATEGORY_LABELS = {
    Transaction.Category.EVENT_EXPENSE: 'Event Expenses',
    Transaction.Category.MERCHANDISE: 'Merchandise Expenses',
    Transaction.Category.FUNDRAISER_EXPENSE: 'Fundraiser Expenses',
    Transaction.Category.OPERATIONAL: 'Operations',
    Transaction.Category.REIMBURSEMENT: 'Reimbursements',
    Transaction.Category.OTHER: 'Other Expenses',
}

FRONTEND_TO_BACKEND_INCOME = {
    'Membership Fees': Transaction.Category.MEMBERSHIP_FEE,
    'Event Ticket Sales': Transaction.Category.EVENT_TICKET,
    'Merchandise Sales': Transaction.Category.MERCHANDISE,
    'Fundraisers': Transaction.Category.FUNDRAISER,
    'Donations': Transaction.Category.SPONSORSHIP,
    'Other Income': Transaction.Category.OTHER,
}

FRONTEND_TO_BACKEND_EXPENSE = {
    'Venue': Transaction.Category.EVENT_EXPENSE,
    'Equipment': Transaction.Category.EVENT_EXPENSE,
    'Merchandise Expenses': Transaction.Category.MERCHANDISE,
    'Marketing / Printing': Transaction.Category.OPERATIONAL,
    'Fundraiser Expenses': Transaction.Category.FUNDRAISER_EXPENSE,
    'Event Expenses': Transaction.Category.EVENT_EXPENSE,
    'Other Expenses': Transaction.Category.OTHER,
    'Operations': Transaction.Category.OPERATIONAL,
    'Reimbursements': Transaction.Category.REIMBURSEMENT,
}


class TransactionSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.full_name')
    category_label = serializers.SerializerMethodField()
    display_date = serializers.SerializerMethodField()
    reference_id = serializers.CharField(required=False, allow_blank=True, default='')
    reference_type = serializers.CharField(required=False, allow_blank=True, default=Transaction.ReferenceType.MANUAL)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'transaction_id',
            'title',
            'amount',
            'transaction_type',
            'category',
            'category_label',
            'description',
            'party_name',
            'status',
            'reference_type',
            'reference_id',
            'date',
            'display_date',
            'recorded_by',
            'recorded_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'transaction_id',
            'recorded_by',
            'created_at',
            'updated_at',
            'category_label',
            'display_date',
        ]
        extra_kwargs = {
            'reference_id': {'required': False, 'allow_blank': True},
            'reference_type': {'required': False, 'allow_blank': True},
            'party_name': {'required': False, 'allow_blank': True},
            'status': {'required': False},
            'description': {'required': False, 'allow_blank': True},
        }

    def get_category_label(self, obj):
        if obj.transaction_type == Transaction.Type.INCOME:
            return INCOME_CATEGORY_LABELS.get(obj.category, obj.get_category_display())
        return EXPENSE_CATEGORY_LABELS.get(obj.category, obj.get_category_display())

    def get_display_date(self, obj):
        return obj.date.strftime('%d %b %Y') if obj.date else ''

    def validate_amount(self, value):
        if value is None or Decimal(str(value)) <= 0:
            raise serializers.ValidationError('Amount must be positive.')
        return value

    def validate(self, attrs):
        # Allow frontend-friendly category labels in create payloads
        category = attrs.get('category')
        txn_type = attrs.get(
            'transaction_type',
            getattr(self.instance, 'transaction_type', Transaction.Type.INCOME),
        )
        if category and category not in dict(Transaction.Category.choices):
            mapping = (
                FRONTEND_TO_BACKEND_INCOME
                if txn_type == Transaction.Type.INCOME
                else FRONTEND_TO_BACKEND_EXPENSE
            )
            mapped = mapping.get(category)
            if mapped:
                attrs['category'] = mapped
            else:
                raise serializers.ValidationError({'category': 'Invalid category.'})
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['recorded_by'] = user
        validated_data.setdefault('reference_type', Transaction.ReferenceType.MANUAL)
        validated_data.setdefault('status', Transaction.Status.PAID)
        return super().create(validated_data)


class ReimbursementRequestSerializer(serializers.ModelSerializer):
    requested_by_details = UserSerializer(source='requested_by', read_only=True)
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.full_name')
    event_title = serializers.ReadOnlyField(source='event.title')
    receipt_url = serializers.SerializerMethodField()
    linked_transaction_id = serializers.ReadOnlyField(source='linked_transaction.transaction_id')
    student_name = serializers.ReadOnlyField(source='requested_by.full_name')
    student_id = serializers.ReadOnlyField(source='requested_by.student_id')
    submitted_date = serializers.SerializerMethodField()

    class Meta:
        model = ReimbursementRequest
        fields = [
            'id',
            'requested_by',
            'requested_by_details',
            'student_name',
            'student_id',
            'title',
            'amount',
            'description',
            'receipt_reference',
            'receipt_file',
            'receipt_url',
            'event',
            'event_title',
            'related_activity',
            'status',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'paid_at',
            'treasurer_notes',
            'linked_transaction',
            'linked_transaction_id',
            'created_at',
            'updated_at',
            'submitted_date',
        ]
        read_only_fields = [
            'id',
            'requested_by',
            'status',
            'reviewed_by',
            'reviewed_at',
            'paid_at',
            'linked_transaction',
            'created_at',
            'updated_at',
            'receipt_url',
            'submitted_date',
        ]

    def get_receipt_url(self, obj):
        request = self.context.get('request')
        if obj.receipt_file and request:
            return request.build_absolute_uri(
                f'/api/finance/reimbursements/{obj.pk}/receipt/'
            )
        return obj.receipt_reference or None

    def get_submitted_date(self, obj):
        return obj.created_at.strftime('%d %b %Y') if obj.created_at else ''

    def validate_amount(self, value):
        if value is None or Decimal(str(value)) <= 0:
            raise serializers.ValidationError('Amount must be positive.')
        return value

    def create(self, validated_data):
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)


class ReimbursementReviewActionSerializer(serializers.Serializer):
    treasurer_notes = serializers.CharField(required=False, allow_blank=True, default='')


class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        from .models import Payment
        model = Payment
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'amount',
            'currency',
            'razorpay_order_id',
            'razorpay_payment_id',
            'status',
            'payment_type',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class MerchandiseProductSerializer(serializers.ModelSerializer):
    regularPrice = serializers.DecimalField(source='regular_price', max_digits=10, decimal_places=2)
    memberPrice = serializers.DecimalField(source='member_price', max_digits=10, decimal_places=2)
    price = serializers.DecimalField(source='regular_price', max_digits=10, decimal_places=2, read_only=True)
    sizeStock = serializers.JSONField(source='size_stock')
    totalStock = serializers.ReadOnlyField(source='total_stock')

    class Meta:
        from .models import MerchandiseProduct
        model = MerchandiseProduct
        fields = [
            'id',
            'name',
            'type',
            'category',
            'regular_price',
            'member_price',
            'regularPrice',
            'memberPrice',
            'price',
            'description',
            'image',
            'tag',
            'size_stock',
            'sizeStock',
            'totalStock',
            'is_active',
            'created_at',
        ]


class MerchandiseOrderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='order_id', read_only=True)
    orderId = serializers.CharField(source='order_id', read_only=True)
    customerName = serializers.CharField(source='user.full_name', read_only=True)
    customerEmail = serializers.CharField(source='user.email', read_only=True)
    studentId = serializers.CharField(source='user.student_id', read_only=True)
    productName = serializers.CharField(source='merchandise.name', read_only=True)
    productType = serializers.CharField(source='merchandise.type', read_only=True)
    image = serializers.CharField(source='merchandise.image', read_only=True)
    size = serializers.CharField(source='variant', read_only=True)
    unitPrice = serializers.DecimalField(source='unit_price', max_digits=10, decimal_places=2, read_only=True)
    totalPrice = serializers.DecimalField(source='total_amount', max_digits=10, decimal_places=2, read_only=True)
    orderStatus = serializers.CharField(source='order_status', read_only=True)
    collectionStatus = serializers.CharField(source='collection_status', read_only=True)
    qrToken = serializers.CharField(source='qr_token', read_only=True)
    pickupLocation = serializers.CharField(source='pickup_location', read_only=True)
    pdfUrl = serializers.SerializerMethodField()
    qrUrl = serializers.SerializerMethodField()
    orderDate = serializers.SerializerMethodField()
    paymentStatus = serializers.SerializerMethodField()
    paymentId = serializers.SerializerMethodField()

    class Meta:
        from .models import MerchandiseOrder
        model = MerchandiseOrder
        fields = [
            'id',
            'order_id',
            'orderId',
            'user',
            'customerName',
            'customerEmail',
            'studentId',
            'merchandise',
            'productName',
            'productType',
            'image',
            'variant',
            'size',
            'quantity',
            'unit_price',
            'unitPrice',
            'total_amount',
            'totalPrice',
            'payment',
            'order_status',
            'orderStatus',
            'collection_status',
            'collectionStatus',
            'qr_token',
            'qrToken',
            'pickup_location',
            'pickupLocation',
            'pdfUrl',
            'qrUrl',
            'orderDate',
            'paymentStatus',
            'paymentId',
            'collected_at',
            'created_at',
        ]
        read_only_fields = ['id', 'order_id', 'user', 'created_at', 'collected_at']

    def get_pdfUrl(self, obj):
        if obj.pdf_file:
            return obj.pdf_file.url
        return f"/api/merchandise/orders/{obj.order_id}/pdf/"

    def get_qrUrl(self, obj):
        if obj.qr_code:
            return obj.qr_code.url
        return None

    def get_orderDate(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%b %d, %Y • %I:%M %p')
        return 'Recent'

    def get_paymentStatus(self, obj):
        if obj.payment:
            return obj.payment.status
        return 'SUCCESS' if obj.order_status == 'CONFIRMED' else 'PENDING'

    def get_paymentId(self, obj):
        if obj.payment and obj.payment.razorpay_payment_id:
            return obj.payment.razorpay_payment_id
        return 'VERIFIED'


class RecordPaymentSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reference_type = serializers.ChoiceField(choices=Transaction.ReferenceType.choices)
    reference_id = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    party_name = serializers.CharField(required=False, allow_blank=True, default='')
    category = serializers.ChoiceField(
        choices=Transaction.Category.choices,
        required=False,
        allow_null=True,
    )
    date = serializers.DateField(required=False)

    def validate_amount(self, value):
        if value is None or Decimal(str(value)) <= 0:
            raise serializers.ValidationError('Amount must be positive.')
        return value

    def validate_reference_type(self, value):
        allowed = {
            Transaction.ReferenceType.MEMBERSHIP,
            Transaction.ReferenceType.EVENT_TICKET,
            Transaction.ReferenceType.MERCHANDISE,
            Transaction.ReferenceType.FUNDRAISER,
        }
        if value not in allowed:
            raise serializers.ValidationError(
                'reference_type must be a payment source (MEMBERSHIP, EVENT_TICKET, MERCHANDISE, FUNDRAISER).'
            )
        return value


class RefundTransactionSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default='')

