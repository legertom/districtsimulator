/**
 * Portal Lobby domain data
 *
 * The portal home screen mirrors the real district login experience:
 * - Top icon nav (Search / Portal / Dashboard / Notifications / Account)
 * - Category rail on the left
 * - Resource tiles in the main panel
 */

export const portalTopNavItems = [
    { id: "search", label: "Search", icon: "search" },
    { id: "portal", label: "Portal", icon: "portalGrid" },
    { id: "dashboard", label: "Dashboard", icon: "dashboardPanel" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "account", label: "Account", icon: "accountCircle" },
];

export const portalCategories = [
    { id: "more-apps", label: "More Apps" },
    { id: "district-tools", label: "District Tools" },
    { id: "coming-soon", label: "Coming Soon" },
];

export const portalNotice = {
    title: "We've streamlined your Portal organization experience",
    body: [
        "One-Stop Organizing: Quickly move resources, update sharing rules, edit, and preview the end-user Portal for teachers and students all in one place: Dashboard > Portal > Organize district portal.",
        "Admin SSO: The Portal tab at the top of your dashboard is now focused on the apps you, as an Admin, need to access.",
    ],
    learnMoreLabel: "Learn more here.",
    learnMoreHref: "#",
};

/**
 * launchMode:
 *   "dashboard" — navigate into the admin dashboard at the given launchTarget page
 *   "comingSoon" — visual only; show a temporary toast
 */
export const portalApps = [
    {
        id: "waffle-wizard-academy",
        categoryId: "more-apps",
        name: "Waffle Wizard Academy",
        iconText: "WW\nA",
        iconBackground: "radial-gradient(circle at 35% 35%, #f59e0b 0%, #f97316 60%, #c2410c 100%)",
        iconTextColor: "#ffffff",
        launchMode: "dashboard",
        launchTarget: "home",
    },
    {
        id: "district-dashboard",
        categoryId: "district-tools",
        name: "Admin Dashboard",
        iconText: "AD",
        iconBackground: "linear-gradient(135deg, #1946b8 0%, #1464ff 100%)",
        iconTextColor: "#ffffff",
        launchMode: "dashboard",
        launchTarget: "home",
    },
    {
        id: "district-my-apps",
        categoryId: "district-tools",
        name: "My Applications",
        iconText: "MY",
        iconBackground: "linear-gradient(135deg, #3f4ecf 0%, #6578ff 100%)",
        iconTextColor: "#ffffff",
        launchMode: "dashboard",
        launchTarget: "my-applications",
    },
    {
        id: "coming-soon-analytics",
        categoryId: "coming-soon",
        name: "Analytics",
        iconText: "A",
        iconBackground: "linear-gradient(135deg, #9ba6b8 0%, #c2cad7 100%)",
        iconTextColor: "#ffffff",
        launchMode: "comingSoon",
        launchTarget: null,
    },
    {
        id: "coming-soon-reports",
        categoryId: "coming-soon",
        name: "Reports",
        iconText: "R",
        iconBackground: "linear-gradient(135deg, #9ba6b8 0%, #c2cad7 100%)",
        iconTextColor: "#ffffff",
        launchMode: "comingSoon",
        launchTarget: null,
    },
];
