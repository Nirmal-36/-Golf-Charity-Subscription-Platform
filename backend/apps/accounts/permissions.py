from rest_framework import permissions

class IsActiveSubscriber(permissions.BasePermission):
    """
    Allows access only to active subscribers or staff members.
    """
    message = "An active subscription is required to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            (request.user.subscription_status == 'active' or request.user.is_staff)
        )
