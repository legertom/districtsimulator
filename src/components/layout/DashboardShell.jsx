"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { InstructionalProvider, useInstructional } from "@/context/InstructionalContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import CoachMark from "@/components/guidance/CoachMark";
import RightPanel from "@/components/helpdesk/RightPanel";
import { buildApplicationDetailsRoute, buildDashboardRoute } from "@/lib/routing";
import styles from "./DashboardShell.module.css";

function DashboardShellContent({ activeNav, children, showChatPanel }) {
    const router = useRouter();
    const { checkNavigationGoal } = useInstructional();

    const handleNavChange = useCallback((navId, options = {}) => {
        checkNavigationGoal(navId);

        let targetRoute = buildDashboardRoute(navId);

        if (options.applicationId !== undefined && options.applicationId !== null) {
            targetRoute = buildApplicationDetailsRoute(options.applicationId);
        } else if (options.appId !== undefined && options.appId !== null) {
            const searchParams = new URLSearchParams();
            searchParams.set("appId", String(options.appId));
            targetRoute = `${targetRoute}?${searchParams.toString()}`;
        }

        router.push(targetRoute);
    }, [checkNavigationGoal, router]);

    const handleSwitchToPortal = useCallback(() => {
        router.push("/");
    }, [router]);

    return (
        <div className={styles.appContainer}>
            <CoachMark />
            <div className={styles.dashboardContainer}>
                <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

                <div className={styles.contentColumn}>
                    <TopNav onNavChange={handleNavChange} onSwitchToPortal={handleSwitchToPortal} />
                    <main className={styles.dashboardMain}>{children}</main>
                </div>
            </div>

            {showChatPanel ? (
                <div className={styles.chatPanelContainer}>
                    <RightPanel />
                </div>
            ) : null}
        </div>
    );
}

export default function DashboardShell({ activeNav, children, showChatPanel = true }) {
    return (
        <InstructionalProvider>
            <DashboardShellContent activeNav={activeNav} showChatPanel={showChatPanel}>
                {children}
            </DashboardShellContent>
        </InstructionalProvider>
    );
}
