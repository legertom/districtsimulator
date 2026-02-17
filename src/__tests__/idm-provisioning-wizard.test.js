/**
 * Unit tests for the Google Provisioning Wizard state machine.
 * Tests step ordering, completion detection, and state transitions
 * without requiring DOM rendering.
 */

import { describe, it, expect } from "vitest";
import {
    WIZARD_STEPS,
    DEFAULT_PROVISIONING_STATE,
    GOOGLE_ORG_UNITS,
    ARCHIVE_ACTIONS,
    SAMPLE_STUDENT,
    SAMPLE_TEACHER,
    SAMPLE_STAFF,
    SIS_VARIABLES,
    FORMAT_FUNCTIONS,
} from "@/data/defaults/idm-provisioning";

/* ── Helper: mirrors the isStepCompleted logic from the wizard ── */
function isStepCompleted(stepId, state) {
    switch (stepId) {
        case "connect":
            return state.googleConnected;
        case "management-level":
            return !!state.managementLevel;
        case "users":
            return state.provisionStudents || state.provisionTeachers || state.provisionStaff;
        case "credentials":
            return Object.values(state.credentials).every((c) => c.completed);
        case "ous":
            return Object.values(state.ous).every((o) => o.completed);
        case "groups":
            return true; // optional step, always considered complete
        case "summary":
            return true;
        case "preview":
            return false; // final step, never "completed"
        default:
            return false;
    }
}

/* ── Tests ───────────────────────────────────────────────────── */

describe("WIZARD_STEPS definition", () => {
    it("has exactly 8 steps", () => {
        expect(WIZARD_STEPS).toHaveLength(8);
    });

    it("steps are numbered 1–8 in order", () => {
        WIZARD_STEPS.forEach((step, i) => {
            expect(step.number).toBe(i + 1);
        });
    });

    it("has unique step IDs", () => {
        const ids = WIZARD_STEPS.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("starts with 'connect' and ends with 'preview'", () => {
        expect(WIZARD_STEPS[0].id).toBe("connect");
        expect(WIZARD_STEPS[WIZARD_STEPS.length - 1].id).toBe("preview");
    });
});

describe("DEFAULT_PROVISIONING_STATE", () => {
    it("has google connected by default", () => {
        expect(DEFAULT_PROVISIONING_STATE.googleConnected).toBe(true);
    });

    it("defaults to full management level", () => {
        expect(DEFAULT_PROVISIONING_STATE.managementLevel).toBe("full");
    });

    it("provisions all user types by default", () => {
        expect(DEFAULT_PROVISIONING_STATE.provisionStudents).toBe(true);
        expect(DEFAULT_PROVISIONING_STATE.provisionTeachers).toBe(true);
        expect(DEFAULT_PROVISIONING_STATE.provisionStaff).toBe(true);
    });

    it("has credentials for all three user types", () => {
        expect(DEFAULT_PROVISIONING_STATE.credentials).toHaveProperty("students");
        expect(DEFAULT_PROVISIONING_STATE.credentials).toHaveProperty("teachers");
        expect(DEFAULT_PROVISIONING_STATE.credentials).toHaveProperty("staff");
    });

    it("has OUs for all required categories", () => {
        expect(DEFAULT_PROVISIONING_STATE.ous).toHaveProperty("students");
        expect(DEFAULT_PROVISIONING_STATE.ous).toHaveProperty("teachers");
        expect(DEFAULT_PROVISIONING_STATE.ous).toHaveProperty("staff");
        expect(DEFAULT_PROVISIONING_STATE.ous).toHaveProperty("archive");
        expect(DEFAULT_PROVISIONING_STATE.ous).toHaveProperty("ignored");
    });

    it("has preview data with detail rows", () => {
        expect(DEFAULT_PROVISIONING_STATE.preview.details.length).toBeGreaterThan(0);
    });
});

describe("Step completion detection", () => {
    it("all setup steps (1–7) are completed with default state", () => {
        const setupSteps = WIZARD_STEPS.filter((s) => s.id !== "preview");
        setupSteps.forEach((step) => {
            expect(isStepCompleted(step.id, DEFAULT_PROVISIONING_STATE)).toBe(true);
        });
    });

    it("preview step is never marked completed", () => {
        expect(isStepCompleted("preview", DEFAULT_PROVISIONING_STATE)).toBe(false);
    });

    it("connect step becomes incomplete when google is disconnected", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE, googleConnected: false };
        expect(isStepCompleted("connect", state)).toBe(false);
    });

    it("users step becomes incomplete when no user types are selected", () => {
        const state = {
            ...DEFAULT_PROVISIONING_STATE,
            provisionStudents: false,
            provisionTeachers: false,
            provisionStaff: false,
        };
        expect(isStepCompleted("users", state)).toBe(false);
    });

    it("users step remains complete if any single user type is selected", () => {
        const state = {
            ...DEFAULT_PROVISIONING_STATE,
            provisionStudents: true,
            provisionTeachers: false,
            provisionStaff: false,
        };
        expect(isStepCompleted("users", state)).toBe(true);
    });

    it("credentials step becomes incomplete if any credential is not completed", () => {
        const state = {
            ...DEFAULT_PROVISIONING_STATE,
            credentials: {
                ...DEFAULT_PROVISIONING_STATE.credentials,
                students: { ...DEFAULT_PROVISIONING_STATE.credentials.students, completed: false },
            },
        };
        expect(isStepCompleted("credentials", state)).toBe(false);
    });

    it("OUs step becomes incomplete if any OU is not completed", () => {
        const state = {
            ...DEFAULT_PROVISIONING_STATE,
            ous: {
                ...DEFAULT_PROVISIONING_STATE.ous,
                archive: { ...DEFAULT_PROVISIONING_STATE.ous.archive, completed: false },
            },
        };
        expect(isStepCompleted("ous", state)).toBe(false);
    });
});

describe("State mutation patterns", () => {
    it("can switch management level", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE };
        const updated = { ...state, managementLevel: "password-only" };
        expect(updated.managementLevel).toBe("password-only");
        expect(isStepCompleted("management-level", updated)).toBe(true);
    });

    it("can toggle user types independently", () => {
        let state = { ...DEFAULT_PROVISIONING_STATE };
        state = { ...state, provisionStudents: false };
        expect(state.provisionStudents).toBe(false);
        expect(state.provisionTeachers).toBe(true);
        expect(isStepCompleted("users", state)).toBe(true);
    });

    it("can disconnect and reconnect google", () => {
        let state = { ...DEFAULT_PROVISIONING_STATE };
        state = { ...state, googleConnected: false };
        expect(isStepCompleted("connect", state)).toBe(false);
        state = { ...state, googleConnected: true };
        expect(isStepCompleted("connect", state)).toBe(true);
    });
});

describe("Step navigation", () => {
    it("can navigate forward through all steps", () => {
        for (let i = 0; i < WIZARD_STEPS.length - 1; i++) {
            const current = WIZARD_STEPS[i];
            const next = WIZARD_STEPS[i + 1];
            expect(next.number).toBe(current.number + 1);
        }
    });

    it("step IDs map to correct route segments", () => {
        // Verify the step IDs match the URL segments seen in live Clever
        const expectedIds = [
            "connect",
            "management-level",
            "users",
            "credentials",
            "ous",
            "groups",
            "summary",
            "preview",
        ];
        expect(WIZARD_STEPS.map((s) => s.id)).toEqual(expectedIds);
    });
});

/* ── Google Org Unit Tree Data ──────────────────── */

describe("GOOGLE_ORG_UNITS tree", () => {
    it("has a single root node", () => {
        expect(GOOGLE_ORG_UNITS).toHaveLength(1);
        expect(GOOGLE_ORG_UNITS[0].id).toBe("root");
    });

    it("root has expected top-level children", () => {
        const childNames = GOOGLE_ORG_UNITS[0].children.map((c) => c.name);
        expect(childNames).toContain("Devices");
        expect(childNames).toContain("Students");
        expect(childNames).toContain("Users");
    });

    it("all nodes have id, name, path, and children fields", () => {
        function checkNode(node) {
            expect(node).toHaveProperty("id");
            expect(node).toHaveProperty("name");
            expect(node).toHaveProperty("path");
            expect(node).toHaveProperty("children");
            expect(Array.isArray(node.children)).toBe(true);
            node.children.forEach(checkNode);
        }
        GOOGLE_ORG_UNITS.forEach(checkNode);
    });

    it("node IDs are unique across the tree", () => {
        const ids = [];
        function collectIds(nodes) {
            for (const n of nodes) {
                ids.push(n.id);
                collectIds(n.children);
            }
        }
        collectIds(GOOGLE_ORG_UNITS);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("Students subtree matches live Clever structure", () => {
        const studentsNode = GOOGLE_ORG_UNITS[0].children.find((c) => c.id === "students");
        expect(studentsNode).toBeDefined();
        expect(studentsNode.path).toBe("/Students");
        expect(studentsNode.children.length).toBeGreaterThan(0);
    });

    it("Users > Staff > Teachers path exists", () => {
        const users = GOOGLE_ORG_UNITS[0].children.find((c) => c.id === "users");
        expect(users).toBeDefined();
        const staff = users.children.find((c) => c.id === "users-staff");
        expect(staff).toBeDefined();
        const teachers = staff.children.find((c) => c.id === "users-staff-teachers");
        expect(teachers).toBeDefined();
        expect(teachers.path).toBe("/Users/Staff/Teachers");
    });
});

/* ── Archive Actions ────────────────────────────── */

describe("ARCHIVE_ACTIONS", () => {
    it("has exactly 3 options", () => {
        expect(ARCHIVE_ACTIONS).toHaveLength(3);
    });

    it("each action has id and label", () => {
        ARCHIVE_ACTIONS.forEach((action) => {
            expect(action).toHaveProperty("id");
            expect(action).toHaveProperty("label");
        });
    });

    it("includes move-suspend as default option", () => {
        const moveSuspend = ARCHIVE_ACTIONS.find((a) => a.id === "move-suspend");
        expect(moveSuspend).toBeDefined();
    });
});

/* ── Sample Users for OU Preview ────────────────── */

describe("Sample users — OU-relevant fields", () => {
    it("SAMPLE_STUDENT has school and grade for OU preview", () => {
        expect(SAMPLE_STUDENT.school).toBeDefined();
        expect(SAMPLE_STUDENT.school.length).toBeGreaterThan(0);
        expect(SAMPLE_STUDENT.grade).toBeDefined();
        expect(SAMPLE_STUDENT.grade.length).toBeGreaterThan(0);
    });

    it("SAMPLE_TEACHER has school and title for OU preview", () => {
        expect(SAMPLE_TEACHER.school).toBeDefined();
        expect(SAMPLE_TEACHER.title).toBeDefined();
    });

    it("SAMPLE_STAFF has title for OU preview", () => {
        expect(SAMPLE_STAFF.title).toBeDefined();
        expect(SAMPLE_STAFF.title.length).toBeGreaterThan(0);
    });
});

/* ── OU State Mutation Tests ────────────────────── */

describe("OU edit state mutations", () => {
    it("edit Student OU updates path and selectedOU", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE, ous: { ...DEFAULT_PROVISIONING_STATE.ous } };
        const updated = {
            ...state,
            ous: {
                ...state.ous,
                students: { ...state.ous.students, selectedOU: "users", path: "/Users", completed: true },
            },
        };
        expect(updated.ous.students.selectedOU).toBe("users");
        expect(updated.ous.students.path).toBe("/Users");
        expect(updated.ous.students.completed).toBe(true);
        expect(isStepCompleted("ous", updated)).toBe(true);
    });

    it("edit Teacher OU updates path and selectedOU", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE, ous: { ...DEFAULT_PROVISIONING_STATE.ous } };
        const updated = {
            ...state,
            ous: {
                ...state.ous,
                teachers: { ...state.ous.teachers, selectedOU: "devices", path: "/Devices", completed: true },
            },
        };
        expect(updated.ous.teachers.selectedOU).toBe("devices");
        expect(updated.ous.teachers.path).toBe("/Devices");
        expect(isStepCompleted("ous", updated)).toBe(true);
    });

    it("edit Staff OU updates path and selectedOU", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE, ous: { ...DEFAULT_PROVISIONING_STATE.ous } };
        const updated = {
            ...state,
            ous: {
                ...state.ous,
                staff: { ...state.ous.staff, selectedOU: "users-staff-operations", path: "/Users/Staff/Operations", completed: true },
            },
        };
        expect(updated.ous.staff.path).toBe("/Users/Staff/Operations");
        expect(isStepCompleted("ous", updated)).toBe(true);
    });

    it("cancel OU edit leaves state unchanged", () => {
        const original = JSON.parse(JSON.stringify(DEFAULT_PROVISIONING_STATE));
        // Simulate opening edit and cancelling (state never updated)
        expect(original.ous.students.path).toBe(DEFAULT_PROVISIONING_STATE.ous.students.path);
        expect(original.ous.students.selectedOU).toBe(DEFAULT_PROVISIONING_STATE.ous.students.selectedOU);
    });

    it("edit Archive OU updates path, selectedOU, and archiveAction", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE, ous: { ...DEFAULT_PROVISIONING_STATE.ous } };
        const updated = {
            ...state,
            ous: {
                ...state.ous,
                archive: { ...state.ous.archive, selectedOU: "devices", path: "/Devices", archiveAction: "move", completed: true },
            },
        };
        expect(updated.ous.archive.selectedOU).toBe("devices");
        expect(updated.ous.archive.archiveAction).toBe("move");
        expect(isStepCompleted("ous", updated)).toBe(true);
    });

    it("edit Ignored OUs updates ignoredOUs array", () => {
        const state = { ...DEFAULT_PROVISIONING_STATE, ous: { ...DEFAULT_PROVISIONING_STATE.ous } };
        const updated = {
            ...state,
            ous: {
                ...state.ous,
                ignored: { ...state.ous.ignored, ignoredOUs: ["devices", "users"], path: "/Devices, /Users", completed: true },
            },
        };
        expect(updated.ous.ignored.ignoredOUs).toEqual(["devices", "users"]);
        expect(updated.ous.ignored.path).toBe("/Devices, /Users");
        expect(isStepCompleted("ous", updated)).toBe(true);
    });

    it("valid OU edits keep progression enabled", () => {
        const state = {
            ...DEFAULT_PROVISIONING_STATE,
            ous: {
                students: { completed: true, path: "/Students", selectedOU: "students" },
                teachers: { completed: true, path: "/Users/Staff/Teachers", selectedOU: "users-staff-teachers" },
                staff: { completed: true, path: "/Users/Staff", selectedOU: "users-staff" },
                archive: { completed: true, path: "/", selectedOU: "root", archiveAction: "move-suspend" },
                ignored: { completed: true, path: "/", ignoredOUs: [] },
            },
        };
        expect(isStepCompleted("ous", state)).toBe(true);
    });

    it("OU edits propagate to summary display values", () => {
        // Summary reads state.ous[type].path — verify paths are display-ready
        const state = {
            ...DEFAULT_PROVISIONING_STATE,
            ous: {
                ...DEFAULT_PROVISIONING_STATE.ous,
                students: { completed: true, path: "/Users/Staff/Operations", selectedOU: "users-staff-operations" },
            },
        };
        expect(state.ous.students.path).toBe("/Users/Staff/Operations");
        // Summary would show this path directly
    });

    it("default OU state has selectedOU for all user types", () => {
        expect(DEFAULT_PROVISIONING_STATE.ous.students.selectedOU).toBeDefined();
        expect(DEFAULT_PROVISIONING_STATE.ous.teachers.selectedOU).toBeDefined();
        expect(DEFAULT_PROVISIONING_STATE.ous.staff.selectedOU).toBeDefined();
        expect(DEFAULT_PROVISIONING_STATE.ous.archive.selectedOU).toBeDefined();
    });

    it("default archive OU has archiveAction", () => {
        expect(DEFAULT_PROVISIONING_STATE.ous.archive.archiveAction).toBe("move-suspend");
    });

    it("default ignored OUs has ignoredOUs array", () => {
        expect(Array.isArray(DEFAULT_PROVISIONING_STATE.ous.ignored.ignoredOUs)).toBe(true);
    });

    it("default ignored OUs has per-user handling policy", () => {
        expect(DEFAULT_PROVISIONING_STATE.ous.ignored.handling).toEqual({
            students: "auto-suspend",
            teachers: "auto-suspend",
            staff: "auto-suspend",
        });
    });
});

/* ── Sub-OU Format (Section 3) Data ───────────── */

describe("Sub-OU format data model", () => {
    it("students have a pre-built subOUFormat with 4 segments", () => {
        const fmt = DEFAULT_PROVISIONING_STATE.ous.students.subOUFormat;
        expect(fmt).toBeDefined();
        expect(fmt).toHaveLength(4);
    });

    it("student format contains school_name and student.grade variables", () => {
        const fmt = DEFAULT_PROVISIONING_STATE.ous.students.subOUFormat;
        const vars = fmt.filter((s) => s.type === "variable").map((s) => s.variable);
        expect(vars).toContain("school_name");
        expect(vars).toContain("student.grade");
    });

    it("teachers have an empty subOUFormat (Build your format state)", () => {
        const fmt = DEFAULT_PROVISIONING_STATE.ous.teachers.subOUFormat;
        expect(fmt).toBeDefined();
        expect(fmt).toHaveLength(0);
    });

    it("staff have a pre-built subOUFormat with 2 segments", () => {
        const fmt = DEFAULT_PROVISIONING_STATE.ous.staff.subOUFormat;
        expect(fmt).toBeDefined();
        expect(fmt).toHaveLength(2);
        const vars = fmt.filter((s) => s.type === "variable").map((s) => s.variable);
        expect(vars).toContain("staff.department");
    });

    it("all format segments have a valid type", () => {
        const validTypes = ["text", "variable", "function"];
        for (const key of ["students", "staff"]) {
            for (const seg of DEFAULT_PROVISIONING_STATE.ous[key].subOUFormat) {
                expect(validTypes).toContain(seg.type);
            }
        }
    });

    it("text segments have a value property", () => {
        for (const key of ["students", "staff"]) {
            const textSegs = DEFAULT_PROVISIONING_STATE.ous[key].subOUFormat.filter((s) => s.type === "text");
            for (const seg of textSegs) {
                expect(seg).toHaveProperty("value");
                expect(typeof seg.value).toBe("string");
            }
        }
    });

    it("variable segments have variable and label properties", () => {
        for (const key of ["students", "staff"]) {
            const varSegs = DEFAULT_PROVISIONING_STATE.ous[key].subOUFormat.filter((s) => s.type === "variable");
            for (const seg of varSegs) {
                expect(seg).toHaveProperty("variable");
                expect(seg).toHaveProperty("label");
            }
        }
    });

    it("format can be mutated immutably (add segment)", () => {
        const original = DEFAULT_PROVISIONING_STATE.ous.staff.subOUFormat;
        const updated = [...original, { type: "text", value: "/extra" }];
        expect(updated).toHaveLength(original.length + 1);
        expect(original).toHaveLength(2); // unchanged
    });

    it("format can be mutated immutably (remove segment)", () => {
        const original = DEFAULT_PROVISIONING_STATE.ous.students.subOUFormat;
        const updated = original.filter((_, i) => i !== 0);
        expect(updated).toHaveLength(original.length - 1);
        expect(original).toHaveLength(4); // unchanged
    });
});

/* ── SIS Variables ───────────────────────────── */

describe("SIS_VARIABLES", () => {
    it("has entries for students, teachers, and staff", () => {
        expect(SIS_VARIABLES).toHaveProperty("students");
        expect(SIS_VARIABLES).toHaveProperty("teachers");
        expect(SIS_VARIABLES).toHaveProperty("staff");
    });

    it("each entry has variable and label", () => {
        for (const key of Object.keys(SIS_VARIABLES)) {
            for (const v of SIS_VARIABLES[key]) {
                expect(v).toHaveProperty("variable");
                expect(v).toHaveProperty("label");
                expect(typeof v.variable).toBe("string");
                expect(typeof v.label).toBe("string");
            }
        }
    });

    it("students have at least 5 SIS variables", () => {
        expect(SIS_VARIABLES.students.length).toBeGreaterThanOrEqual(5);
    });

    it("all user types include school_name variable", () => {
        for (const key of Object.keys(SIS_VARIABLES)) {
            const vars = SIS_VARIABLES[key].map((v) => v.variable);
            expect(vars).toContain("school_name");
        }
    });
});

/* ── FORMAT_FUNCTIONS ────────────────────────── */

describe("FORMAT_FUNCTIONS", () => {
    it("has exactly 15 functions", () => {
        expect(FORMAT_FUNCTIONS).toHaveLength(15);
    });

    it("all entries are non-empty strings", () => {
        for (const fn of FORMAT_FUNCTIONS) {
            expect(typeof fn).toBe("string");
            expect(fn.length).toBeGreaterThan(0);
        }
    });

    it("includes expected key functions", () => {
        expect(FORMAT_FUNCTIONS).toContain("Concatenate");
        expect(FORMAT_FUNCTIONS).toContain("To Lowercase");
        expect(FORMAT_FUNCTIONS).toContain("To Uppercase");
        expect(FORMAT_FUNCTIONS).toContain("Substring");
        expect(FORMAT_FUNCTIONS).toContain("Capitalize after Delimiter");
    });
});

/* ── SAMPLE_STAFF department ─────────────────── */

describe("SAMPLE_STAFF department field", () => {
    it("has department property", () => {
        expect(SAMPLE_STAFF).toHaveProperty("department");
    });

    it("department is a non-empty string", () => {
        expect(typeof SAMPLE_STAFF.department).toBe("string");
        expect(SAMPLE_STAFF.department.length).toBeGreaterThan(0);
    });
});
