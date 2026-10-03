from datetime import timedelta
from django.db import models
from django.utils import timezone
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

from .models import User, Club, ClubMembership
from .permissions import IsAdmin, IsTreasurer, IsMember, IsAdminOrReadOnly
from .serializers import (
    UserSerializer,
    MemberRegisterSerializer,
    CreateTreasurerSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    UpdateProfileSerializer,
    ClubSerializer,
    ClubMembershipSerializer,
    PurchaseMembershipSerializer,
    RenewMembershipSerializer,
    AdminUpdateMembershipSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Self-registration endpoint for students.
    Requires full_name, student_id, email, password, password_confirm.
    Returns access & refresh tokens along with user info upon successful registration.
    Initial membership status is NONE.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = MemberRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the newly registered student
        refresh = RefreshToken.for_user(user)
        refresh['full_name'] = user.full_name
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['student_id'] = user.student_id

        return Response({
            "success": True,
            "message": "Student registered successfully. Initial membership status is NONE.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Authenticates any role (STUDENT/MEMBER, ADMIN, TREASURER) using email and password.
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
        user = self.request.user
        user.check_and_update_membership_expiry()
        return user


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Allows authenticated users to change their password.
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
# CLUBS & MEMBERSHIP MANAGEMENT APIS
# ============================================================================

class ClubListCreateView(generics.ListCreateAPIView):
    """
    GET /api/clubs/ -> List all campus clubs
    POST /api/clubs/ -> Create a new club (Admin only)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ClubSerializer
    queryset = Club.objects.filter(is_active=True).order_by('name')

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.ADMIN and not self.request.user.is_superuser:
            raise permissions.exceptions.PermissionDenied("Admin privileges required to create a club.")
        serializer.save()


class ClubDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/clubs/<str:pk>/ -> View club details
    PUT/PATCH /api/clubs/<str:pk>/ -> Update club (Admin only)
    DELETE /api/clubs/<str:pk>/ -> Delete club (Admin only)
    """
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = ClubSerializer
    queryset = Club.objects.all()


class PurchaseMembershipView(APIView):
    """
    POST /api/membership/purchase/
    Student joins a club or buys membership (SEMESTER or ANNUAL).
    Updates student's membership_status to ACTIVE and unlocks benefits.
    """
    permission_classes = [IsMember]

    def post(self, request):
        serializer = PurchaseMembershipSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()

        # Fetch fresh user representation
        request.user.refresh_from_db()

        return Response({
            "success": True,
            "message": f"Successfully purchased {membership.membership_type.title()} Membership for {membership.club_name_snapshot}!",
            "membership": ClubMembershipSerializer(membership).data,
            "user": UserSerializer(request.user).data
        }, status=status.HTTP_201_CREATED)


class RenewMembershipView(APIView):
    """
    POST /api/membership/renew/
    Student renews an active or expired membership.
    """
    permission_classes = [IsMember]

    def post(self, request):
        serializer = RenewMembershipSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()

        request.user.refresh_from_db()

        return Response({
            "success": True,
            "message": f"Membership renewed successfully! Valid until {membership.end_date.strftime('%b %d, %Y')}.",
            "membership": ClubMembershipSerializer(membership).data,
            "user": UserSerializer(request.user).data
        }, status=status.HTTP_201_CREATED)


class MyMembershipStatusView(APIView):
    """
    GET /api/membership/my-status/
    Returns current student's membership badge, status, type, and dates.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        user.check_and_update_membership_expiry()
        memberships = ClubMembership.objects.filter(student=user).order_by('-created_at')

        return Response({
            "success": True,
            "student_id": user.student_id,
            "student_name": user.full_name,
            "membership_status": user.membership_status,
            "membership_type": user.membership_type,
            "membership_start_date": user.membership_start_date,
            "membership_end_date": user.membership_end_date,
            "membership_badge": user.membership_badge,
            "is_active_member": user.is_active_member,
            "memberships": ClubMembershipSerializer(memberships, many=True).data
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
    Supports filters:
      - ?status=ACTIVE|EXPIRED|NONE
      - ?membership_type=SEMESTER|ANNUAL
      - ?search=...
    """
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        # Auto-update any expired memberships in bulk (system-wide duration check)
        User.auto_discard_expired_memberships()

        queryset = User.objects.filter(role__in=[User.Role.STUDENT, User.Role.MEMBER]).order_by('-created_at')

        # Filters
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() in ['NONE', 'ACTIVE', 'EXPIRED']:
            queryset = queryset.filter(membership_status=status_param.upper())

        type_param = self.request.query_params.get('membership_type')
        if type_param and type_param.upper() in ['SEMESTER', 'ANNUAL']:
            queryset = queryset.filter(membership_type=type_param.upper())

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(full_name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(student_id__icontains=search)
            )
        return queryset


class AdminUpdateMemberMembershipView(APIView):
    """
    PATCH /api/admin/members/<int:pk>/membership/
    PUT /api/admin/members/<int:pk>/membership/
    DELETE /api/admin/members/<int:pk>/membership/
    Admin updates or discards a student's membership.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            student = User.objects.get(pk=pk, role__in=[User.Role.STUDENT, User.Role.MEMBER])
        except User.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Student record not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUpdateMembershipSerializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_student = serializer.save()

        return Response({
            "success": True,
            "message": f"Updated membership for {updated_student.full_name} to {updated_student.membership_status}.",
            "data": UserSerializer(updated_student).data
        }, status=status.HTTP_200_OK)

    def put(self, request, pk):
        return self.patch(request, pk)

    def delete(self, request, pk):
        try:
            student = User.objects.get(pk=pk, role__in=[User.Role.STUDENT, User.Role.MEMBER])
        except User.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Student record not found."
            }, status=status.HTTP_404_NOT_FOUND)

        student.discard_membership(reset_to='EXPIRED')
        return Response({
            "success": True,
            "message": f"Membership for {student.full_name} has been discarded. Privileges revoked.",
            "data": UserSerializer(student).data
        }, status=status.HTTP_200_OK)


class AdminDiscardMemberMembershipView(APIView):
    """
    POST /api/admin/members/<int:pk>/discard/
    DELETE /api/admin/members/<int:pk>/discard/
    Admin discards student's membership immediately.
    Membership status becomes EXPIRED (or NONE) and active club enrollments are revoked.
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            student = User.objects.get(pk=pk, role__in=[User.Role.STUDENT, User.Role.MEMBER])
        except User.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Student record not found."
            }, status=status.HTTP_404_NOT_FOUND)

        reset_mode = request.data.get('reset_mode', 'EXPIRED').upper()
        student.discard_membership(reset_to=reset_mode)

        return Response({
            "success": True,
            "message": f"Membership for {student.full_name} has been discarded. Status is now {student.membership_status}.",
            "data": UserSerializer(student).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        return self.post(request, pk)


class AdminRenewMemberView(APIView):
    """
    POST /api/admin/members/<int:pk>/renew/
    Admin directly renews a student's membership for Semester or Annual duration.
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            student = User.objects.get(pk=pk, role__in=[User.Role.STUDENT, User.Role.MEMBER])
        except User.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Student record not found."
            }, status=status.HTTP_404_NOT_FOUND)

        membership_type = request.data.get('membership_type', student.membership_type or User.MembershipType.ANNUAL)
        if membership_type not in [User.MembershipType.SEMESTER, User.MembershipType.ANNUAL]:
            membership_type = User.MembershipType.ANNUAL

        start_date = timezone.now().date()
        days = 365 if membership_type == User.MembershipType.ANNUAL else 180
        end_date = start_date + timedelta(days=days)

        student.membership_status = User.MembershipStatus.ACTIVE
        student.membership_type = membership_type
        student.membership_start_date = start_date
        student.membership_end_date = end_date
        student.save()

        # Create or update ClubMembership record
        ClubMembership.objects.create(
            student=student,
            club_name_snapshot="Skyline Student Association",
            membership_type=membership_type,
            fee=499.00 if membership_type == User.MembershipType.ANNUAL else 299.00,
            start_date=start_date,
            end_date=end_date,
            status=ClubMembership.Status.ACTIVE,
            payment_method="Admin Manual Override"
        )

        return Response({
            "success": True,
            "message": f"Renewed {membership_type.title()} Membership for {student.full_name} until {end_date.strftime('%b %d, %Y')}.",
            "data": UserSerializer(student).data
        }, status=status.HTTP_200_OK)


class AdminTreasurerList(generics.ListAPIView):
    """
    GET /api/admin/treasurers/
    Protected: Only Admin can list all treasurers.
    """
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.Role.TREASURER).order_by('-created_at')
