from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Event, VolunteerApplication, VolunteerAssignment, Certificate


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.full_name')
    applications_count = serializers.IntegerField(source='volunteer_applications.count', read_only=True)
    active_volunteers_count = serializers.IntegerField(read_only=True)
    volunteer_slots_remaining = serializers.IntegerField(read_only=True)
    roles_list = serializers.ListField(read_only=True)
    volunteer_roles_required = serializers.CharField(required=False, allow_blank=True)

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        roles = mutable_data.get('volunteer_roles_required')
        if isinstance(roles, list):
            mutable_data['volunteer_roles_required'] = ', '.join([str(r).strip() for r in roles if str(r).strip()])
        return super().to_internal_value(mutable_data)

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'event_type',
            'venue',
            'location',
            'date',
            'start_time',
            'end_time',
            'capacity',
            'ticket_price',
            'image',
            'volunteers_required',
            'volunteer_count_required',
            'volunteer_deadline',
            'volunteer_roles_required',
            'roles_list',
            'status',
            'is_active',
            'created_by',
            'created_by_name',
            'applications_count',
            'active_volunteers_count',
            'volunteer_slots_remaining',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


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
            'preferred_role',
            'reason',
            'notes',
            'experience',
            'status',
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
        fields = ['event', 'preferred_role', 'reason', 'experience']

    def validate_event(self, event):
        if not event.volunteers_required:
            raise serializers.ValidationError("This event is not accepting volunteer applications.")
        if event.status not in [Event.Status.PUBLISHED, 'Published']:
            raise serializers.ValidationError("Volunteer applications are only open for published events.")
        return event

    def validate(self, attrs):
        user = self.context['request'].user
        event = attrs['event']

        if user.role != 'MEMBER':
            raise serializers.ValidationError("Only student members can apply as volunteers.")

        if VolunteerApplication.objects.filter(student=user, event=event).exists():
            raise serializers.ValidationError("You have already applied for this event.")

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        return VolunteerApplication.objects.create(
            student=user,
            event=validated_data['event'],
            preferred_role=validated_data.get('preferred_role', 'General Volunteer'),
            reason=validated_data.get('reason', ''),
            experience=validated_data.get('experience', ''),
            status=VolunteerApplication.Status.PENDING
        )


class VolunteerApproveSerializer(serializers.Serializer):
    assigned_role = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    duration = serializers.CharField(max_length=100, required=False, default='4 Hours')
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class VolunteerRejectSerializer(serializers.Serializer):
    admin_notes = serializers.CharField(required=False, allow_blank=True, default='')


class VolunteerAssignmentSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    event_details = EventSerializer(source='event', read_only=True)

    class Meta:
        model = VolunteerAssignment
        fields = [
            'id',
            'application',
            'student',
            'student_details',
            'event',
            'event_details',
            'assigned_role',
            'duration',
            'notes',
            'status',
            'approved_at',
            'completed_at',
        ]
        read_only_fields = ['id', 'student', 'event', 'approved_at']


class CertificateSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    event_details = EventSerializer(source='event', read_only=True)
    student_name = serializers.ReadOnlyField(source='student.full_name')
    student_id = serializers.ReadOnlyField(source='student.student_id')
    event_name = serializers.ReadOnlyField(source='event.title')

    class Meta:
        model = Certificate
        fields = [
            'id',
            'certificate_id',
            'student',
            'student_details',
            'student_name',
            'student_id',
            'event',
            'event_details',
            'event_name',
            'assignment',
            'volunteer_role',
            'duration',
            'issue_date',
            'verification_hash',
        ]
        read_only_fields = ['id', 'certificate_id', 'issue_date', 'verification_hash']


class CertificateGenerateSerializer(serializers.Serializer):
    event_id = serializers.IntegerField(required=True)
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="Optional list of student IDs to issue certificates for. If omitted, all completed/active volunteers get certificates."
    )
