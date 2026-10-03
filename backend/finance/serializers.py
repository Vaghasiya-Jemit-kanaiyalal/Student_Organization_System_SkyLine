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
