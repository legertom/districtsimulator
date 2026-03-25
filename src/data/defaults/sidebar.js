/**
 * Sidebar domain data
 * Extracted from: Sidebar.jsx
 */

export const navItems = [
    {
        id: "home",
        label: "Dashboard home",
        icon: "dashboard",
    },
    {
        id: "applications",
        label: "Applications",
        icon: "applicationsGrid",
        children: [
            { id: "my-applications", label: "My applications" },
            { id: "add-applications", label: "Add applications" },
            { id: "lms-connect", label: "LMS Connect" },
            { id: "library-controls", label: "Library controls" },
        ]
    },
    {
        id: "data-sources",
        label: "Data sources",
        icon: "dataSources",
        children: [
            { id: "sis-sync", label: "SIS sync" },
            { id: "custom-data", label: "Custom data" },
        ]
    },
    {
        id: "data-browser",
        label: "Data browser",
        icon: "dataBrowser",
        hasDividerAfter: true,
    },
    {
        id: "user-management",
        label: "User management",
        icon: "userManagement",
        children: [
            { id: "idm", label: "IDM" },
            { id: "license-manager", label: "License manager" },
            { id: "admin-team", label: "Admin team" },
        ]
    },
    {
        id: "authentication",
        label: "Authentication",
        icon: "authentication",
        children: [
            { id: "access-logs", label: "Access logs" },
            { id: "sso-settings", label: "SSO settings" },
            { id: "badges", label: "Badges" },
            { id: "classroom-mfa", label: "Classroom MFA" },
        ]
    },
    {
        id: "portal",
        label: "Portal",
        icon: "portal",
        hasDividerAfter: true,
        children: [
            { id: "organize-district-portal", label: "Organize district portal" },
            { id: "portal-settings", label: "Portal settings" },
            { id: "communication", label: "Communication" },
        ]
    },
    {
        id: "support-tools",
        label: "Support tools",
        icon: "supportTools",
        children: [
            { id: "troubleshoot-login", label: "Troubleshoot login" },
            { id: "troubleshoot-sharing", label: "Troubleshoot sharing" },
            { id: "data-quality", label: "Data quality" },
        ]
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: "analytics",
        children: [
            { id: "portal-analytics", label: "Portal analytics" },
            { id: "edtech-analytics", label: "Edtech analytics" },
            { id: "reports", label: "Reports" },
        ]
    },
];

export const districtInfo = {
    name: "#DEMO Cedar Ridge SD (Sandbox)..."
};
