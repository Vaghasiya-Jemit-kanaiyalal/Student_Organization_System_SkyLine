from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow administrators access.
    Admins have full organizational control.
    """
    message = "Access denied: Administrator privileges required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )


class IsTreasurer(permissions.BasePermission):
    """
    Treasurer-only financial operations (reimbursement approval, ledger writes).
    """
    message = "Access denied: Treasurer privileges required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == 'TREASURER' or request.user.is_superuser)
        )


class IsTreasurerOrAdminReadOnly(permissions.BasePermission):
    """
    Treasurers: full access. Admins: read-only on finance endpoints (no approvals).
    """

    message = "Access denied: Treasurer privileges required for this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.role == 'TREASURER':
            return True
        if request.user.role == 'ADMIN' and request.method in permissions.SAFE_METHODS:
            return True
        return False


class IsStudent(permissions.BasePermission):
    """
    Students (STUDENT or legacy MEMBER role). Membership status is separate from role.
    """
    message = "Access denied: Student access required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('STUDENT', 'MEMBER')
        )


# Backward-compatible alias used across volunteer views
IsMember = IsStudent


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Read-only for authenticated users, modification for Admin only.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'ADMIN' or request.user.is_superuser


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object or admins to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        # Check student/user attribute on object
        obj_owner = getattr(obj, 'student', getattr(obj, 'user', getattr(obj, 'requested_by', None)))
        return obj_owner == request.user
