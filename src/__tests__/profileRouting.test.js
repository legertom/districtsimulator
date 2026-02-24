import { describe, it, expect } from "vitest";
import {
    parseProfileId,
    buildStudentProfileRoute,
    buildTeacherProfileRoute,
    buildStaffProfileRoute,
    buildProfileRouteByType,
} from "@/lib/routing";

describe("parseProfileId", () => {
    it("returns valid UUID unchanged", () => {
        expect(parseProfileId("10a98369-7f2b-466b-abf2-1b9411e35351")).toBe(
            "10a98369-7f2b-466b-abf2-1b9411e35351"
        );
    });

    it("returns null for empty string", () => {
        expect(parseProfileId("")).toBeNull();
    });

    it("returns null for non-UUID string", () => {
        expect(parseProfileId("not-a-uuid")).toBeNull();
    });

    it("returns null for partial UUID", () => {
        expect(parseProfileId("10a98369-7f2b")).toBeNull();
    });

    it("trims whitespace", () => {
        expect(parseProfileId("  10a98369-7f2b-466b-abf2-1b9411e35351  ")).toBe(
            "10a98369-7f2b-466b-abf2-1b9411e35351"
        );
    });
});

describe("buildStudentProfileRoute", () => {
    it("returns correct route for valid UUID", () => {
        expect(buildStudentProfileRoute("10a98369-7f2b-466b-abf2-1b9411e35351")).toBe(
            "/dashboard/student-profile/10a98369-7f2b-466b-abf2-1b9411e35351"
        );
    });

    it("falls back to data-browser for invalid UUID", () => {
        expect(buildStudentProfileRoute("invalid")).toBe("/dashboard/data-browser");
    });
});

describe("buildTeacherProfileRoute", () => {
    it("returns correct route for valid UUID", () => {
        expect(buildTeacherProfileRoute("d46d528e-b919-4f28-bebb-b54ccde88cab")).toBe(
            "/dashboard/teacher-profile/d46d528e-b919-4f28-bebb-b54ccde88cab"
        );
    });

    it("falls back to data-browser for invalid UUID", () => {
        expect(buildTeacherProfileRoute("")).toBe("/dashboard/data-browser");
    });
});

describe("buildStaffProfileRoute", () => {
    it("returns correct route for valid UUID", () => {
        expect(buildStaffProfileRoute("7c3d8e3e-b96f-477c-844c-2da83cc763ca")).toBe(
            "/dashboard/staff-profile/7c3d8e3e-b96f-477c-844c-2da83cc763ca"
        );
    });
});

describe("buildProfileRouteByType", () => {
    const uuid = "10a98369-7f2b-466b-abf2-1b9411e35351";

    it("routes Student to student-profile", () => {
        expect(buildProfileRouteByType("Student", uuid)).toBe(
            `/dashboard/student-profile/${uuid}`
        );
    });

    it("routes Teacher to teacher-profile", () => {
        expect(buildProfileRouteByType("Teacher", uuid)).toBe(
            `/dashboard/teacher-profile/${uuid}`
        );
    });

    it("routes Staff to staff-profile", () => {
        expect(buildProfileRouteByType("Staff", uuid)).toBe(
            `/dashboard/staff-profile/${uuid}`
        );
    });

    it("falls back to data-browser for unknown type", () => {
        expect(buildProfileRouteByType("Unknown", uuid)).toBe("/dashboard/data-browser");
    });

    it("is case-insensitive", () => {
        expect(buildProfileRouteByType("student", uuid)).toBe(
            `/dashboard/student-profile/${uuid}`
        );
    });
});
