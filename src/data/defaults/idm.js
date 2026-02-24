/**
 * Deterministic mock data for the IDM page.
 * Sync history, events, and available destinations.
 *
 * Event names are pulled from dataBrowser.js to ensure "Open Profile" links
 * always resolve. See idm-data-consistency.test.js for the guard test.
 */

import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA } from './dataBrowser';

export const destinations = [
    "Microsoft Active Directory",
    "Microsoft Entra ID",
];

/** Destinations available before any provider is configured (includes Google). */
export const UNCONFIGURED_DESTINATIONS = [
    "Google Workspace",
    "Microsoft Active Directory",
    "Microsoft Entra ID",
];

export const syncHistory = [
    { destination: "Google", dateTime: "Feb 16, 2026; 04:45:53 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 15, 2026; 04:45:51 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 14, 2026; 04:45:49 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 13, 2026; 04:45:47 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 12, 2026; 04:45:45 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 11, 2026; 04:45:43 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 10, 2026; 04:45:41 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 9, 2026; 04:45:39 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 8, 2026; 04:45:37 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 7, 2026; 04:45:35 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 6, 2026; 04:45:33 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 5, 2026; 04:45:31 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 4, 2026; 04:45:29 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
    { destination: "Google", dateTime: "Feb 3, 2026; 04:45:27 a.m.", creates: 0, matches: 40, updates: 0, archives: 0, issues: 1 },
];

/** Helper to build a consistent event entry from a Data Browser person record. */
function buildEvent({ person, date, completionTimestamp, cleverId, userType, currentOU, managedGroups, configTemplate, templateName }) {
    const first = person.first;
    const last = person.last;
    const firstLower = first.toLowerCase();
    const lastLower = last.toLowerCase();
    const domainUsername = `${firstLower}.${lastLower}`;
    const email = `${domainUsername}@cedarridgesd.org`;

    return {
        date,
        event: "Created",
        destination: "Google Workspace",
        user: `${first} ${last}`,
        sisId: person.id,
        destinationUsername: email,
        userType,
        cleverId,
        currentOU,
        previousOU: "N/A",
        currentManagedGroups: managedGroups,
        previousManagedGroups: "N/A",
        modifiedFields: [
            { field: "Given name", value: first },
            { field: "Family name", value: last },
            { field: "Domain username", value: domainUsername },
        ],
        allModifiedData: [
            { field: "Clever Id", value: cleverId },
            { field: "Completion Timestamp", value: completionTimestamp },
            { field: "Config String", value: configTemplate },
            { field: "Family Name", value: last },
            { field: "Given Name", value: first },
            { field: "Org Unit", value: currentOU },
            { field: "Password", value: "redacted" },
            { field: "Primary Email", value: email },
            { field: "Sis Id", value: person.id },
            { field: "User Type", value: userType.toLowerCase() },
        ],
        additionalFields: [{ field: "Templates Used", value: templateName }],
    };
}

// Config string templates
const STAFF_CONFIG = "email=SIS;password=[redacted];orgunit=/Users/Staff/{{staff.department}};givenname={{name.first}};familyname={{name.last}};changepasswordonlogin=true;";
const TEACHER_CONFIG = "email=SIS;password=[redacted];orgunit=/Users/Teachers/{{teacher.department}};givenname={{name.first}};familyname={{name.last}};changepasswordonlogin=true;";
const STUDENT_CONFIG = "email=SIS;password=[redacted];orgunit=/Users/Students/Grade {{student.grade}};givenname={{name.first}};familyname={{name.last}};changepasswordonlogin=true;";

/**
 * Each event entry includes summary columns and expanded detail fields.
 * modifiedFields — shown inline in the expanded row (first 3).
 * allModifiedData — full list for the "Modified data" modal.
 *
 * Distribution:
 *   Staff events  (indices 0, 7, 18): STAFF_DATA[0..2]
 *   Teacher events (indices 1, 5, 10, 14): TEACHERS_DATA[0..3]
 *   Student events (indices 2, 3, 4, 6, 8, 9, 11, 12, 13, 15, 16, 17): STUDENTS_DATA[0..11]
 */
export const events = [
    // ── index 0: Staff — STAFF_DATA[0] (Percival Beier) ──
    buildEvent({
        person: STAFF_DATA[0],
        date: "Feb 16, 2026; 04:45:53 a.m.",
        completionTimestamp: "2025-12-19T09:45:53.000Z",
        cleverId: "6917a1f42728326e1ee245f8",
        userType: "Staff",
        currentOU: "/Users/Staff/District Office",
        managedGroups: "N/A",
        configTemplate: STAFF_CONFIG,
        templateName: "Staff Default Template",
    }),

    // ── index 1: Teacher — TEACHERS_DATA[0] (Sierra Hirthe) ──
    buildEvent({
        person: TEACHERS_DATA[0],
        date: "Feb 16, 2026; 04:45:53 a.m.",
        completionTimestamp: "2025-12-19T09:45:53.000Z",
        cleverId: "5f23b8c91a4d7e0012ab34cd",
        userType: "Teacher",
        currentOU: "/Users/Teachers/Science",
        managedGroups: "Science Department",
        configTemplate: TEACHER_CONFIG,
        templateName: "Teacher Default Template",
    }),

    // ── index 2: Student — STUDENTS_DATA[0] (Annamarie Feest) ──
    buildEvent({
        person: STUDENTS_DATA[0],
        date: "Feb 15, 2026; 04:45:51 a.m.",
        completionTimestamp: "2025-12-18T09:45:51.000Z",
        cleverId: "7a82d4f13b5c6e9012345678",
        userType: "Student",
        currentOU: "/Users/Students/Grade 10",
        managedGroups: "Grade 10 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 3: Student — STUDENTS_DATA[1] (Remington Stoltenberg) ──
    buildEvent({
        person: STUDENTS_DATA[1],
        date: "Feb 15, 2026; 04:45:51 a.m.",
        completionTimestamp: "2025-12-18T09:45:51.000Z",
        cleverId: "8b93e5024c6d7f1023456789",
        userType: "Student",
        currentOU: "/Users/Students/Grade 8",
        managedGroups: "Grade 8 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 4: Student — STUDENTS_DATA[2] (Ephraim Kreiger) ──
    buildEvent({
        person: STUDENTS_DATA[2],
        date: "Feb 14, 2026; 04:45:49 a.m.",
        completionTimestamp: "2025-12-17T09:45:49.000Z",
        cleverId: "9c04f6135d7e801234567890",
        userType: "Student",
        currentOU: "/Users/Students/Grade 11",
        managedGroups: "Grade 11 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 5: Teacher — TEACHERS_DATA[1] (Betty Bauch) ──
    buildEvent({
        person: TEACHERS_DATA[1],
        date: "Feb 14, 2026; 04:45:49 a.m.",
        completionTimestamp: "2025-12-17T09:45:49.000Z",
        cleverId: "0d15a7246e8f912345678901",
        userType: "Teacher",
        currentOU: "/Users/Teachers/Math",
        managedGroups: "Math Department",
        configTemplate: TEACHER_CONFIG,
        templateName: "Teacher Default Template",
    }),

    // ── index 6: Student — STUDENTS_DATA[3] (Clint O'Connell) ──
    buildEvent({
        person: STUDENTS_DATA[3],
        date: "Feb 13, 2026; 04:45:47 a.m.",
        completionTimestamp: "2025-12-16T09:45:47.000Z",
        cleverId: "1e26b8357f90a23456789012",
        userType: "Student",
        currentOU: "/Users/Students/Grade 9",
        managedGroups: "Grade 9 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 7: Staff — STAFF_DATA[1] (Leland Greenholt) ──
    buildEvent({
        person: STAFF_DATA[1],
        date: "Feb 13, 2026; 04:45:47 a.m.",
        completionTimestamp: "2025-12-16T09:45:47.000Z",
        cleverId: "2f37c9468a01b34567890123",
        userType: "Staff",
        currentOU: "/Users/Staff/Front Office",
        managedGroups: "N/A",
        configTemplate: STAFF_CONFIG,
        templateName: "Staff Default Template",
    }),

    // ── index 8: Student — STUDENTS_DATA[4] (Aniya Macejkovic) ──
    buildEvent({
        person: STUDENTS_DATA[4],
        date: "Feb 12, 2026; 04:45:45 a.m.",
        completionTimestamp: "2025-12-15T09:45:45.000Z",
        cleverId: "3048da579b12c45678901234",
        userType: "Student",
        currentOU: "/Users/Students/Grade 7",
        managedGroups: "Grade 7 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 9: Student — STUDENTS_DATA[5] (Orie Kuhlman) ──
    buildEvent({
        person: STUDENTS_DATA[5],
        date: "Feb 12, 2026; 04:45:45 a.m.",
        completionTimestamp: "2025-12-15T09:45:45.000Z",
        cleverId: "4159eb680c23d56789012345",
        userType: "Student",
        currentOU: "/Users/Students/Grade 12",
        managedGroups: "Grade 12 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 10: Teacher — TEACHERS_DATA[2] (Earnest Rolfson) ──
    buildEvent({
        person: TEACHERS_DATA[2],
        date: "Feb 11, 2026; 04:45:43 a.m.",
        completionTimestamp: "2025-12-14T09:45:43.000Z",
        cleverId: "5260fc791d34e67890123456",
        userType: "Teacher",
        currentOU: "/Users/Teachers/English",
        managedGroups: "English Department",
        configTemplate: TEACHER_CONFIG,
        templateName: "Teacher Default Template",
    }),

    // ── index 11: Student — STUDENTS_DATA[6] (Madisyn Hoeger) ──
    buildEvent({
        person: STUDENTS_DATA[6],
        date: "Feb 11, 2026; 04:45:43 a.m.",
        completionTimestamp: "2025-12-14T09:45:43.000Z",
        cleverId: "6371ad802e45f78901234567",
        userType: "Student",
        currentOU: "/Users/Students/Grade 10",
        managedGroups: "Grade 10 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 12: Student — STUDENTS_DATA[7] (Brando Hane) ──
    buildEvent({
        person: STUDENTS_DATA[7],
        date: "Feb 10, 2026; 04:45:41 a.m.",
        completionTimestamp: "2025-12-13T09:45:41.000Z",
        cleverId: "7482be913f56078012345678",
        userType: "Student",
        currentOU: "/Users/Students/Grade 8",
        managedGroups: "Grade 8 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 13: Student — STUDENTS_DATA[8] (Lavon Botsford) ──
    buildEvent({
        person: STUDENTS_DATA[8],
        date: "Feb 10, 2026; 04:45:41 a.m.",
        completionTimestamp: "2025-12-13T09:45:41.000Z",
        cleverId: "8593cfa24067189123456789",
        userType: "Student",
        currentOU: "/Users/Students/Grade 11",
        managedGroups: "Grade 11 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 14: Teacher — TEACHERS_DATA[3] (Armani Yost) ──
    buildEvent({
        person: TEACHERS_DATA[3],
        date: "Feb 9, 2026; 04:45:39 a.m.",
        completionTimestamp: "2025-12-12T09:45:39.000Z",
        cleverId: "96a4d0b35178290234567890",
        userType: "Teacher",
        currentOU: "/Users/Teachers/History",
        managedGroups: "History Department",
        configTemplate: TEACHER_CONFIG,
        templateName: "Teacher Default Template",
    }),

    // ── index 15: Student — STUDENTS_DATA[9] (Verda Abbott) ──
    buildEvent({
        person: STUDENTS_DATA[9],
        date: "Feb 9, 2026; 04:45:39 a.m.",
        completionTimestamp: "2025-12-12T09:45:39.000Z",
        cleverId: "a7b5e1c46289301345678901",
        userType: "Student",
        currentOU: "/Users/Students/Grade 9",
        managedGroups: "Grade 9 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 16: Student — STUDENTS_DATA[10] (Yadira Pfeffer) ──
    buildEvent({
        person: STUDENTS_DATA[10],
        date: "Feb 8, 2026; 04:45:37 a.m.",
        completionTimestamp: "2025-12-11T09:45:37.000Z",
        cleverId: "b8c6f2d5739a412456789012",
        userType: "Student",
        currentOU: "/Users/Students/Grade 7",
        managedGroups: "Grade 7 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 17: Student — STUDENTS_DATA[11] (Willa Stracke) ──
    buildEvent({
        person: STUDENTS_DATA[11],
        date: "Feb 8, 2026; 04:45:37 a.m.",
        completionTimestamp: "2025-12-11T09:45:37.000Z",
        cleverId: "c9d703e6840b523567890123",
        userType: "Student",
        currentOU: "/Users/Students/Grade 12",
        managedGroups: "Grade 12 All Students",
        configTemplate: STUDENT_CONFIG,
        templateName: "Student Default Template",
    }),

    // ── index 18: Staff — STAFF_DATA[2] (Fanny Stracke) ──
    buildEvent({
        person: STAFF_DATA[2],
        date: "Feb 7, 2026; 04:45:35 a.m.",
        completionTimestamp: "2025-12-10T09:45:35.000Z",
        cleverId: "dae814f7951c634678901234",
        userType: "Staff",
        currentOU: "/Users/Staff/Counseling",
        managedGroups: "N/A",
        configTemplate: STAFF_CONFIG,
        templateName: "Staff Default Template",
    }),
];
