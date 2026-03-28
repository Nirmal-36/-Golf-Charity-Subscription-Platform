# API Specification

The Golf Charity platform utilizes a stateless, headless REST API architecture. All communications are orchestrated via JSON over HTTPS, with security enforced through standard JWT (JSON Web Token) protocols.

## Authentication & Identity
*   **POST `/api/accounts/register/`**: Initialize a new member or organization identity.
*   **POST `/api/accounts/login/`**: Secure authentication gateway; returns ROT (Refresh/Access Token) pairs.
*   **POST `/api/accounts/token/refresh/`**: Executes zero-latency token rotation.
*   **GET `/api/accounts/profile/`**: Retrieves the unified identity context and active subscription state.

## Scoring & Performance
*   **GET `/api/scores/`**: Lists the authenticated user's rolling 5-score active handicap dataset.
*   **POST `/api/scores/`**: Transmits a new performance entry (Stableford format requirements applied).
*   **PATCH `/api/scores/{id}/`**: Synchronizes modifications to existing entries with owner-only access.

## Partner Ecosystem (Charities)
*   **GET `/api/charities/`**: Public directory of verified charitable organizations.
*   **GET `/api/charities/{slug}/`**: Detailed profile retrieval including mission statements and impact metrics.
*   **POST `/api/charities/apply/`**: Onboarding gateway for new philanthropic partner organizations.
*   **GET `/api/charities/{slug}/donations/`**: Granular disbursement ledger (accessible only to organization principals).

## Prize Draw Mechanics
*   **GET `/api/draws/current/`**: Active parameters for the upcoming monthly jackpot.
*   **POST `/api/draws/entry/`**: Registers the user's 5-number selection (1-45) for the active round.
*   **GET `/api/draws/history/`**: Historical archive of results and user-specific match performance.
*   **POST `/api/draws/winners/upload-proof/`**: Verification gateway for prize matching; requires binary image payload.

## Platform Governance (Staff Only)
*   **GET `/api/accounts/admin/stats/`**: Aggregated KPIs including global revenue and total charitable impact.
*   **POST `/api/draws/admin/execute/`**: Orchestrates the monthly draw calculation and winner determination.
*   **PATCH `/api/draws/admin/winners/{id}/`**: Evaluates and finalizes prize claim verification proofs.
*   **PATCH `/api/charities/admin/verify/`**: Executes the final verification review for new partner applications.
