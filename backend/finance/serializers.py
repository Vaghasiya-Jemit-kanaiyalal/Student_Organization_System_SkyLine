from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Transaction, ReimbursementRequest


class TransactionSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.full_name')

    class Meta:
        model = Transaction
        fields = [
            'id',
            'title',
            'amount',
            'transaction_type',
            'category',
            'description',
            'date',
            'recorded_by',
            'recorded_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['recorded_by'] = user
        return super().create(validated_data)


class ReimbursementRequestSerializer(serializers.ModelSerializer):
    requested_by_details = UserSerializer(source='requested_by', read_only=True)
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.full_name')

    class Meta:
        model = ReimbursementRequest
        fields = [
            'id',
            'requested_by',
            'requested_by_details',
            'title',
            'amount',
            'description',
            'receipt_reference',
            'status',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'treasurer_notes',
            'created_at',
        ]
        read_only_fields = [
            'id', 'requested_by', 'status', 'reviewed_by', 'reviewed_at', 'created_at'
        ]

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

