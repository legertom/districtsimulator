"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { InstructionalProvider, useInstructional } from "@/context/InstructionalContext";
import { DataVariantProvider } from "@/context/DataVariantContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import CoachMark from "@/components/guidance/CoachMark";
import RightPanel from "@/components/helpdesk/RightPanel";
import { buildApplicationDetailsRoute, buildDashboardRoute } from "@/lib/routing";
import styles from "./DashboardShell.module.css";

function DashboardShellContent({ activeNav, children, showChatPanel }) {
    const router = useRouter();
    const pathname = usePathname();
    const { checkNavigationGoal, activeScenarioId, normalizedCurrentStep, rightPanelView } = useInstructional();

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

    // If the active instructional step requires a route goal, ensure the user
    // is on that page even when they accept a ticket from a different layout
    // (e.g. deep inside provisioning wizard).
    useEffect(() => {
        const goalRoute = normalizedCurrentStep?.goalRoute;
        const inTicketFlow = rightPanelView === "investigation" || rightPanelView === "conversation";

        if (!activeScenarioId || !inTicketFlow || !goalRoute) return;

        const targetRoute = buildDashboardRoute(goalRoute);
        if (pathname === targetRoute) return;

        router.push(targetRoute);
    }, [activeScenarioId, rightPanelView, normalizedCurrentStep?.goalRoute, pathname, router]);

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
            <DataVariantProvider>
                <DashboardShellContent activeNav={activeNav} showChatPanel={showChatPanel}>
                    {children}
                </DashboardShellContent>
            </DataVariantProvider>
        </InstructionalProvider>
    );
}
