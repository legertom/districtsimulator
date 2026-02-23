#!/usr/bin/env node
/**
 * Converts CSV files from the Cedar Ridge School District into
 * the dataBrowser.js format used by the District Simulator.
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CSV_DIR = "/Users/tomleger/Downloads/cedar-ridge-school-district-csv-files";
const OUTPUT = join(import.meta.dirname, "../src/data/defaults/dataBrowser.js");

// ── CSV parser ──────────────────────────────────────────────
function parseCSV(filePath) {
    const raw = readFileSync(filePath, "utf-8").trim();
    const lines = raw.split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = (values[i] || "").trim(); });
        return obj;
    });
}

// ── Read all CSVs ───────────────────────────────────────────
const schools = parseCSV(join(CSV_DIR, "schools.csv"));
const students = parseCSV(join(CSV_DIR, "students.csv"));
const teachers = parseCSV(join(CSV_DIR, "teachers.csv"));
const staff = parseCSV(join(CSV_DIR, "staff.csv"));
const sections = parseCSV(join(CSV_DIR, "sections.csv"));
const enrollments = parseCSV(join(CSV_DIR, "enrollments.csv"));

console.log(`Schools:     ${schools.length}`);
console.log(`Students:    ${students.length}`);
console.log(`Teachers:    ${teachers.length}`);
console.log(`Staff:       ${staff.length}`);
console.log(`Sections:    ${sections.length}`);
console.log(`Enrollments: ${enrollments.length}`);

// ── Lookup maps ─────────────────────────────────────────────
const schoolById = Object.fromEntries(schools.map(s => [s.school_id, s]));
const teacherById = Object.fromEntries(teachers.map(t => [t.teacher_id, t]));

// Count students per school
const studentsPerSchool = {};
students.forEach(s => {
    studentsPerSchool[s.school_id] = (studentsPerSchool[s.school_id] || 0) + 1;
});

// Count teachers per school
const teachersPerSchool = {};
teachers.forEach(t => {
    teachersPerSchool[t.school_id] = (teachersPerSchool[t.school_id] || 0) + 1;
});

// Count sections per school
const sectionsPerSchool = {};
sections.forEach(s => {
    sectionsPerSchool[s.school_id] = (sectionsPerSchool[s.school_id] || 0) + 1;
});

// Count students per section (from enrollments)
const studentsPerSection = {};
enrollments.forEach(e => {
    studentsPerSection[e.section_id] = (studentsPerSection[e.section_id] || 0) + 1;
});

// ── Format helpers ──────────────────────────────────────────
const LAST_MODIFIED = { date: "Feb 1, 2026", time: "9:45 a.m." };

function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function schoolName(schoolId) {
    return schoolById[schoolId]?.school_name || "Unknown School";
}

function teacherName(teacherId) {
    const t = teacherById[teacherId];
    return t ? `${t.first_name} ${t.last_name}` : "";
}

function esc(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, "\\'");
}

// ── Generate SCHOOLS_DATA ───────────────────────────────────
const SCHOOLS_DATA = schools.map(s => ({
    id: s.school_id,
    name: s.school_name,
    city: s.school_city,
    state: s.school_state,
    students: { value: String(studentsPerSchool[s.school_id] || 0), link: true },
    dataSource: "SIS",
    sections: { value: String(sectionsPerSchool[s.school_id] || 0), link: true },
    teachers: { value: String(teachersPerSchool[s.school_id] || 0), link: true },
    lastModified: LAST_MODIFIED,
    // Extra fields for profile
    schoolNumber: s.school_number,
    stateId: s.state_id,
    lowGrade: s.low_grade,
    highGrade: s.high_grade,
    address: s.school_address,
    zip: s.school_zip,
    phone: s.school_phone,
    principal: s.principal,
    principalEmail: s.principal_email,
}));

// ── Generate STUDENTS_DATA ──────────────────────────────────
const STUDENTS_DATA = students.map(s => ({
    id: s.student_id,
    school: schoolName(s.school_id),
    schoolId: s.school_id,
    first: s.first_name,
    last: s.last_name,
    middleName: s.middle_name,
    gender: s.gender,
    dataSource: "SIS",
    dob: s.dob,
    grade: s.grade,
    lastModified: LAST_MODIFIED,
    // Extra fields for profile
    studentNumber: s.student_number,
    stateId: s.state_id,
    race: s.race,
    hispanicLatino: s.hispanic_latino,
    homeLanguage: s.home_language,
    ellStatus: s.ell_status,
    frlStatus: s.frl_status,
    iepStatus: s.iep_status,
    email: s.student_email,
    street: s.student_street,
    city: s.student_city,
    state: s.student_state,
    zip: s.student_zip,
}));

// ── Generate TEACHERS_DATA ──────────────────────────────────
const TEACHERS_DATA = teachers.map(t => ({
    id: t.teacher_id,
    school: schoolName(t.school_id),
    schoolId: t.school_id,
    first: t.first_name,
    last: t.last_name,
    middleName: t.middle_name,
    title: t.title,
    dataSource: "SIS",
    email: t.teacher_email,
    lastModified: LAST_MODIFIED,
    // Extra fields for profile
    teacherNumber: t.teacher_number,
    stateTeacherId: t.state_teacher_id,
    username: t.username,
}));

// ── Generate STAFF_DATA ─────────────────────────────────────
const STAFF_DATA = staff.map(s => ({
    id: s.staff_id,
    school: schoolName(s.school_id),
    schoolId: s.school_id,
    first: s.first_name,
    last: s.last_name,
    title: s.title,
    email: s.staff_email,
    dataSource: "SIS",
    lastModified: LAST_MODIFIED,
    // Extra fields for profile
    department: s.department,
    username: s.username,
    role: s.role,
}));

// ── Generate SECTIONS_DATA ──────────────────────────────────
const SECTIONS_DATA = sections.map(s => ({
    id: s.section_id,
    school: schoolName(s.school_id),
    schoolId: s.school_id,
    name: `${s.course_name} - ${teacherName(s.teacher_id).split(" ").pop() || "TBD"} - P${s.period}`,
    grade: s.grade,
    subject: s.subject,
    dataSource: "SIS",
    teacher: teacherName(s.teacher_id),
    teacherId: s.teacher_id,
    course: s.course_name,
    courseNumber: s.course_number,
    term: s.term_name,
    termStart: s.term_start,
    termEnd: s.term_end,
    students: String(studentsPerSection[s.section_id] || 0),
    lastModified: LAST_MODIFIED,
    period: s.period,
    description: s.course_description,
}));

// ── Generate TERMS_DATA ─────────────────────────────────────
// Extract unique terms from sections
const termsMap = new Map();
sections.forEach(s => {
    if (!termsMap.has(s.term_name)) {
        termsMap.set(s.term_name, {
            name: s.term_name,
            start: formatDate(s.term_start),
            end: formatDate(s.term_end),
            cleverId: "697ee1f29df72ba415b49128",
            created: { date: "Feb 1, 2026", time: "12:17 a.m." },
            sections: "Sections",
            lastModified: LAST_MODIFIED,
        });
    }
});
const TERMS_DATA = Array.from(termsMap.values());

// ── Generate COURSES_DATA ───────────────────────────────────
// Extract unique courses from sections
const coursesMap = new Map();
let clevCounter = 0x697ee1f29df72ba415b49129;
sections.forEach(s => {
    if (!coursesMap.has(s.course_number)) {
        coursesMap.set(s.course_number, {
            number: s.course_number,
            name: s.course_name,
            cleverId: s.section_id.substring(0, 24),
            sections: "Sections",
            lastModified: LAST_MODIFIED,
        });
    }
});
const COURSES_DATA = Array.from(coursesMap.values()).sort((a, b) => a.number.localeCompare(b.number));

// ── Generate enrollments lookup for student profiles ────────
// Build a map: student_id → [section_ids]
const enrollmentsByStudent = {};
enrollments.forEach(e => {
    if (!enrollmentsByStudent[e.student_id]) {
        enrollmentsByStudent[e.student_id] = [];
    }
    enrollmentsByStudent[e.student_id].push(e.section_id);
});

// ── Write output ────────────────────────────────────────────
const output = `/**
 * Data Browser domain data
 * Auto-generated from CSV files on ${new Date().toISOString().split("T")[0]}
 */

export const TABS = [
    "Schools",
    "Students",
    "Teachers",
    "Staff",
    "Sections",
    "Terms",
    "Courses",
    "Contacts"
];

export const SCHOOLS_DATA = ${JSON.stringify(SCHOOLS_DATA, null, 4)};

export const STUDENTS_DATA = ${JSON.stringify(STUDENTS_DATA, null, 4)};

export const TEACHERS_DATA = ${JSON.stringify(TEACHERS_DATA, null, 4)};

export const STAFF_DATA = ${JSON.stringify(STAFF_DATA, null, 4)};

export const SECTIONS_DATA = ${JSON.stringify(SECTIONS_DATA, null, 4)};

export const TERMS_DATA = ${JSON.stringify(TERMS_DATA, null, 4)};

export const COURSES_DATA = ${JSON.stringify(COURSES_DATA, null, 4)};

export const CONTACTS_DATA = [];

// Enrollment lookup: student_id → [section_ids]
export const ENROLLMENTS_BY_STUDENT = ${JSON.stringify(enrollmentsByStudent, null, 4)};

// Enrollment lookup: section_id → [student_ids]
export const ENROLLMENTS_BY_SECTION = ${JSON.stringify(
    Object.fromEntries(
        [...new Set(enrollments.map(e => e.section_id))].map(sid => [
            sid,
            enrollments.filter(e => e.section_id === sid).map(e => e.student_id)
        ])
    ), null, 4)};
`;

writeFileSync(OUTPUT, output, "utf-8");
console.log(`\nWrote ${OUTPUT}`);
console.log(`  Schools:  ${SCHOOLS_DATA.length}`);
console.log(`  Students: ${STUDENTS_DATA.length}`);
console.log(`  Teachers: ${TEACHERS_DATA.length}`);
console.log(`  Staff:    ${STAFF_DATA.length}`);
console.log(`  Sections: ${SECTIONS_DATA.length}`);
console.log(`  Terms:    ${TERMS_DATA.length}`);
console.log(`  Courses:  ${COURSES_DATA.length}`);
