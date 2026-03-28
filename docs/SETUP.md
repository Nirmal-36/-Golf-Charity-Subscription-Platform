# Infrastructure Setup Guide

This document outlines the protocols for provisioning the environment and deploying the platform's core components.

## Prerequisites
*   **Runtime:** Python 3.9+, Node.js 18+
*   **Database:** PostgreSQL (Optimized for Supabase)
*   **Orchestration:** Redis (required for task queuing)
*   **Gateways:** Stripe (Payments), SendGrid (System Notifications)

## Local Development Lifecycle

### 1. Backend Configuration
*   **Environment:** Create a virtual environment (`python -m venv venv`) and activate it.
*   **Dependencies:** Initialize the backend stack with `pip install -r requirements.txt`.
*   **Identity & Credentials:** Configure your `.env` file using the provided template, ensuring Supabase and Stripe keys are correctly mapped.
*   **Persistence:** Synchronize the database schema with `python manage.py migrate`.
*   **Runtime:** Launch the development bridge with `python manage.py runserver`.
*   **Background Tasks:** In a separate terminal, initiate the task worker: `celery -A config worker --loglevel=info`.

### 2. Frontend Configuration
*   **Bootstrap:** Install the UI dependencies using `npm install`.
*   **API Mapping:** Set `VITE_API_URL` in your local environment variables to target the active backend instance.
*   **UI Server:** Launch the Vite development server with `npm run dev`.

---

## Production Deployment Protocols

### Backend (Stateless API)
*   **Deployment:** Supports standard WSGI/ASGI platforms (Vercel, AWS, Nginx/Gunicorn).
*   **Static Assets:** Configured with `whitenoise` for optimized delivery during production runtime.
*   **Security:** Ensure HTTPS is enforced and all environment variables are injected via the hosting provider's secure secret manager.

### Frontend (SPA)
*   **Build:** Execute `npm run build` to generate the production-ready distribution.
*   **Deployment:** Deploy the `dist` directory to a high-performance edge network such as Vercel or Netlify.

### Scalability & Persistence
*   **Database:** Utilize a managed PostgreSQL instance (Supabase) for production reliability.
*   **Storage:** Configure Supabase Storage buckets for persistent media (charity branding and verification proofs).
*   **Queueing:** For production loads, ensure a dedicated Redis instance manages the Celery task lifecycle.
