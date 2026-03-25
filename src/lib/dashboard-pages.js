import DashboardHome from "@/components/pages/DashboardHome";
import MyApplications from "@/components/pages/MyApplications";
import AddApplications from "@/components/pages/AddApplications";
import LMSConnect from "@/components/pages/LMSConnect";
import Library from "@/components/pages/Library";
import SISSync from "@/components/pages/SISSync";
import CustomData from "@/components/pages/CustomData";
import IDM from "@/components/pages/IDM";
import LicenseManager from "@/components/pages/LicenseManager";
import AdminTeam from "@/components/pages/AdminTeam";
import AccessLogs from "@/components/pages/AccessLogs";
import SSOSettings from "@/components/pages/SSOSettings";
import Badges from "@/components/pages/Badges";
import ClassroomMFA from "@/components/pages/ClassroomMFA";
import PortalSettings from "@/components/pages/PortalSettings";
import OrganizeDistrictPortal from "@/components/pages/OrganizeDistrictPortal";
import Communication from "@/components/pages/Communication";
import DataBrowser from "@/components/pages/DataBrowser";
import Profile from "@/components/pages/Profile";
import TroubleshootLogin from "@/components/pages/TroubleshootLogin";
import TroubleshootSharing from "@/components/pages/TroubleshootSharing";
import DataQuality from "@/components/pages/DataQuality";
import PortalAnalytics from "@/components/pages/PortalAnalytics";
import EdtechAnalytics from "@/components/pages/EdtechAnalytics";
import Reports from "@/components/pages/Reports";

export const DASHBOARD_PAGE_COMPONENTS = {
    home: DashboardHome,
    "my-applications": MyApplications,
    "add-applications": AddApplications,
    "lms-connect": LMSConnect,
    "library-controls": Library,
    "sis-sync": SISSync,
    "custom-data": CustomData,
    "data-browser": DataBrowser,
    idm: IDM,
    "license-manager": LicenseManager,
    "admin-team": AdminTeam,
    "access-logs": AccessLogs,
    "sso-settings": SSOSettings,
    badges: Badges,
    "classroom-mfa": ClassroomMFA,
    "portal-settings": PortalSettings,
    "organize-district-portal": OrganizeDistrictPortal,
    communication: Communication,
    "troubleshoot-login": TroubleshootLogin,
    "troubleshoot-sharing": TroubleshootSharing,
    "data-quality": DataQuality,
    "portal-analytics": PortalAnalytics,
    "edtech-analytics": EdtechAnalytics,
    reports: Reports,
    profile: Profile,
};
