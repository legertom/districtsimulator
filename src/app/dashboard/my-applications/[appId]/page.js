"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import MyApplicationDetails from "@/components/pages/MyApplicationDetails";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildApplicationDetailsRoute,
    buildDashboardRoute,
    getRouteParamValue,
    parseApplicationId,
} from "@/lib/routing";

export default function MyApplicationDetailsRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const applications = scenario.applications?.myApplications;

    const rawAppId = getRouteParamValue(params?.appId);
    const parsedAppId = useMemo(() => parseApplicationId(rawAppId), [rawAppId]);

    const selectedApp = useMemo(() => {
        if (parsedAppId === null) {
            return null;
        }

        const appList = Array.isArray(applications) ? applications : [];
        return appList.find((app) => app.id === parsedAppId) ?? null;
    }, [applications, parsedAppId]);

    useEffect(() => {
        if (parsedAppId === null) {
            router.replace(buildDashboardRoute("my-applications"));
            return;
        }

        if (rawAppId !== String(parsedAppId)) {
            router.replace(buildApplicationDetailsRoute(parsedAppId));
            return;
        }

        if (!selectedApp) {
            router.replace(buildDashboardRoute("my-applications"));
        }
    }, [parsedAppId, rawAppId, router, selectedApp]);

    if (!selectedApp) {
        return null;
    }

    return <MyApplicationDetails app={selectedApp} />;
}
