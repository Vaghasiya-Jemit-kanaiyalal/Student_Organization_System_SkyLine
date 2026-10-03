from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Event, VolunteerApplication


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)
    approved_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'date',
            'location',
            'max_volunteers',
            'is_active',
            'created_by',
            'created_by_name',
            'applications_count',
            'approved_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_approved_count(self, obj):
        return obj.applications.filter(status=VolunteerApplication.Status.APPROVED).count()


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    event_details = EventSerializer(source='event', read_only=True)
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.full_name')

    class Meta:
        model = VolunteerApplication
        fields = [
            'id',
            'student',
            'student_details',
            'event',
            'event_details',
            'status',
            'notes',
            'applied_at',
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            'admin_feedback',
        ]
        read_only_fields = [
            'id', 'student', 'status', 'applied_at', 'reviewed_by', 'reviewed_at'
        ]


class ApplyVolunteerSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = ['event', 'notes']

    def validate_event(self, event):
        if not event.is_active:
            raise serializers.ValidationError("Cannot apply for an inactive event.")
        return event

    def validate(self, attrs):
        user = self.context['request'].user
        event = attrs['event']

        if user.role != 'MEMBER':
            raise serializers.ValidationError("Only registered organization members can apply to volunteer.")

        if VolunteerApplication.objects.filter(student=user, event=event).exists():
            raise serializers.ValidationError("You have already applied for this event.")

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return VolunteerApplication.objects.create(
            student=user,
            event=validated_data['event'],
            notes=validated_data.get('notes', ''),
            status=VolunteerApplication.Status.PENDING
        )


class VolunteerReviewActionSerializer(serializers.Serializer):
    admin_feedback = serializers.CharField(required=False, allow_blank=True, default='')
