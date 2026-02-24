"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentProfile from "@/components/pages/StudentProfile";
import { useScenario } from "@/context/ScenarioContext";
import {
    buildDashboardRoute,
    buildStudentProfileRoute,
    getRouteParamValue,
    parseProfileId,
} from "@/lib/routing";

export default function StudentProfileRoute() {
    const params = useParams();
    const router = useRouter();
    const { scenario } = useScenario();
    const students = scenario.dataBrowser?.students;

    const rawId = getRouteParamValue(params?.id);
    const hasRouteParam = rawId.trim().length > 0;
    const parsedId = useMemo(() => parseProfileId(rawId), [rawId]);
    const hasData = Array.isArray(students);

    const selectedStudent = useMemo(() => {
        if (parsedId === null) return null;
        const list = Array.isArray(students) ? students : [];
        return list.find((s) => s.id === parsedId) ?? null;
    }, [students, parsedId]);

    useEffect(() => {
        if (!hasRouteParam) return;
        if (parsedId === null) {
            router.replace(buildDashboardRoute("data-browser"));
            return;
        }
        if (rawId !== parsedId) {
            router.replace(buildStudentProfileRoute(parsedId));
            return;
        }
        if (hasData && !selectedStudent) {
            router.replace(buildDashboardRoute("data-browser"));
        }
    }, [hasData, hasRouteParam, parsedId, rawId, router, selectedStudent]);

    if (!hasRouteParam || !selectedStudent) return null;

    return <StudentProfile student={selectedStudent} />;
}
