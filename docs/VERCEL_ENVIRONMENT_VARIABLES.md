# Vercel Environment Variables Guide (Copy-Paste Format)

Copy and paste these directly into your Vercel Project Settings for **Production**.

## Core Infrastructure
```text
SECRET_KEY=your_random_string_here
DEBUG=False
ALLOWED_HOSTS=.vercel.app
DATABASE_URL=your_supabase_postgres_url
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
CRON_SECRET=your_random_cron_key
```

## Third-Party Credentials
```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SENDGRID_API_KEY=SG.your_api_key
```

## Frontend Configuration
```text
VITE_API_BASE_URL=/api
```

## Cloud Storage (Optional)
Only set these if you want persistent media storage on Supabase.
```text
USE_S3=True
AWS_ACCESS_KEY_ID=your_supabase_project_ref
AWS_SECRET_ACCESS_KEY=your_supabase_service_role_key
AWS_S3_ENDPOINT_URL=https://your-id.supabase.co/storage/v1/s3
AWS_STORAGE_BUCKET_NAME=media
```
