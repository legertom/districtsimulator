"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import ChatPanel from "@/components/chat/ChatPanel";

// Pages
import DashboardHome from "@/components/pages/DashboardHome";
import MyApplications from "@/components/pages/MyApplications";
import AddApplications from "@/components/pages/AddApplications";
import LMSConnect from "@/components/pages/LMSConnect";
import Library from "@/components/pages/Library";
import PlaceholderPage from "@/components/dashboard/pages/PlaceholderPage";

// New Pages
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
import DataBrowser from "@/components/pages/DataBrowser";
import Profile from "@/components/pages/Profile";

import styles from "./page.module.css";

// Page configuration - maps nav IDs to components
const pageComponents = {
  // Dashboard
  "dashboard": DashboardHome,

  // Applications
  "my-applications": MyApplications,
  "add-applications": AddApplications,
  "lms-connect": LMSConnect,
  "library-controls": Library,

  // Data Sources
  "sis-sync": SISSync,
  "custom-data": CustomData,
  "data-browser": DataBrowser,

  // User Management
  "idm": IDM,
  "license-manager": LicenseManager,
  "admin-team": AdminTeam,

  // Authentication
  "access-logs": AccessLogs,
  "sso-settings": SSOSettings,
  "badges": Badges,
  "classroom-mfa": ClassroomMFA,


  // Portal
  "portal-settings": PortalSettings,

  // User Profile
  "profile": Profile,
};

export default function Home() {
  const [activeNav, setActiveNav] = useState("dashboard");

  const renderPage = () => {
    const PageComponent = pageComponents[activeNav];

    if (PageComponent) {
      return <PageComponent />;
    }

    // For pages without a component, show placeholder
    return (
      <PlaceholderPage
        title={activeNav.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        icon="📄"
      />
    );
  };

  return (
    <div className={styles.appContainer}>
      {/* Dashboard Simulation */}
      <div className={styles.dashboardContainer}>
        {/* Sidebar now controls the full height left column */}
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

        {/* Content Column: TopNav + Main Content */}
        <div className={styles.contentColumn}>
          <TopNav onNavChange={setActiveNav} />
          <main className={styles.dashboardMain}>
            {renderPage()}
          </main>
        </div>
      </div>

      {/* Chat Panel */}
      <div className={styles.chatPanelContainer}>
        <ChatPanel />
      </div>
    </div>
  );
}
