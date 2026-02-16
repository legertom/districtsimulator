"use client";

import { useState } from "react";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { InstructionalProvider, useInstructional } from "@/context/InstructionalContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import ChatPanel from "@/components/chat/ChatPanel";
import CoachMark from "@/components/guidance/CoachMark";
import GuidancePanel from "@/components/guidance/GuidancePanel";
import PortalLobby from "@/components/pages/PortalLobby";

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

const pageComponents = {
  dashboard: DashboardHome,
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
  profile: Profile,
};

function AppShell({ onSwitchToPortal, initialNav = "dashboard" }) {
  const [activeNav, setActiveNav] = useState(initialNav);
  const { checkNavigationGoal } = useInstructional();

  const handleNavChange = (navId) => {
    setActiveNav(navId);
    checkNavigationGoal(navId);
  };

  const renderPage = () => {
    const PageComponent = pageComponents[activeNav];

    if (PageComponent) {
      return <PageComponent />;
    }

    return (
      <PlaceholderPage
        title={activeNav.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        icon="📄"
      />
    );
  };

  return (
    <div className={styles.appContainer}>
      <CoachMark />
      <div className={styles.dashboardContainer}>
        <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

        <div className={styles.contentColumn}>
          <TopNav onNavChange={handleNavChange} onSwitchToPortal={onSwitchToPortal} />
          <main className={styles.dashboardMain}>{renderPage()}</main>
        </div>
      </div>

      <div className={styles.chatPanelContainer}>
        <GuidancePanel />
        <ChatPanel />
      </div>
    </div>
  );
}

export default function Home() {
  const [appMode, setAppMode] = useState("portal");
  const [launchNav, setLaunchNav] = useState("dashboard");

  const handleLaunchApp = (navTarget) => {
    setLaunchNav(navTarget);
    setAppMode("dashboard");
  };

  return (
    <ScenarioProvider>
      <InstructionalProvider>
        {appMode === "portal" ? (
          <PortalLobby
            onLaunchApp={handleLaunchApp}
            onEnterDashboard={() => handleLaunchApp("dashboard")}
          />
        ) : (
          <AppShell
            key={launchNav}
            initialNav={launchNav}
            onSwitchToPortal={() => setAppMode("portal")}
          />
        )}
      </InstructionalProvider>
    </ScenarioProvider>
  );
}
