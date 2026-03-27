# Golf Charity Subscription Platform

This is a full-stack web application that combines golf performance tracking, charitable giving, and a monthly prize draw system. It operates on a subscription model where active members can log their scores, allocate donations to selected charities, and enter automated draws.

## Tech Stack

- **Backend:** Django 4.2+, Django REST Framework (DRF), Celery, Redis
- **Database:** Supabase (PostgreSQL with Transaction Pooler / Supavisor)
- **File Storage:** Supabase Storage
- **Frontend:** React.js (Vite), Tailwind CSS 4, React Router, Lucide Icons
- **Payments:** Stripe
- **Email:** SendGrid

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

### Phase 2: Score Management & Charity Directory (Completed)

Phase 2 implemented the core golf mechanics and the charitable directory logic.

**Backend Setup**
- Built the `GolfScore` model with Stableford score validation (1-45).
- Implemented **Rolling Score Logic**: Automatically enforces a 5-score active limit by deactivating older scores when a 6th is submitted.
- Created the `Charities` application with endpoints to list charities, view details, and allow users to select their designated charity.
- Built a custom Django management command (`seed_charities`) to automatically popularize the database with mock charity data.

**Frontend Setup**
- Created custom `useScores` and `useCharities` React hooks for streamlined API data fetching and state management.
- Built the `ScoreReel` and `ScoreCard` components to visually display the rolling 5-score window (highlighting the oldest score).
- Built the `CharityBrowse` page and `CharityCard` components to browse and select partnered charities.
- Built the `ScoreSubmit` page with robust form validation and Framer Motion success animations.
- Updated the Dashboard to comprehensively display the active score reel alongside a "User Impact" widget showing total donations and the currently selected charity (receiving a default 10% cut).

### Phase 3: Stripe Subscriptions & Billing (Completed)

Phase 3 introduced the monetization tier and enforced subscription gating via Stripe.

**Backend Setup**
- Integrated the `stripe` Python SDK in the new `subscriptions` Django app.
- Built the `create-checkout-session` API to generate dynamic, secure Stripe Checkout URLs.
- Developed a robust Stripe Webhook listener (`/api/subscriptions/webhook/`) that listens for `checkout.session.completed` and `invoice.payment_failed` events with signature verification.
- Automated the updating of `User.subscription_status` based on incoming Stripe webhook events.

**Frontend Setup**
- Developed a premium `Subscription` landing page outlining platform features and the $20/month pricing.
- Created seamless `Success` and `Cancel` callback pages to handle Stripe's post-checkout redirects.
- Enhanced the `ProtectedRoute` wrapper in `App.jsx` to enforce an `active` subscription status on all authenticated users, blocking access to the Dashboard and forcing a redirect to the subscription page for lapsed accounts.

### Phase 4: Monthly Draw Engine (Completed)

Phase 4 implemented the automated monthly prize draw system.

**Backend Setup**
- Built the `DrawRound`, `DrawEntry`, and `DrawWinner` models to manage monthly schedules and user participation.
- Integrated **Celery + Redis** for background task processing.
- Developed an automated **Monthly Draw Task**: Picks 5 random winning numbers (1–50), calculates hits for all entries, and identifies winners across three tiers (3, 4, or 5 matches).
- Implemented **Jackpot Rollover Logic**: Automatically rolls the jackpot into the next month's Draw if no one hits all 5 numbers.
- Built REST APIs for fetching the current draw details, submitting number entries, and viewing personal entry history.

**Frontend Setup**
- Developed the `Draw` page featuring an interactive **Number Picker** (exactly 5 unique selections required).
- Implemented a **Live Countdown Timer** (Days/Hours/Minutes/Seconds) synced with the backend draw date.
- Added visual confirmation of user entries, displaying the user's selected numbers directly on the Draw page.
- Created the **Draw History** page where users can review past entries and see their match results and winnings.
- Integrated quick-access "Prize Draw" entry directly on the main Dashboard.

### Phase 5: Winner Workflow & Admin Dashboard (Completed)

Phase 5 finalized the platform's lifecycle by implementing the administrative management suite and the winner verification process.

**Backend Setup**
- **Verification Workflow**: Integrated Supabase Storage to allow winners to upload scorecard proof.
- **Admin Audit Logging**: Developed a specialized `AdminAuditLog` model to track every administrative decision (approvals, rejections, payouts) for high accountability.
- **Prize Payout Management**: Built dedicated logic to track and manage prize disbursements once proof is verified.
- **Redis Robustness**: Implemented fallback mechanisms in Celery tasks to ensure the platform remains stable (preventing 500 errors) even if the Redis service is temporarily unreachable during email dispatch.
- **Email Notifications**: Expanded the notification system to include winner approval alerts and admin verification prompts using **SendGrid**.

**Frontend Setup**
- **Admin Command Center**: Created a high-performance administrative dashboard featuring real-time platform KPIs (Total Users, Active Subscribers, Monthly Revenue, Total Donations).
- **User Management**: Built a searchable database for administrators to monitor member statuses and donation impact.
- **Payouts & Logs**: Implemented secondary administrative views for processing prize payments and reviewing the system audit trail.
- **Authentication Refactor**: Decoupled the Login and Registration flows into standalone pages with dedicated routing, significantly improving the `App.jsx` architecture and resolving HMR (Fast Refresh) stability issues.
- **Improved Navigation**: Added "Back to Dashboard" and "Admin" shortcuts to ensure a seamless experience for privileged users.

### Phase 8-10: Refinement & Admin Connectivity (Completed)

These phases focused on structural stability and bridging the gap between the administrative hub and the live platform data.

- **Pages Architecture**: Refactored the frontend into a structured `/pages` directory hierarchy, separating Auth, Admin, Dashboard, and Public views for better maintainability.
- **Admin Hub Connectivity**: Linked the administrative "Users," "Charities," and "Draws" views to live backend endpoints, enabling real-time management of the platform's ecosystem.
- **Stability Fixes**: Resolved critical Supabase connectivity issues by migrating to IPv4 Transaction Poolers and fixed several UI-breaking missing icon imports.

### Phase 11: Charity Lifecycle & Application Portal (Completed)

Transformed the charity management into a professional, multi-stage approval workflow.

- **Partner Portal**: Built a dedicated landing page for new organizations to apply for partnership directly on the platform.
- **Administrative Review**: Implemented a "Pending Applications" queue in the Admin Hub, allowing staff to review and explicitly approve/reject new charity requests.
- **Status Management**: Developed a high-end toggle system for administrators to instantly activate/deactivate approved charities, providing total control over the directory.

### Phase 12: End-to-End Subscription & Draw Lifecycle (Completed)

The final transformation of the platform into a robust, automated financial ecosystem.

- **Pricing Overhaul**: Migrated to the new professional tiers: **$9.99/mo** and **$99/yr**.
- **The 40/10/50 Split**: Developed a custom Stripe Webhook handler that automatically distributes revenue upon every successful payment:
    - **40%** to the Monthly Prize Pool.
    - **10%** (minimum) to the user's selected Charity.
    - **50%** to the Platform.
- **Rolling "Last 5" System**: Implemented a "Last 5 Active" rolling score system. The platform now automatically deactivates older scores as new ones are submitted, ensuring only the most fresh performance determines draw eligibility.
- **Draw Algorithm & Rollover**: Refined the monthly draw engine to enforce a 1-45 number range and implemented automated Jackpot Rollover logic (40% of pool) if no 5-match winner is found.
- **Winner Verification & Admin Payouts**: Built a secure "My Wins" portal for users to upload proof and a corresponding administrative interface for proof review and prize disbursement.
- **Admin Draw Transparency**: Added a persistent results modal in the Admin Hub, ensuring winners and winning numbers are clearly documented before the next round begins.

### Phase 13: High-Fidelity UI & UX Refinements (Completed)

This phase focused on professionalizing the public-facing platform and ensuring a seamless, irritating-free user experience.

- **Draw Mechanics Showcase**: Added a premium section to the Landing Page detailing the **1-45 number pool**, **Rolling Eligibility** (last 5 scores), and the **tiered matching prizes** ($50, $500, and the Jackpot).
- **Premium Design Audit**: Conducted a full visual audit of the landing page, ensuring brand colors (Green/Gold) and modern typography (inter/black) are consistent across all breakpoints.

