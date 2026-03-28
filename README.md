# Golf Charity Subscription Platform

A professional, impact-first web ecosystem designed to bridge the gap between golf performance tracking and philanthropic giving. Unlike traditional sports platforms, this application leads with charitable purpose, offering a modern, motion-enhanced interface that prioritizes donation transparency and community engagement.

## Project Vision
The platform transforms the standard golf handicap lifecycle into a vehicle for global good. By subscribing, members automate their charitable footprint while gaining access to an advanced scoring system and monthly prize draws featuring high-value hardware and travel rewards.

## Core Pillars
*   **Philanthropic Automation:** Integrated Stripe-powered memberships where 10% of every fee is directly routed to a user-selected charity partner.
*   **Performance Analytics:** A mathematically rigorous scoring engine that calculates a rolling 5-score active handicap.
*   **The Monthly Jackpot:** A transparent, automated draw system with tiered prize pools and integrated winner verification.
*   **Partner Ecosystem:** A dedicated hub for charitable organizations to manage their profiles and track real-time donation inflows.
*   **Administrative Oversight:** A robust command center for platform governance, draw regulation, and fiscal auditing.

## Technical Implementation
This project is built as a highly scalable monorepo leveraging modern industry standards:
*   **Backend:** High-performance Django REST Framework API with JWT authentication and Role-Based Access Control (RBAC).
*   **Database:** Supabase (PostgreSQL) for secure, enterprise-grade data persistence.
*   **Frontend:** A premium React SPA built with Vite and Tailwind CSS, featuring extensive micro-animations and a mobile-first responsive design.
*   **Infrastructure:** Celery and Redis orchestration for complex background tasks, including draw execution and automated winner notifications.

## System Documentation
Detailed technical guides are available in the [docs/](file:///Users/nirmalmadhunala/Desktop/Golf Charity Subscription Platform/docs/) directory:
*   [Setup Guide](file:///Users/nirmalmadhunala/Desktop/Golf Charity Subscription Platform/docs/SETUP.md): Infrastructure provisioning and local development protocols.
*   [Architecture Overview](file:///Users/nirmalmadhunala/Desktop/Golf Charity Subscription Platform/docs/ARCHITECTURE.md): Deep dive into the system's structural integrity and data models.
*   [API Specification](file:///Users/nirmalmadhunala/Desktop/Golf Charity Subscription Platform/docs/API.md): Documentation for the platform's headless REST endpoints.
*   [Vercel Environment Guide](file:///Users/nirmalmadhunala/Desktop/Golf Charity Subscription Platform/docs/VERCEL_ENVIRONMENT_VARIABLES.md): Mandatory keys for production deployment.
