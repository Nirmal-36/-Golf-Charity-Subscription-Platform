# System Architecture Overview

The platform is engineered as a secure, role-based ecosystem focusing on transaction integrity and philanthropic transparency. This document details the core architectural decisions that govern the system's runtime and data integrity.

## Structural Strategy
The application utilizes a monorepo architecture with a clean decoupling of the client and server layers.

*   **Headless Backend:** A stateless Django REST API orchestrating business logic, security protocols, and background automation.
*   **Premium Client:** A React Single Page Application (SPA) designed for zero-latency interactions and motion-enhanced UX.

## Core Data Modeling
*   **Identity (Accounts):** Extends standard authentication to support multi-tenant roles (`Member`, `Organization`, `Admin`) and automated billing synchronization with Stripe.
*   **Performance Tracking (Scores):** Employs a rolling-window algorithm to maintain an active 5-score handicap, ensuring competitive relevance for all members.
*   **Philanthropic Hub (Charities):** Manages organizations through a vetted verification lifecycle, tracking historical impact and disbursement health.
*   **Gamification (Draws):** Orchestrates the prize round lifecycle, from participant entry encryption to automated number generation and winners' claim verification.

## Functional Engines

### Revenue Orchestration
All platform inflows are automatically split according to a verified 40/10/50 logic:
*   **40% (Prize Pool):** Direct allocation to the Monthly Jackpot.
*   **10% (Philanthropy):** Minimum commitment to the user's targeted charity partner.
*   **50% (Platform):** Reserved for technical infrastructure and operations.

### The Draw Algorithm
The draw engine is executed via asynchronous Celery tasks, supporting both standard random generation and weighted logic influenced by global scoring trends. In the event of an unclaimed jackpot, the system executes a mandatory "Rollover" to the proceeding month.

## Scalability & Future State
*   **Internationalization:** Built with `Decimal` precision for multi-currency support and `UTC` internal time tracking for global consistency.
*   **API-First Design:** The headless architecture ensures the backend is fully prepared for future native mobile application deployments (iOS/Android) without requiring structural modifications.
*   **Impact Verification:** Integrated image processing for scorecard verification ensures legal and sporting compliance for all high-value prize claims.
