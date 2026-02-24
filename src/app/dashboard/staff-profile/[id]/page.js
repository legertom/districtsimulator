"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import StaffProfile from "@/components/pages/StaffProfile";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildDashboardRoute,
    buildStaffProfileRoute,
    getRouteParamValue,
    parseProfileId,
} from "@/lib/routing";

export default function StaffProfileRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const staff = scenario.dataBrowser?.staff;

    const rawId = getRouteParamValue(params?.id);
    const hasRouteParam = rawId.trim().length > 0;
    const parsedId = useMemo(() => parseProfileId(rawId), [rawId]);
    const hasData = Array.isArray(staff);

    const selectedStaff = useMemo(() => {
        if (parsedId === null) return null;
        const list = Array.isArray(staff) ? staff : [];
        return list.find((s) => s.id === parsedId) ?? null;
    }, [staff, parsedId]);

    useEffect(() => {
        if (!hasRouteParam) return;
        if (parsedId === null) {
            router.replace(buildDashboardRoute("data-browser"));
            return;
        }
        if (rawId !== parsedId) {
            router.replace(buildStaffProfileRoute(parsedId));
            return;
        }
        if (hasData && !selectedStaff) {
            router.replace(buildDashboardRoute("data-browser"));
        }
    }, [hasData, hasRouteParam, parsedId, rawId, router, selectedStaff]);

    if (!hasRouteParam || !selectedStaff) return null;

    return <StaffProfile staff={selectedStaff} />;
}
