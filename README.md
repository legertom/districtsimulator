# District Simulator

A training simulator for the Clever Dashboard, built with **Next.js 16 (App Router)** and **NextAuth.js**. This application replicates the experience of a school principal managing digital learning resources, designed for training purposes without exposing real student data.

## Architecture

The application is built on a modern, secure stack designed for performance and maintainability:

-   **Frontend Framework**: Next.js 16 (App Router) with React 19.
-   **Authentication**: Next.js Auth (NextAuth.js v4) handling session management and OAuth flows.
-   **State Management**: React Context (`ScenarioContext`) manages the global simulation state, hydrating unique training scenarios.
-   **Styling**: CSS Modules provide scoped, component-level styling to prevent leakage and ensure visual consistency.
-   **Data Layer**: Review-safe architectural choice—**Client-Side Data Simulation**.
    -   No external database connection required for core training features.
    -   All entities (students, schools, logs) are generated from deterministic fixtures in `src/data/`.
    -   Modifications (e.g., changing settings) are persisted in ephemeral memory or local storage, resetting on reload ensures consistent training starting points.

## Security

For a detailed overview of the application's security architecture and data handling policies, please refer to the [Security Brief](./SECURITY_BRIEF.md).

This application adheres to strict security standards suitable for enterprise deployment reviews.

### Authentication & Authorization
-   **Provider**: NextAuth.js handles all authentication flows.
-   **Methods**:
    -   **Google OAuth 2.0**: Primary production authentication method.
        -   **Restriction**: **Strictly limited to `@clever.com` email domains**. Any other Google account will be denied access.
        -   **Infrastructure**: OAuth application is hosted on the Google Cloud Platform account `tom.leger@clever.com` (Engineering/IT controlled).
    -   **Credentials**: Restricted development-only access for internal testing.
-   **Session Management**: Secure, encrypted JWT (JSON Web Tokens) strategy. No sensitive session data is exposed to the client-side JavaScript.
-   **RBAC (Role-Based Access Control)**: Internal role management (Admin/Member) verifies permissions for sensitive dashboard actions.

### Route Protection
-   **Middleware Enforcement**: A global `proxy.js` (formerly `middleware.js`) acts as a security gatekeeper for the entire application.
    -   **Allowlist Approach**: All routes are denied by default.
    -   **Exceptions**: Only `/login`, `/api/auth/*` (auth handshake), and static assets (`/_next`, `/favicon.ico`, images) are publicly accessible.
    -   **Automatic Redirection**: Unauthenticated requests to protected resources are instantly redirected to the login flow.

### Data Privacy
-   **Zero PII Exposure**: The application contains **NO real student or district data**.
-   **Synthetic Fixtures**: All data displayed (names, emails, IDs) is synthetically generated mock data found in `src/data/defaults`.
-   **Compliance**: Safe for deployment in non-HIPAA/FERPA compliant environments as no regulated data is processed.

### Security Deep Dive

To address specific enterprise security concerns:

1.  **Authentication Modes**:
    -   **Credentials Provider**: Available for training and demonstration purposes to simulate admin access without external dependencies.
    -   **Google OAuth**: Enforces strict domain validation for authorized users.

2.  **Session & Cookie Security**:
    -   **HttpOnly Cookies**: Session tokens are stored in `HttpOnly` cookies, preventing access via client-side scripts (mitigating XSS attacks).
    -   **SameSite Policy**: Cookies use `SameSite=Lax` by default to prevent CSRF (Cross-Site Request Forgery) attacks.
    -   **Secure Attribute**: Cookies are automatically marked `Secure` (HTTPS only) in production.

3.  **XSS (Cross-Site Scripting) Protection**:
    -   **React Auto-Escaping**: React 19 automatically escapes variables in views, preventing injection of malicious scripts.
    -   **Sanitization**: Any raw HTML rendering (if strictly necessary) would be sanitized (though none is currently used in critical paths).

4.  **CSRF Protection**:
    -   NextAuth.js implements Double Submit Cookie pattern and safeguards all state-changing routes.

## Hosting & Deployment

-   **Platform**: Vercel (recommended) or any Node.js compatible container.
-   **CI/CD**: Automated deployments via Git integration.
-   **Secrets Management**:
    -   All sensitive keys (OAuth secrets, NextAuth secrets) are stored strictly in Environment Variables.
    -   No secrets are committed to the codebase.

## Getting Started

### Prerequisites
-   **Node.js**: v18.17.0 or higher
-   **npm**: v9.0.0 or higher

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Copy `.env.example` to `.env.local` and configure your keys:
    ```bash
    cp .env.example .env.local
    ```
    *Required variables:*
    -   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For OAuth.
    -   `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`.
    -   `NEXTAUTH_URL`: Canonical URL of the site (e.g., `http://localhost:3000`).

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Access the App:**
    Open [http://localhost:3000](http://localhost:3000).
