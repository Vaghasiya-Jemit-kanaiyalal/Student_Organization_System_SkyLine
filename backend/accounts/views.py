from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .permissions import IsAdmin, IsTreasurer, IsMember
from .serializers import (
    UserSerializer,
    MemberRegisterSerializer,
    CreateTreasurerSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    UpdateProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Self-registration endpoint for organization members.
    Requires full_name, student_id, email, password, password_confirm.
    Returns access & refresh tokens along with user info upon successful registration.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = MemberRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly registered member
        refresh = RefreshToken.for_user(user)
        refresh['full_name'] = user.full_name
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['student_id'] = user.student_id

        return Response({
            "success": True,
            "message": "Member registered successfully.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Authenticates any role (MEMBER, ADMIN, TREASURER) using email and password.
    Returns Access Token, Refresh Token, User Details, and Role.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            response.data = {
                "success": True,
                "message": "Login successful.",
                **response.data
            }
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the provided refresh token to securely invalidate the session.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({
                "success": False,
                "error": "MissingToken",
                "details": "Refresh token is required to logout."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "success": True,
                "message": "Logged out successfully. Token blacklisted."
            }, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({
                "success": False,
                "error": "InvalidToken",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/me/ -> Retrieve current authenticated user's profile
    PATCH /api/auth/me/ -> Update current user's profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateProfileSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Allows authenticated users to change their password.
    Requires old_password, new_password, confirm_new_password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "message": "Password changed successfully."
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    POST /api/auth/forgot-password/
    Generates a password reset token for the given registered email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.context.get('user')

        token = None
        uidb64 = None
        if user:
            token = default_token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"/reset-password?uid={uidb64}&token={token}"

            # Optionally dispatch email
            try:
                send_mail(
                    subject="Password Reset Request - Student Organization System",
                    message=f"Hello {user.full_name},\n\nPlease use the following token and UID to reset your password:\nUID: {uidb64}\nToken: {token}\nLink: {reset_url}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

        # Return standardized response (includes uidb64 and token for easy dev/testing)
        return Response({
            "success": True,
            "message": "If an account with this email exists, password reset instructions have been dispatched.",
            "data": {
                "uidb64": uidb64,
                "token": token
            } if settings.DEBUG and user else None
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    POST /api/auth/reset-password/
    Resets user password with uidb64, token, and new password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "message": "Password has been successfully reset. You may now log in with your new password."
        }, status=status.HTTP_200_OK)


# ============================================================================
# ADMIN-ONLY VIEWS
# ============================================================================

class CreateTreasurerView(generics.CreateAPIView):
    """
    POST /api/admin/create-treasurer/
    Protected: Only Admin can create a Treasurer account.
    """
    permission_classes = [IsAdmin]
    serializer_class = CreateTreasurerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        treasurer = serializer.save()
        return Response({
            "success": True,
            "message": f"Treasurer '{treasurer.full_name}' created successfully.",
            "data": UserSerializer(treasurer).data
        }, status=status.HTTP_201_CREATED)


class AdminMemberList(generics.ListAPIView):
    """
    GET /api/admin/members/
    Protected: Only Admin can view full organization member list.
    Supports search query (?search=...)
    """
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role=User.Role.MEMBER).order_by('-created_at')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(full_name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(student_id__icontains=search)
            )
        return queryset


class AdminTreasurerList(generics.ListAPIView):
    """
    GET /api/admin/treasurers/
    Protected: Only Admin can list all treasurers.
    """
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.Role.TREASURER).order_by('-created_at')
