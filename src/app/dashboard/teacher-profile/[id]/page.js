"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import TeacherProfile from "@/components/pages/TeacherProfile";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildDashboardRoute,
    buildTeacherProfileRoute,
    getRouteParamValue,
    parseProfileId,
} from "@/lib/routing";

export default function TeacherProfileRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const teachers = scenario.dataBrowser?.teachers;

    const rawId = getRouteParamValue(params?.id);
    const hasRouteParam = rawId.trim().length > 0;
    const parsedId = useMemo(() => parseProfileId(rawId), [rawId]);
    const hasData = Array.isArray(teachers);

    const selectedTeacher = useMemo(() => {
        if (parsedId === null) return null;
        const list = Array.isArray(teachers) ? teachers : [];
        return list.find((t) => t.id === parsedId) ?? null;
    }, [teachers, parsedId]);

    useEffect(() => {
        if (!hasRouteParam) return;
        if (parsedId === null) {
            router.replace(buildDashboardRoute("data-browser"));
            return;
        }
        if (rawId !== parsedId) {
            router.replace(buildTeacherProfileRoute(parsedId));
            return;
        }
        if (hasData && !selectedTeacher) {
            router.replace(buildDashboardRoute("data-browser"));
        }
    }, [hasData, hasRouteParam, parsedId, rawId, router, selectedTeacher]);

    if (!hasRouteParam || !selectedTeacher) return null;

    return <TeacherProfile teacher={selectedTeacher} />;
}
