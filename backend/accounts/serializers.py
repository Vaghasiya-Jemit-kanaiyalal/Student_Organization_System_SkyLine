from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Standard User representation serializer.
    """
    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'student_id',
            'email',
            'role',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'role', 'is_active', 'created_at', 'updated_at']


class MemberRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for Member self-registration.
    Requires Full Name, Student ID, University Email, and Password.
    Role is strictly set to MEMBER.
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
            raise serializers.ValidationError("Student ID is required for member registration.")
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
        
        # Enforce MEMBER role upon self-registration
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            full_name=validated_data['full_name'],
            student_id=validated_data['student_id'],
            role=User.Role.MEMBER,
            is_active=True
        )
        return user


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
    3. Returns access token, refresh token, role, and user profile data.
    """
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the JWT payload
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['role'] = user.role
        token['student_id'] = user.student_id
        return token

    def validate(self, attrs):
        # Authenticate using default SimpleJWT method
        data = super().validate(attrs)

        # Check if user account is active
        if not self.user.is_active:
            raise serializers.ValidationError({"detail": "User account is disabled."})

        # Append custom payload to response
        data['role'] = self.user.role
        data['user'] = {
            'id': self.user.id,
            'full_name': self.user.full_name,
            'email': self.user.email,
            'student_id': self.user.student_id,
            'role': self.user.role,
            'is_active': self.user.is_active,
            'created_at': self.user.created_at,
        }
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
            # We still return the email for security (to prevent email enumeration)
            self.context['user'] = None
        return value


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


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    """
    class Meta:
        model = User
        fields = ['full_name', 'email', 'student_id', 'role']
        read_only_fields = ['email', 'student_id', 'role']
