import { WIZARD_STEPS } from "@/data/defaults/idm-provisioning";

export const DEFAULT_DASHBOARD_PAGE = "dashboard";

export const DASHBOARD_PAGE_KEYS = [
    "dashboard",
    "my-applications",
    "add-applications",
    "lms-connect",
    "library-controls",
    "sis-sync",
    "custom-data",
    "data-browser",
    "idm",
    "license-manager",
    "admin-team",
    "access-logs",
    "sso-settings",
    "badges",
    "classroom-mfa",
    "portal-settings",
    "organize-district-portal",
    "communication",
    "troubleshoot-login",
    "troubleshoot-sharing",
    "data-quality",
    "portal-analytics",
    "edtech-analytics",
    "reports",
    "profile",
];

const dashboardPageSet = new Set(DASHBOARD_PAGE_KEYS);

export const PROVISIONING_STEP_IDS = WIZARD_STEPS.map((step) => step.id);
export const DEFAULT_PROVISIONING_STEP = PROVISIONING_STEP_IDS[0];

const provisioningStepSet = new Set(PROVISIONING_STEP_IDS);

export function getRouteParamValue(param) {
    if (Array.isArray(param)) {
        return param[0] ?? "";
    }

    if (typeof param === "number") {
        return String(param);
    }

    return typeof param === "string" ? param : "";
}

function normalizeParam(param) {
    return getRouteParamValue(param).trim().toLowerCase();
}

export function isValidDashboardPage(page) {
    return dashboardPageSet.has(normalizeParam(page));
}

export function parseDashboardPage(page) {
    const normalizedPage = normalizeParam(page);

    if (dashboardPageSet.has(normalizedPage)) {
        return normalizedPage;
    }

    return DEFAULT_DASHBOARD_PAGE;
}

function parseProvisioningStepNumber(value) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > PROVISIONING_STEP_IDS.length) {
        return null;
    }

    return PROVISIONING_STEP_IDS[parsed - 1];
}

export function isValidProvisioningStep(step) {
    const normalizedStep = normalizeParam(step);

    if (provisioningStepSet.has(normalizedStep)) {
        return true;
    }

    return parseProvisioningStepNumber(normalizedStep) !== null;
}

export function parseProvisioningStep(step) {
    const normalizedStep = normalizeParam(step);

    if (provisioningStepSet.has(normalizedStep)) {
        return normalizedStep;
    }

    const stepFromNumber = parseProvisioningStepNumber(normalizedStep);
    if (stepFromNumber) {
        return stepFromNumber;
    }

    return DEFAULT_PROVISIONING_STEP;
}

export function parseApplicationId(appId) {
    const normalizedAppId = getRouteParamValue(appId).trim();

    if (!normalizedAppId || !/^\d+$/.test(normalizedAppId)) {
        return null;
    }

    const parsedAppId = Number.parseInt(normalizedAppId, 10);
    if (!Number.isInteger(parsedAppId) || parsedAppId < 1) {
        return null;
    }

    return parsedAppId;
}

export function buildDashboardRoute(page) {
    return `/dashboard/${parseDashboardPage(page)}`;
}

export function buildApplicationDetailsRoute(appId) {
    const parsedAppId = parseApplicationId(appId);

    if (parsedAppId === null) {
        return buildDashboardRoute("my-applications");
    }

    return `/dashboard/my-applications/${parsedAppId}`;
}

export function buildProvisioningRoute(step) {
    return `/dashboard/idm/provisioning/${parseProvisioningStep(step)}`;
}

// ── Profile routes ──────────────────────────────────────────

export function parseProfileId(id) {
    const normalizedId = getRouteParamValue(id).trim();
    if (
        !normalizedId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedId)
    ) {
        return null;
    }
    return normalizedId;
}

export function buildStudentProfileRoute(id) {
    const parsedId = parseProfileId(id);
    if (parsedId === null) return buildDashboardRoute("data-browser");
    return `/dashboard/student-profile/${parsedId}`;
}

export function buildTeacherProfileRoute(id) {
    const parsedId = parseProfileId(id);
    if (parsedId === null) return buildDashboardRoute("data-browser");
    return `/dashboard/teacher-profile/${parsedId}`;
}

export function buildStaffProfileRoute(id) {
    const parsedId = parseProfileId(id);
    if (parsedId === null) return buildDashboardRoute("data-browser");
    return `/dashboard/staff-profile/${parsedId}`;
}

export function buildProfileRouteByType(userType, id) {
    const type = userType?.toLowerCase();
    if (type === "student") return buildStudentProfileRoute(id);
    if (type === "teacher") return buildTeacherProfileRoute(id);
    if (type === "staff") return buildStaffProfileRoute(id);
    return buildDashboardRoute("data-browser");
}
