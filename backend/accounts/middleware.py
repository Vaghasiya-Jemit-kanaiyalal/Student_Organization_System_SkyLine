from django.utils import timezone
from .models import User


class MembershipExpiryMiddleware:
    """
    Middleware that automatically checks and discards/expires student memberships
    if their membership duration has finished (current_date > membership_end_date).
    Supports both standard session users and DRF Bearer JWT tokens.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            # Check for Bearer JWT token in Authorization header
            auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header and auth_header.startswith('Bearer '):
                try:
                    from rest_framework_simplejwt.authentication import JWTAuthentication
                    jwt_auth = JWTAuthentication()
                    token_str = auth_header.split(' ')[1]
                    validated_token = jwt_auth.get_validated_token(token_str)
                    user = jwt_auth.get_user(validated_token)
                except Exception:
                    user = None

        if user and user.is_authenticated:
            if getattr(user, 'role', None) in [User.Role.STUDENT, User.Role.MEMBER]:
                user.check_and_update_membership_expiry()

        response = self.get_response(request)
        return response
