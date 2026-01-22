"""
Role-based access control permissions.
"""
from rest_framework import permissions
from .models import UserRole


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == UserRole.ADMIN
        )


class IsStaffOrAdmin(permissions.BasePermission):
    """Allow access to staff scanners and admins."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.STAFF_SCANNER, UserRole.ADMIN]
        )


class IsVendor(permissions.BasePermission):
    """Allow access only to vendor users."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == UserRole.VENDOR
        )


class IsVendorOrAdmin(permissions.BasePermission):
    """Allow access to vendors and admins."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.VENDOR, UserRole.ADMIN]
        )


class IsOwnerOrStaff(permissions.BasePermission):
    """Allow access to resource owner or staff/admin."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role in [UserRole.STAFF_SCANNER, UserRole.ADMIN]:
            return True
        
        # Check for owner field
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'buyer'):
            return obj.buyer == request.user
        
        return False


class IsAuthenticatedAndActive(permissions.BasePermission):
    """Allow access to authenticated and active users."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active
        )
