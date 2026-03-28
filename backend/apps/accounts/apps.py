from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'

    def ready(self):
        """
        Orchestrates the 'First Run' administrative provisioning.
        Automatically initializes the platform's superuser account using 
        environment variables (ADMIN_EMAIL, ADMIN_PASSWORD).
        Ensures immediate administrative access post-deployment to Vercel.
        """
        try:
            import os
            from django.contrib.auth import get_user_model
            
            # Security Logic: Execute only if production credentials are present
            admin_email = os.environ.get('ADMIN_EMAIL')
            admin_pass = os.environ.get('ADMIN_PASSWORD')
            
            if admin_email and admin_pass:
                User = get_user_model()
                # Idempotency Check: Prevent duplicate user generation
                if not User.objects.filter(email=admin_email).exists():
                    User.objects.create_superuser(
                        username=admin_email.split('@')[0], # Fallback username
                        email=admin_email,
                        password=admin_pass,
                        user_role='admin' # Business Logic: Elevate to Admin role
                    )
        except Exception:
            # Platform Guard: Suppress initialization errors during migration 
            # or when database tables are not yet materialized.
            pass
