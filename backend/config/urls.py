from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from accounts.urls import admin_urlpatterns as accounts_admin_urls, membership_urlpatterns as accounts_membership_urls


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Root API directory providing links to all available platform modules.
    """
    return Response({
        "system": "Student Organization Management System (SkyLine)",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "authentication": {
                "register": request.build_absolute_uri("/api/auth/register/"),
                "login": request.build_absolute_uri("/api/auth/login/"),
                "logout": request.build_absolute_uri("/api/auth/logout/"),
                "refresh_token": request.build_absolute_uri("/api/auth/token/refresh/"),
                "my_profile": request.build_absolute_uri("/api/auth/me/"),
                "change_password": request.build_absolute_uri("/api/auth/change-password/"),
                "forgot_password": request.build_absolute_uri("/api/auth/forgot-password/"),
                "reset_password": request.build_absolute_uri("/api/auth/reset-password/"),
            },
            "admin_management": {
                "create_treasurer": request.build_absolute_uri("/api/admin/create-treasurer/"),
                "members_list": request.build_absolute_uri("/api/admin/members/"),
                "treasurers_list": request.build_absolute_uri("/api/admin/treasurers/"),
                "volunteer_applications": request.build_absolute_uri("/api/admin/volunteers/"),
            },
            "events_and_volunteers": {
                "events_list_create": request.build_absolute_uri("/api/events/"),
                "apply_volunteer": request.build_absolute_uri("/api/volunteer/apply/"),
                "my_volunteer_applications": request.build_absolute_uri("/api/volunteer/my-applications/"),
                "announcements": request.build_absolute_uri("/api/announcements/"),
            },
            "finance": {
                "finance_dashboard": request.build_absolute_uri("/api/finance/"),
                "transactions": request.build_absolute_uri("/api/finance/transactions/"),
                "reimbursements": request.build_absolute_uri("/api/finance/reimbursements/"),
            },
            "django_admin": request.build_absolute_uri("/admin/"),
        }
    })


def favicon_view(request):
    return HttpResponse(status=204)  # No content for favicon


urlpatterns = [
    # Root API Landing View
    path('', api_root, name='api-root'),
    path('favicon.ico', favicon_view, name='favicon'),

    # Django Admin Site
    path('admin/', admin.site.urls),

    # Authentication & Profile APIs
    path('api/auth/', include('accounts.urls')),

    # Membership & Club APIs
    path('api/', include(accounts_membership_urls)),

    # Admin Specific APIs
    path('api/admin/', include(accounts_admin_urls)),

    # Events & Volunteer APIs
    path('api/', include('volunteers.urls')),

    # Finance APIs
    path('api/finance/', include('finance.urls')),
]
