# Golf Charity Subscription Platform

This is a full-stack web application that combines golf performance tracking, charitable giving, and a monthly prize draw system. It operates on a subscription model where active members can log their scores, allocate donations to selected charities, and enter automated draws.

## Tech Stack

- **Backend:** Django 4.2+, Django REST Framework (DRF), Celery, Redis
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage
- **Frontend:** React.js (Vite), Tailwind CSS 4, React Router
- **Payments:** Stripe

## Project Architecture

The repository is structured as a monorepo splitting the backend API and frontend client:

- `backend/`: Django project containing the structured REST API, Celery task queue, and database models.
- `frontend/`: React SPA built with Vite, communicating strictly with the backend via Axios and JWT authentication.

## Implementation Progress

The development is divided into explicit phases. 

### Phase 1: Foundation and Authentication (Completed)

Phase 1 established the core infrastructure and authentication flows across the entire stack.

**Backend Setup**
- Configured the Django project with modular settings using Python Decouple.
- Integrated Supabase PostgreSQL as the primary database.
- Created custom `User` model to handle subscription statuses, Stripe customer IDs, and charitable donation preferences.
- Built authentication endpoints (register, login, token refresh, and profile fetching) using Django REST Framework and SimpleJWT.
- Implemented a custom `IsActiveSubscriber` permission class to gate future API routes.
- Registered core models in the Django Admin for manageability.

**Frontend Setup**
- Scaffolded the React web application using Vite.
- Set up Tailwind CSS 4 globally.
- Implemented state management for authentication using React Context API (`AuthContext`), storing JWTs in local storage and tracking the user session.
- Configured a reusable Axios API client that automatically attaches authorization tokens and attempts token refreshes on 401 errors.
- Built mock user interface shells for Login and the Dashboard, applying protected routing to prevent unauthenticated access.

