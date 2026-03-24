from rest_framework import permissions

class IsActiveSubscriber(permissions.BasePermission):
    """
    Requires the user to be authenticated and have an 'active' subscription_status.
    """
    message = "An active subscription is required to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.subscription_status == 'active'
        )
