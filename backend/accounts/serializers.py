from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Club, ClubMembership, MembershipNotificationLog

User = get_user_model()



class ClubSerializer(serializers.ModelSerializer):
    """
    Serializer for University Clubs and Student Organizations.
    """
    class Meta:
        model = Club
        fields = [
            'id',
            'name',
            'short_name',
            'tagline',
            'description',
            'category',
            'badge',
            'faculty_advisor',
            'meeting_schedule',
            'banner_image',
            'semester_fee',
            'annual_fee',
            'available_spots',
            'total_spots',
            'benefits',
            'website_url',
            'is_active',
            'created_at',
        ]


class ClubMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for Club Memberships held by Students.
    """
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    club_id = serializers.CharField(source='club.id', read_only=True, default='')
    club_name = serializers.CharField(source='club.name', read_only=True, default='')

    class Meta:
        model = ClubMembership
        fields = [
            'id',
            'student',
            'student_name',
            'student_id',
            'student_email',
            'club',
            'club_id',
            'club_name',
            'club_name_snapshot',
            'membership_type',
            'fee',
            'start_date',
            'end_date',
            'status',
            'payment_method',
            'transaction_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'student', 'transaction_id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Comprehensive User representation serializer.
    Includes student membership properties, badge, and active memberships list.
    """
    membership_badge = serializers.CharField(read_only=True)
    is_active_member = serializers.BooleanField(read_only=True)
    memberships = ClubMembershipSerializer(source='club_memberships', many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'student_id',
            'email',
            'role',
            'membership_status',
            'membership_type',
            'membership_start_date',
            'membership_end_date',
            'membership_badge',
            'is_active_member',
            'department',
            'semester',
            'phone',
            'avatar',
            'memberships',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'role', 'is_active', 'created_at', 'updated_at',
            'membership_badge', 'is_active_member', 'memberships'
        ]


class MemberRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for Student self-registration.
    Requires Full Name, Student ID, University Email, and Password.
    Initial membership status is NONE.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'student_id',
            'email',
            'password',
            'password_confirm',
        ]

    def validate_student_id(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Student ID is required for registration.")
        value = value.strip().upper()
        if User.objects.filter(student_id__iexact=value).exists():
            raise serializers.ValidationError("A student with this Student ID is already registered.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("University email is required.")
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        if password_confirm is not None and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        # Enforce STUDENT role and NONE membership upon registration
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data['full_name'],
            student_id=validated_data['student_id'],
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.NONE,
            is_active=True
        )
        return user


class PurchaseMembershipSerializer(serializers.Serializer):
    """
    Serializer for Student Purchasing / Joining Club Membership.
    """
    club_id = serializers.CharField(required=False, allow_blank=True)
    membership_type = serializers.ChoiceField(
        choices=ClubMembership.MembershipType.choices,
        default=ClubMembership.MembershipType.ANNUAL
    )
    payment_method = serializers.CharField(required=False, default='Student ID Account (Bursar)')

    def validate(self, attrs):
        user = self.context['request'].user
        if user.role not in (User.Role.STUDENT, User.Role.MEMBER):
            raise serializers.ValidationError('Only students can purchase organization membership.')
        user.check_and_update_membership_expiry()
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        club_id = validated_data.get('club_id')
        membership_type = validated_data.get('membership_type', ClubMembership.MembershipType.ANNUAL)
        payment_method = validated_data.get('payment_method', 'Student ID Account (Bursar)')

        club = None
        fee = 499.00 if membership_type == ClubMembership.MembershipType.ANNUAL else 299.00
        club_name = "Skyline Student Association"

        if club_id:
            try:
                club = Club.objects.get(id=club_id)
                fee = club.annual_fee if membership_type == ClubMembership.MembershipType.ANNUAL else club.semester_fee
                club_name = club.name
            except Club.DoesNotExist:
                pass

        start_date = timezone.now().date()
        if membership_type == ClubMembership.MembershipType.ANNUAL:
            end_date = start_date + timedelta(days=365)
        else:
            end_date = start_date + timedelta(days=180)

        # Deactivate any previous active memberships for this club
        if club:
            ClubMembership.objects.filter(student=user, club=club, status=ClubMembership.Status.ACTIVE).update(
                status=ClubMembership.Status.EXPIRED
            )

        # Create new ClubMembership
        membership = ClubMembership.objects.create(
            student=user,
            club=club,
            club_name_snapshot=club_name,
            membership_type=membership_type,
            fee=fee,
            start_date=start_date,
            end_date=end_date,
            status=ClubMembership.Status.ACTIVE,
            payment_method=payment_method
        )

        user.membership_status = User.MembershipStatus.ACTIVE
        user.membership_type = membership_type
        user.membership_start_date = start_date
        user.membership_end_date = end_date
        user.save(update_fields=[
            'membership_status',
            'membership_type',
            'membership_start_date',
            'membership_end_date'
        ])

        return membership


class RenewMembershipSerializer(serializers.Serializer):
    """
    Serializer for Student renewing an existing membership.
    """
    membership_type = serializers.ChoiceField(
        choices=ClubMembership.MembershipType.choices,
        default=ClubMembership.MembershipType.ANNUAL
    )
    club_id = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(required=False, default='Student ID Account (Bursar)')

    def validate(self, attrs):
        user = self.context['request'].user
        if user.role not in (User.Role.STUDENT, User.Role.MEMBER):
            raise serializers.ValidationError('Only students can renew organization membership.')
        user.check_and_update_membership_expiry()
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        membership_type = validated_data.get('membership_type', ClubMembership.MembershipType.ANNUAL)
        club_id = validated_data.get('club_id')
        payment_method = validated_data.get('payment_method', 'Student ID Account (Bursar)')

        club = None
        fee = 499.00 if membership_type == ClubMembership.MembershipType.ANNUAL else 299.00
        club_name = "Skyline Student Association"

        if club_id:
            try:
                club = Club.objects.get(id=club_id)
                fee = club.annual_fee if membership_type == ClubMembership.MembershipType.ANNUAL else club.semester_fee
                club_name = club.name
            except Club.DoesNotExist:
                pass

        start_date = timezone.now().date()
        if membership_type == ClubMembership.MembershipType.ANNUAL:
            end_date = start_date + timedelta(days=365)
        else:
            end_date = start_date + timedelta(days=180)

        # Deactivate any previous active memberships for this club
        if club:
            ClubMembership.objects.filter(student=user, club=club, status=ClubMembership.Status.ACTIVE).update(
                status=ClubMembership.Status.EXPIRED
            )

        membership = ClubMembership.objects.create(
            student=user,
            club=club,
            club_name_snapshot=club_name,
            membership_type=membership_type,
            fee=fee,
            start_date=start_date,
            end_date=end_date,
            status=ClubMembership.Status.ACTIVE,
            payment_method=payment_method
        )

        user.membership_status = User.MembershipStatus.ACTIVE
        user.membership_type = membership_type
        user.membership_start_date = start_date
        user.membership_end_date = end_date
        user.save(update_fields=[
            'membership_status',
            'membership_type',
            'membership_start_date',
            'membership_end_date'
        ])

        return membership


class AdminUpdateMembershipSerializer(serializers.Serializer):
    """
    Admin serializer to manually adjust student membership status, type, and dates.
    """
    membership_status = serializers.ChoiceField(
        choices=User.MembershipStatus.choices,
        required=False,
    )
    membership_type = serializers.ChoiceField(choices=User.MembershipType.choices, required=False, allow_null=True)
    membership_start_date = serializers.DateField(required=False, allow_null=True)
    membership_end_date = serializers.DateField(required=False, allow_null=True)

    def update(self, instance, validated_data):
        if not validated_data:
            raise serializers.ValidationError('No membership fields provided to update.')

        status_val = validated_data.get('membership_status', instance.membership_status)
        type_val = validated_data.get('membership_type', instance.membership_type)
        start_date = validated_data.get('membership_start_date', instance.membership_start_date)
        end_date = validated_data.get('membership_end_date', instance.membership_end_date)

        if status_val == User.MembershipStatus.ACTIVE and not start_date:
            start_date = timezone.now().date()
        if status_val == User.MembershipStatus.ACTIVE and not end_date:
            days = 365 if type_val == User.MembershipType.ANNUAL else 180
            end_date = (start_date or timezone.now().date()) + timedelta(days=days)

        instance.membership_status = status_val
        instance.membership_type = type_val
        instance.membership_start_date = start_date
        instance.membership_end_date = end_date
        instance.save()
        return instance


class CreateTreasurerSerializer(serializers.ModelSerializer):
    """
    Admin-only serializer to create a TREASURER account.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'password',
            'student_id',
            'role',
            'created_at',
        ]
        read_only_fields = ['id', 'role', 'created_at']

    def validate_email(self, value):
        value = value.strip().lower()
        if not value.endswith('@treasurer.gmail.com'):
            raise serializers.ValidationError("Treasurer email must end with @treasurer.gmail.com (e.g. xyz@treasurer.gmail.com).")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        student_id = validated_data.get('student_id', None)
        
        treasurer = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data['full_name'],
            student_id=student_id,
            role=User.Role.TREASURER,
            is_active=True
        )
        return treasurer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Login serializer that:
    1. Authenticates user by email & password.
    2. Validates user is active.
    3. Validates that Treasurer accounts use @treasurer.gmail.com.
    4. Returns access token, refresh token, role, and full user profile data with membership status.
    """
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['role'] = user.role
        token['student_id'] = user.student_id
        token['membership_status'] = user.membership_status
        token['membership_type'] = user.membership_type
        token['membership_badge'] = user.membership_badge
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_active:
            raise serializers.ValidationError({"detail": "User account is disabled."})

        if self.user.role == User.Role.TREASURER:
            if not self.user.email.lower().endswith('@treasurer.gmail.com'):
                raise serializers.ValidationError({
                    "detail": "Treasurer can only login with an email ending in @treasurer.gmail.com."
                })

        # Check and update expiry if needed
        self.user.check_and_update_membership_expiry()

        data['role'] = self.user.role
        data['user'] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for authenticated user password change.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as old password."})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer to request a password reset token via email.
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        value = value.strip().lower()
        try:
            user = User.objects.get(email__iexact=value, is_active=True)
            self.context['user'] = user
        except User.DoesNotExist:
            self.context['user'] = None
        return value


class ValidateResetTokenSerializer(serializers.Serializer):
    """
    Serializer to validate uidb64 and password reset token.
    """
    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"token": "Password reset link is invalid or expired."})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"token": "Password reset token is invalid or has expired."})

        self.context['user'] = user
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer to confirm password reset with uidb64 and token.
    """
    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "Passwords do not match."})

        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"token": "Invalid user ID or user inactive."})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"token": "Password reset token is invalid or has expired."})

        self.context['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.context['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class MembershipNotificationLogSerializer(serializers.ModelSerializer):
    """
    Serializer for membership notification delivery audit logs.
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = MembershipNotificationLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'notification_type',
            'target_expiry_date',
            'recipient_email',
            'status',
            'error_message',
            'sent_at'
        ]



class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for updating student / user profile information.
    """
    class Meta:
        model = User
        fields = [
            'full_name',
            'department',
            'semester',
            'phone',
            'avatar',
            'email',
            'student_id',
            'role'
        ]
        read_only_fields = ['email', 'student_id', 'role']
