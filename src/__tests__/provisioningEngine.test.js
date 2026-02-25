import { describe, it, expect } from "vitest";
import {
    applyEmailTemplate,
    applyOUTemplate,
    generateCleverId,
    generateProvisioningResults,
    generateSyncHistory,
} from "@/lib/provisioningEngine";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SCHOOLS_DATA } from "@/data/defaults/dataBrowser";
import { DEFAULT_PROVISIONING_STATE } from "@/data/defaults/idm-provisioning";

const student0 = STUDENTS_DATA[0]; // Annamarie Feest
const teacher0 = TEACHERS_DATA[0];
const staff0 = STAFF_DATA[0];

const dataBrowserData = {
    students: STUDENTS_DATA,
    teachers: TEACHERS_DATA,
    staff: STAFF_DATA,
    schools: SCHOOLS_DATA,
};

// ═══════════════════════════════════════════════════════════════
//  applyEmailTemplate
// ═══════════════════════════════════════════════════════════════

describe("applyEmailTemplate", () => {
    it("produces default format (first+last@domain) when no segments", () => {
        const email = applyEmailTemplate([], "cedarridgesd.org", student0, "Student", SCHOOLS_DATA);
        expect(email).toBe("annamariefeest@cedarridgesd.org");
    });

    it("applies variable segments for first+last", () => {
        const format = [
            { type: "variable", variable: "name.first" },
            { type: "variable", variable: "name.last" },
        ];
        const email = applyEmailTemplate(format, "cedarridgesd.org", student0, "Student", SCHOOLS_DATA);
        expect(email).toBe("annamariefeest@cedarridgesd.org");
    });

    it("applies dot separator between name parts", () => {
        const format = [
            { type: "variable", variable: "name.first" },
            { type: "text", value: "." },
            { type: "variable", variable: "name.last" },
        ];
        const email = applyEmailTemplate(format, "cedarridgesd.org", student0, "Student", SCHOOLS_DATA);
        expect(email).toBe("annamarie.feest@cedarridgesd.org");
    });

    it("resolves student_number variable", () => {
        const format = [
            { type: "variable", variable: "name.first" },
            { type: "variable", variable: "student.student_number" },
        ];
        const email = applyEmailTemplate(format, "cedarridgesd.org", student0, "Student", SCHOOLS_DATA);
        expect(email).toBe("annamarie000001@cedarridgesd.org");
    });

    it("resolves teacher_number variable", () => {
        const format = [
            { type: "variable", variable: "name.first" },
            { type: "variable", variable: "teacher.teacher_number" },
        ];
        const email = applyEmailTemplate(format, "cedarridgesd.org", teacher0, "Teacher", SCHOOLS_DATA);
        expect(email).toContain(teacher0.first.toLowerCase());
    });

    it("falls back to firstlast@domain with null segments", () => {
        const email = applyEmailTemplate(null, "cedarridgesd.org", student0, "Student", SCHOOLS_DATA);
        expect(email).toBe("annamariefeest@cedarridgesd.org");
    });

    it("omits domain when domain is empty", () => {
        const format = [
            { type: "variable", variable: "name.first" },
        ];
        const email = applyEmailTemplate(format, "", student0, "Student", SCHOOLS_DATA);
        expect(email).toBe("annamarie");
    });
});

// ═══════════════════════════════════════════════════════════════
//  applyOUTemplate
// ═══════════════════════════════════════════════════════════════

describe("applyOUTemplate", () => {
    it("resolves student OU with school_name and grade", () => {
        const ouConfig = {
            path: "/Students",
            subOUFormat: [
                { type: "text", value: "/" },
                { type: "variable", variable: "school_name" },
                { type: "text", value: "/" },
                { type: "variable", variable: "student.grade" },
            ],
        };
        const ou = applyOUTemplate(ouConfig, student0, "Student", SCHOOLS_DATA);
        expect(ou).toContain("/Students/");
        expect(ou).toContain(student0.grade);
    });

    it("returns static path when no subOUFormat", () => {
        const ouConfig = { path: "/Users/Staff/Teachers", subOUFormat: [] };
        const ou = applyOUTemplate(ouConfig, teacher0, "Teacher", SCHOOLS_DATA);
        expect(ou).toBe("/Users/Staff/Teachers");
    });

    it("resolves staff department variable", () => {
        const ouConfig = {
            path: "/Users/Staff",
            subOUFormat: [
                { type: "text", value: "/" },
                { type: "variable", variable: "staff.department" },
            ],
        };
        const ou = applyOUTemplate(ouConfig, staff0, "Staff", SCHOOLS_DATA);
        expect(ou).toContain("/Users/Staff/");
    });

    it("returns '/' when config is null", () => {
        const ou = applyOUTemplate(null, student0, "Student", SCHOOLS_DATA);
        expect(ou).toBe("/");
    });
});

// ═══════════════════════════════════════════════════════════════
//  generateCleverId
// ═══════════════════════════════════════════════════════════════

describe("generateCleverId", () => {
    it("produces a 24-character hex string matching reference data format", () => {
        const id = generateCleverId("test-id");
        expect(id).toHaveLength(24);
        expect(id).toMatch(/^[0-9a-f]+$/);
    });

    it("is deterministic — same input produces same output", () => {
        const id1 = generateCleverId("test-id");
        const id2 = generateCleverId("test-id");
        expect(id1).toBe(id2);
    });
});

// ═══════════════════════════════════════════════════════════════
//  generateProvisioningResults
// ═══════════════════════════════════════════════════════════════

describe("generateProvisioningResults", () => {
    it("generates 40 events when all user types enabled (20+10+10)", () => {
        const { events } = generateProvisioningResults(DEFAULT_PROVISIONING_STATE, dataBrowserData);
        expect(events).toHaveLength(40);
    });

    it("generates 20 events when only students enabled", () => {
        const config = {
            ...DEFAULT_PROVISIONING_STATE,
            provisionTeachers: false,
            provisionStaff: false,
        };
        const { events } = generateProvisioningResults(config, dataBrowserData);
        expect(events).toHaveLength(20);
    });

    it("every event has all required fields", () => {
        const { events } = generateProvisioningResults(DEFAULT_PROVISIONING_STATE, dataBrowserData);
        for (const ev of events) {
            expect(ev).toHaveProperty("date");
            expect(ev).toHaveProperty("event", "Created");
            expect(ev).toHaveProperty("destination", "Google Workspace");
            expect(ev).toHaveProperty("user");
            expect(ev).toHaveProperty("sisId");
            expect(ev).toHaveProperty("destinationUsername");
            expect(ev).toHaveProperty("userType");
            expect(ev).toHaveProperty("cleverId");
            expect(ev).toHaveProperty("currentOU");
            expect(ev).toHaveProperty("personId");
            expect(ev).toHaveProperty("modifiedFields");
            expect(ev).toHaveProperty("allModifiedData");
        }
    });

    it("personId equals sisId for every event", () => {
        const { events } = generateProvisioningResults(DEFAULT_PROVISIONING_STATE, dataBrowserData);
        for (const ev of events) {
            expect(ev.personId).toBe(ev.sisId);
        }
    });

    it("syncSummary.creates equals events.length", () => {
        const { events, syncSummary } = generateProvisioningResults(DEFAULT_PROVISIONING_STATE, dataBrowserData);
        expect(syncSummary.creates).toBe(events.length);
    });
});

// ═══════════════════════════════════════════════════════════════
//  generateSyncHistory
// ═══════════════════════════════════════════════════════════════

describe("generateSyncHistory", () => {
    const summary = { creates: 40, matches: 0, updates: 0, archives: 0, issues: 0 };

    it("generates 14 rows (1 current + 13 historical)", () => {
        const rows = generateSyncHistory(summary, 40);
        expect(rows).toHaveLength(14);
    });

    it("row 0 has the creates count from the sync summary", () => {
        const rows = generateSyncHistory(summary, 40);
        expect(rows[0].creates).toBe(40);
    });

    it("rows 1-13 have matches only (no creates)", () => {
        const rows = generateSyncHistory(summary, 40);
        for (let i = 1; i < rows.length; i++) {
            expect(rows[i].creates).toBe(0);
            expect(rows[i].matches).toBe(40);
        }
    });
});
