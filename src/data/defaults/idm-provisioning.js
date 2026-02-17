/**
 * Deterministic mock data for the Google Provisioning Setup wizard.
 * Models the 8-step wizard flow matching live Clever IDM.
 */

export const WIZARD_STEPS = [
    { id: "connect", label: "Connect to Google", number: 1 },
    { id: "management-level", label: "Select your IDM Management Level", number: 2 },
    { id: "users", label: "Select users", number: 3 },
    { id: "credentials", label: "Set login credentials", number: 4 },
    { id: "ous", label: "Organize OUs", number: 5 },
    { id: "groups", label: "Configure groups", number: 6 },
    { id: "summary", label: "Summary", number: 7 },
    { id: "preview", label: "Preview and provision", number: 8 },
];

/** Default wizard state — represents a fully-configured provisioning setup */
export const DEFAULT_PROVISIONING_STATE = {
    /* Step 1 — Connect to Google */
    googleConnected: true,

    /* Step 2 — Management Level */
    managementLevel: "full", // "full" | "password-only"
    transitionMode: false,

    /* Step 3 — Select Users */
    provisionStudents: true,
    provisionTeachers: true,
    provisionStaff: true,
    studentCount: 20,
    teacherCount: 10,
    staffCount: 10,

    /* Step 4 — Login Credentials */
    credentials: {
        students: {
            completed: true,
            email: "{{name.first}}{{name.last}}@maytonlyceum.com",
            password: "{{student.student_number}}{{student.grade}}{{school.sis_id}}",
            domain: "maytonlyceum.com",
            emailTokens: ["{{name.first}}", "{{name.last}}"],
        },
        teachers: {
            completed: true,
            email: "{{name.first}}{{name.last}}@maytonlyceum.com",
            password: "{{teacher.teacher_number}}0420",
            domain: "maytonlyceum.com",
            emailTokens: ["{{name.first}}", "{{name.last}}"],
        },
        staff: {
            completed: true,
            email: "{{name.first}}{{name.last}}@maytonlyceum.com",
            password: "{{staff.title}}{{school.sis_id}}",
            domain: "maytonlyceum.com",
            emailTokens: ["{{name.first}}", "{{name.last}}"],
        },
    },

    /* Step 5 — Organize OUs */
    ous: {
        students: {
            completed: true, path: "/Students/{{school_name}}/{{student.grade}}", selectedOU: "students",
            subOUFormat: [
                { type: "text", value: "/" },
                { type: "variable", variable: "school_name", label: "School Name" },
                { type: "text", value: "/" },
                { type: "variable", variable: "student.grade", label: "Grade" },
            ],
        },
        teachers: {
            completed: true, path: "/Users/Staff/Teachers", selectedOU: "users-staff-teachers",
            subOUFormat: [],
        },
        staff: {
            completed: true, path: "/Users/Staff/{{staff.department}}", selectedOU: "users-staff",
            subOUFormat: [
                { type: "text", value: "/" },
                { type: "variable", variable: "staff.department", label: "Department" },
            ],
        },
        archive:  { completed: true, path: "/", selectedOU: "root", archiveAction: "move-suspend" },
        ignored:  {
            completed: true,
            path: "/",
            ignoredOUs: ["root"],
            handling: {
                students: "auto-suspend",
                teachers: "auto-suspend",
                staff: "auto-suspend",
            },
        },
    },

    /* Step 6 — Configure Groups */
    groups: {
        students: { rulesConfigured: 0 },
        teachers: { rulesConfigured: 0 },
        staff:    { rulesConfigured: 0 },
    },

    /* Step 8 — Preview */
    preview: {
        lastRun: "3 months ago",
        accountsToCreate: 1,
        accountsToUpdate: 0,
        accountsToArchive: 0,
        syncIssues: 0,
        details: [
            { action: "Matched",       detail: "0 Clever accounts will be matched with Google accounts.",    nextSteps: "-" },
            { action: "Creates",       detail: "1 Google account will be created based on Clever data.",     nextSteps: "-" },
            { action: "Total Updates", detail: "0 Google accounts will be updated based on Clever data.",    nextSteps: "-" },
            { action: "Archives",      detail: "0 Google accounts will be suspended and moved to an archive OU since the users are no longer present in Clever data.", nextSteps: "-" },
            { action: "Total Issues",  detail: "There will be 0 issues.",                                   nextSteps: "-" },
            { action: "Conflicts",     detail: "0 accounts will not be created or matched because of conflicts. Conflicts happen when Clever IDM is attempting to create or match a user, but their email address is already taken by another Clever IDM user.", nextSteps: "-" },
        ],
    },
};

/** Google Org Unit tree — deterministic mock matching live Clever structure */
export const GOOGLE_ORG_UNITS = [
    {
        id: "root",
        name: "Fort Virgilfield Elementary School",
        path: "/",
        children: [
            { id: "devices", name: "Devices", path: "/Devices", children: [] },
            {
                id: "students",
                name: "Students",
                path: "/Students",
                children: [
                    {
                        id: "students-treutelside",
                        name: "Treutelside Middle School",
                        path: "/Students/Treutelside Middle School",
                        children: [
                            { id: "students-treutelside-7", name: "7", path: "/Students/Treutelside Middle School/7", children: [] },
                            { id: "students-treutelside-8", name: "8", path: "/Students/Treutelside Middle School/8", children: [] },
                        ],
                    },
                ],
            },
            {
                id: "users",
                name: "Users",
                path: "/Users",
                children: [
                    {
                        id: "users-staff",
                        name: "Staff",
                        path: "/Users/Staff",
                        children: [
                            { id: "users-staff-teachers", name: "Teachers", path: "/Users/Staff/Teachers", children: [] },
                            { id: "users-staff-operations", name: "Operations", path: "/Users/Staff/Operations", children: [] },
                        ],
                    },
                ],
            },
        ],
    },
];

/** Archive action options — matches live Clever */
export const ARCHIVE_ACTIONS = [
    { id: "move-suspend-archive", label: "Move to archive OU, suspend, and archive.", learnMore: true },
    { id: "move-suspend", label: "Move to archive OU and suspend" },
    { id: "move", label: "Move to archive OU" },
];

/** Sample student for credential + OU preview */
export const SAMPLE_STUDENT = {
    name: "Rogelio Waelchi",
    sisEmail: "rogelio_waelchi63@maytonlyceum.com",
    sisId: "b8452e96-7f29-4890-bde9-beb2996bee71",
    districtUsername: "",
    districtPassword: "",
    graduationYear: "2031",
    birthday: "05/12/2013",
    stateId: "XVLLJSDS8AUP",
    studentNumber: "000001",
    exampleEmail: "rogeliowaelchi@maytonlyceum.com",
    school: "Treutelside Middle School",
    grade: "7th Grade",
};

export const SAMPLE_TEACHER = {
    name: "Betty Bauch",
    sisEmail: "betty.bauch@maytonlyceum.com",
    sisId: "a1234567-89ab-cdef-0123-456789abcdef",
    teacherNumber: "T001",
    exampleEmail: "betty.bauch@maytonlyceum.com",
    school: "Treutelside Middle School",
    title: "Ms.",
};

export const SAMPLE_STAFF = {
    name: "Oswaldo Pouros",
    sisEmail: "oswaldo.pouros@maytonlyceum.com",
    sisId: "b2345678-90ab-cdef-1234-567890abcdef",
    title: "Librarian",
    department: "Operations",
    exampleEmail: "oswaldo.pouros@maytonlyceum.com",
};

/** SIS variable options per user type — for sub-OU format editor dropdowns */
export const SIS_VARIABLES = {
    students: [
        { variable: "school_name", label: "School Name" },
        { variable: "student.grade", label: "Grade" },
        { variable: "student.student_number", label: "Student Number" },
        { variable: "student.graduation_year", label: "Graduation Year" },
        { variable: "student.state_id", label: "State ID" },
    ],
    teachers: [
        { variable: "school_name", label: "School Name" },
        { variable: "teacher.title", label: "Title" },
        { variable: "teacher.teacher_number", label: "Teacher Number" },
    ],
    staff: [
        { variable: "school_name", label: "School Name" },
        { variable: "staff.title", label: "Title" },
        { variable: "staff.department", label: "Department" },
    ],
};

/** All 15 format functions — matches live Clever format editor */
export const FORMAT_FUNCTIONS = [
    "Concatenate", "Contains", "Conditional", "First", "Ignore If Null",
    "Initials", "Length", "Substring", "Text After", "Text After Last",
    "Text Before", "To Lowercase", "To Uppercase", "Trim Left",
    "Capitalize after Delimiter",
];
