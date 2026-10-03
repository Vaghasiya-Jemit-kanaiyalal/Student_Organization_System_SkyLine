from django.utils import timezone
from .models import User


class MembershipExpiryMiddleware:
    """
    Middleware that automatically checks and discards/expires student memberships
    if their membership duration has finished.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Check if student membership has expired
            if getattr(request.user, 'role', None) in [User.Role.STUDENT, User.Role.MEMBER]:
                request.user.check_and_update_membership_expiry()

        response = self.get_response(request)
        return response
