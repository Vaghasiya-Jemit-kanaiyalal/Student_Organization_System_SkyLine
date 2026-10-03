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
    CreateTreasurerView,
    AdminMemberList,
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
    path('treasurers/', AdminTreasurerList.as_view(), name='admin-treasurers-list'),
]

urlpatterns = auth_urlpatterns
