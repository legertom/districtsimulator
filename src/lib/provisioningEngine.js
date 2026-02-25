// src/lib/provisioningEngine.js

// ═══════════════════════════════════════════════════════════════
//  Variable resolver
// ═══════════════════════════════════════════════════════════════

function createVariableResolver(person, userType, schoolsData) {
    const school = schoolsData.find((s) => s.id === person.schoolId);
    const schoolName = school?.name || "Unknown School";

    const map = {
        "name.first": person.first?.toLowerCase() || "",
        "name.last": person.last?.toLowerCase() || "",
        "school_name": schoolName,
    };

    if (userType === "Student") {
        map["student.student_number"] = person.studentNumber || "";
        map["student.state_id"] = person.stateId || "";
        map["student.sis_id"] = person.id || "";
        map["student.grade"] = person.grade || "";
        map["student.graduation_year"] = person.graduationYear || "";
    } else if (userType === "Teacher") {
        map["teacher.teacher_number"] = person.teacherNumber || "";
        map["teacher.sis_id"] = person.id || "";
        map["teacher.title"] = person.title?.toLowerCase() || "";
    } else if (userType === "Staff") {
        map["staff.title"] = person.title?.toLowerCase() || "";
        map["staff.sis_id"] = person.id || "";
        map["staff.department"] = person.department || "";
    }

    return (variableName) => map[variableName] ?? variableName;
}

// ═══════════════════════════════════════════════════════════════
//  Template resolvers
// ═══════════════════════════════════════════════════════════════

export function applyEmailTemplate(formatSegments, domain, person, userType, schoolsData) {
    if (!formatSegments?.length) {
        const first = person.first?.toLowerCase() || "";
        const last = person.last?.toLowerCase() || "";
        return `${first}${last}@${domain}`;
    }

    const resolve = createVariableResolver(person, userType, schoolsData);

    const username = formatSegments
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return resolve(seg.variable);
            if (seg.type === "function") return "";
            return "";
        })
        .join("");

    return domain ? `${username}@${domain}` : username;
}

export function applyOUTemplate(ouConfig, person, userType, schoolsData) {
    if (!ouConfig?.path) return "/";

    if (!ouConfig.subOUFormat?.length) {
        return ouConfig.path;
    }

    const resolve = createVariableResolver(person, userType, schoolsData);

    const subOU = ouConfig.subOUFormat
        .map((seg) => {
            if (seg.type === "text") return seg.value;
            if (seg.type === "variable") return resolve(seg.variable);
            return "";
        })
        .join("");

    const basePath = ouConfig.path.replace(/\/+$/, "");
    return `${basePath}${subOU}`;
}

export function generateCleverId(personId) {
    const str = personId || "unknown";
    // Generate three 8-char hex segments from different hash seeds
    // to produce a 24-character ID matching the reference data format
    const segments = [];
    for (let seed = 0; seed < 3; seed++) {
        let hash = seed * 0x9e3779b9; // golden-ratio offset per segment
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        segments.push(Math.abs(hash).toString(16).padStart(8, "0"));
    }
    return segments.join("").slice(0, 24);
}

// ═══════════════════════════════════════════════════════════════
//  Core engine
// ═══════════════════════════════════════════════════════════════

export function generateProvisioningResults(wizardConfig, dataBrowserData) {
    const { students, teachers, staff, schools } = dataBrowserData;
    const events = [];
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    const userTypes = [
        {
            type: "Student",
            enabled: wizardConfig.provisionStudents,
            records: students,
            count: wizardConfig.studentCount || 20,
            credKey: "students",
            ouKey: "students",
            configTemplate: "STUDENT_CONFIG",
            templateName: "Cedar Ridge Student Template",
            groupLabel: (person) => `Grade ${person.grade} All Students`,
        },
        {
            type: "Teacher",
            enabled: wizardConfig.provisionTeachers,
            records: teachers,
            count: wizardConfig.teacherCount || 10,
            credKey: "teachers",
            ouKey: "teachers",
            configTemplate: "TEACHER_CONFIG",
            templateName: "Cedar Ridge Teacher Template",
            groupLabel: () => "All Teachers",
        },
        {
            type: "Staff",
            enabled: wizardConfig.provisionStaff,
            records: staff,
            count: wizardConfig.staffCount || 10,
            credKey: "staff",
            ouKey: "staff",
            configTemplate: "STAFF_CONFIG",
            templateName: "Cedar Ridge Staff Template",
            groupLabel: (person) => `${person.department || "All"} Staff`,
        },
    ];

    for (const ut of userTypes) {
        if (!ut.enabled) continue;

        const cred = wizardConfig.credentials?.[ut.credKey] || {};
        const ou = wizardConfig.ous?.[ut.ouKey] || {};
        const sliced = ut.records.slice(0, ut.count);

        for (const person of sliced) {
            const email = applyEmailTemplate(
                cred.emailFormat,
                cred.domain || "cedarridgesd.org",
                person,
                ut.type,
                schools,
            );
            const currentOU = applyOUTemplate(ou, person, ut.type, schools);
            const cleverId = generateCleverId(person.id);
            const domainUsername = email.split("@")[0];
            const first = person.first;
            const last = person.last;

            events.push({
                date: dateStr,
                event: "Created",
                destination: "Google Workspace",
                user: `${first} ${last}`,
                sisId: person.id,
                destinationUsername: email,
                userType: ut.type,
                cleverId,
                currentOU,
                previousOU: "N/A",
                currentManagedGroups: ut.groupLabel(person),
                previousManagedGroups: "N/A",
                modifiedFields: [
                    { field: "Given name", value: first },
                    { field: "Family name", value: last },
                    { field: "Domain username", value: domainUsername },
                ],
                allModifiedData: [
                    { field: "Clever Id", value: cleverId },
                    { field: "Completion Timestamp", value: today.toISOString() },
                    { field: "Config String", value: ut.configTemplate },
                    { field: "Family Name", value: last },
                    { field: "Given Name", value: first },
                    { field: "Org Unit", value: currentOU },
                    { field: "Password", value: "redacted" },
                    { field: "Primary Email", value: email },
                    { field: "Sis Id", value: person.id },
                    { field: "User Type", value: ut.type.toLowerCase() },
                ],
                additionalFields: [{ field: "Templates Used", value: ut.templateName }],
                personId: person.id,
            });
        }
    }

    const syncSummary = {
        creates: events.length,
        matches: 0,
        updates: 0,
        archives: 0,
        issues: 0,
    };

    return { events, syncSummary };
}

export function generateSyncHistory(syncSummary, totalUsers) {
    const rows = [];
    const now = new Date();

    rows.push({
        destination: "Google",
        dateTime: now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            + "; " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        creates: syncSummary.creates,
        matches: syncSummary.matches,
        updates: syncSummary.updates,
        archives: syncSummary.archives,
        issues: syncSummary.issues,
    });

    for (let i = 1; i <= 13; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        rows.push({
            destination: "Google",
            dateTime: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                + "; " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            creates: 0,
            matches: totalUsers,
            updates: 0,
            archives: 0,
            issues: 0,
        });
    }

    return rows;
}
