from rest_framework import permissions

class IsActiveSubscriber(permissions.BasePermission):
    """
    Custom Permission: Restricted Access to Active Members.
    Grant access only if the user is authenticated and holds an 'active' 
    subscription status. Administrative staff bypass this requirement.
    """
    message = "Access Denied: An active subscription is required to perform this action."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
            
        # Subscription check with administrative override
        return bool(user.subscription_status == 'active' or user.is_staff)
