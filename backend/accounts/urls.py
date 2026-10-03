from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    ClubListCreateView,
    ClubDetailView,
    PurchaseMembershipView,
    RenewMembershipView,
    MyMembershipStatusView,
    CreateTreasurerView,
    AdminMemberList,
    AdminUpdateMemberMembershipView,
    AdminRenewMemberView,
    AdminDiscardMemberMembershipView,
    AdminTreasurerList,
)

# Authentication endpoints: /api/auth/...
auth_urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', UserProfileView.as_view(), name='auth-me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
]

# Admin management endpoints: /api/admin/...
admin_urlpatterns = [
    path('create-treasurer/', CreateTreasurerView.as_view(), name='admin-create-treasurer'),
    path('members/', AdminMemberList.as_view(), name='admin-members-list'),
    path('members/<int:pk>/membership/', AdminUpdateMemberMembershipView.as_view(), name='admin-member-membership-update'),
    path('members/<int:pk>/renew/', AdminRenewMemberView.as_view(), name='admin-member-renew'),
    path('members/<int:pk>/discard/', AdminDiscardMemberMembershipView.as_view(), name='admin-member-discard'),
    path('treasurers/', AdminTreasurerList.as_view(), name='admin-treasurers-list'),
]

# Membership & Club endpoints: /api/...
membership_urlpatterns = [
    path('clubs/', ClubListCreateView.as_view(), name='clubs-list-create'),
    path('clubs/<str:pk>/', ClubDetailView.as_view(), name='club-detail'),
    path('membership/purchase/', PurchaseMembershipView.as_view(), name='membership-purchase'),
    path('membership/renew/', RenewMembershipView.as_view(), name='membership-renew'),
    path('membership/my-status/', MyMembershipStatusView.as_view(), name='membership-my-status'),
]

urlpatterns = auth_urlpatterns
