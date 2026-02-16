/**
 * Portal Lobby domain data
 *
 * Each app card defines its display properties and launch behavior.
 *
 * launchMode:
 *   "dashboard" — navigate into the admin dashboard at the given launchTarget page
 *   "comingSoon" — show a placeholder; the feature is not yet wired
 *
 * launchTarget:
 *   A pageComponents key (e.g. "my-applications", "sis-sync") when launchMode is "dashboard".
 *   Ignored for "comingSoon" entries.
 */

export const portalApps = [
    // ── Live apps (navigate to dashboard pages) ──────────────────
    {
        id: "portal-dashboard",
        name: "Admin Dashboard",
        icon: "🏠",
        iconColor: "#1e3a5f",
        launchMode: "dashboard",
        launchTarget: "dashboard",
    },
    {
        id: "portal-my-apps",
        name: "My Applications",
        icon: "📦",
        iconColor: "#6366f1",
        launchMode: "dashboard",
        launchTarget: "my-applications",
    },
    {
        id: "portal-add-apps",
        name: "Add Applications",
        icon: "➕",
        iconColor: "#0ea5e9",
        launchMode: "dashboard",
        launchTarget: "add-applications",
    },
    {
        id: "portal-sis-sync",
        name: "SIS Sync",
        icon: "🔄",
        iconColor: "#f59e0b",
        launchMode: "dashboard",
        launchTarget: "sis-sync",
    },
    {
        id: "portal-data-browser",
        name: "Data Browser",
        icon: "🗂️",
        iconColor: "#8b5cf6",
        launchMode: "dashboard",
        launchTarget: "data-browser",
    },
    {
        id: "portal-admin-team",
        name: "Admin Team",
        icon: "👥",
        iconColor: "#14b8a6",
        launchMode: "dashboard",
        launchTarget: "admin-team",
    },
    {
        id: "portal-access-logs",
        name: "Access Logs",
        icon: "📋",
        iconColor: "#64748b",
        launchMode: "dashboard",
        launchTarget: "access-logs",
    },
    {
        id: "portal-sso-settings",
        name: "SSO Settings",
        icon: "🔐",
        iconColor: "#ef4444",
        launchMode: "dashboard",
        launchTarget: "sso-settings",
    },
    {
        id: "portal-badges",
        name: "Badges",
        icon: "🏅",
        iconColor: "#f97316",
        launchMode: "dashboard",
        launchTarget: "badges",
    },
    {
        id: "portal-portal-settings",
        name: "Portal Settings",
        icon: "⚙️",
        iconColor: "#475569",
        launchMode: "dashboard",
        launchTarget: "portal-settings",
    },
    {
        id: "portal-lms-connect",
        name: "LMS Connect",
        icon: "🔗",
        iconColor: "#059669",
        launchMode: "dashboard",
        launchTarget: "lms-connect",
    },
    {
        id: "portal-library",
        name: "Library Controls",
        icon: "📚",
        iconColor: "#7c3aed",
        launchMode: "dashboard",
        launchTarget: "library-controls",
    },

    // ── Coming soon (placeholder cards) ──────────────────────────
    {
        id: "portal-analytics",
        name: "Analytics",
        icon: "📊",
        iconColor: "#94a3b8",
        launchMode: "comingSoon",
        launchTarget: null,
    },
    {
        id: "portal-reports",
        name: "Reports",
        icon: "📈",
        iconColor: "#94a3b8",
        launchMode: "comingSoon",
        launchTarget: null,
    },
    {
        id: "portal-support-tools",
        name: "Support Tools",
        icon: "🛠️",
        iconColor: "#94a3b8",
        launchMode: "comingSoon",
        launchTarget: null,
    },
    {
        id: "portal-communication",
        name: "Communication",
        icon: "💬",
        iconColor: "#94a3b8",
        launchMode: "comingSoon",
        launchTarget: null,
    },
];
