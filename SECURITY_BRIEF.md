# Application Security Brief: Principal Jones Simulator

**Date:** February 19, 2026
**Point of Contact:** Tom Leger (tom.leger@clever.com)

## 1. Overview
The **Principal Jones Simulator** is a training application designed to replicate the Clever Dashboard environment for school principals. Its primary purpose is to train internal staff and partners on dashboard functionality **without accessing or exposing any real student PII (Personally Identifiable Information)**.

## 2. PII & Data Handling
-   **Zero PII**: This application **does not** connect to any production student databases.
-   **Synthetic Data**: All data displayed (names, IDs, emails) is purely synthetic, generated from static JSON fixtures within the application code.
-   **Data Persistence**: No database is used. User actions (e.g., changing settings) are stored in temporary client-side state or ephemeral local storage and reset upon session termination.

## 3. Architecture & Hosting
-   **Stack**: Next.js 16 (App Router), React 19.
-   **Hosting**: Deployed on **Vercel** (serverless runtime).
-   **Source Code**: Private GitHub repository protected by organization controls.

## 4. Authentication & Access Control
Access to the application is strictly controlled via **NextAuth.js**:

### A. Authentication Methods
1.  **Google OAuth (Production)**:
    -   **Restriction**: Logins are strictly limited to the verified **`@clever.com`** email domain.
    -   **Identity Provider**: Managed via Google Cloud Platform Project owned by `tom.leger@clever.com` (Engineering/IT).
2.  **Credentials (Training Only)**:
    -   A hardcoded credentials provider is permitted for specific training scenarios where OAuth is not feasible. This account has no administrative access outside the simulator context.

### B. Route Protection
-   **Global Middleware**: A strict `middleware.js` layer intercepts all requests.
-   **Deny-by-Default**: Unknown users are blocked from all routes and immediately redirected to the login screen.

## 5. Security Controls
-   **Session Security**: Uses `HttpOnly`, `SameSite=Lax`, and `Secure` cookies to prevent session hijacking and XSS.
-   **CSRF Protection**: Double Submit Cookie pattern enforcement on all state-changing requests.
-   **XSS Mitigation**: React 19 auto-escaping logic is utilized throughout the UI layer.

## 6. How to Login (For Reviewers)
To verify access controls:
1.  Navigate to the deployed URL.
2.  Select **"Sign in with Google"**.
3.  Attempt login with a `@clever.com` address (Success).
4.  Attempt login with a personal Gmail address (Failure/Access Denied).
