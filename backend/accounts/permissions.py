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
    Custom permission to only allow Treasurers or Admins access to financial resources.
    """
    message = "Access denied: Treasurer or Administrator privileges required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role in ['TREASURER', 'ADMIN'] or request.user.is_superuser)
        )


class IsMember(permissions.BasePermission):
    """
    Custom permission to only allow registered Organization Members access.
    """
    message = "Access denied: Organization Member access required."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'MEMBER'
        )


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
