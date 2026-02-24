"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useScenario } from "@/context/ScenarioContext";
import { demoDistrict } from "@/data/demoIdentity";
import { buildStudentProfileRoute, buildTeacherProfileRoute, buildStaffProfileRoute } from "@/lib/routing";
import styles from "./DataBrowser.module.css";
import { Icon } from "@/components/ui/Icons";
import { DataTable } from "@/components/ui/DataTable";

const ROWS_PER_PAGE = 20;

// ── Search helper ───────────────────────────────────────────
function matchesSearch(row, query, keys) {
    if (!query) return true;
    const q = query.toLowerCase();
    return keys.some(k => {
        const val = row[k];
        return typeof val === "string" && val.toLowerCase().includes(q);
    });
}

// ── Detail Panel ────────────────────────────────────────────
function DetailField({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className={styles.detailField}>
            <span className={styles.detailLabel}>{label}</span>
            <span className={styles.detailValue}>{value}</span>
        </div>
    );
}

function DetailPanel({ type, item, onClose, sections, students, enrollmentsByStudent, enrollmentsBySection }) {
    if (!item) return null;

    const renderStudentDetail = () => {
        const enrolledSectionIds = enrollmentsByStudent?.[item.id] || [];
        const enrolledSections = sections?.filter(s => enrolledSectionIds.includes(s.id)) || [];
        return (
            <>
                <DetailField label="Name" value={`${item.first} ${item.middleName ? item.middleName + " " : ""}${item.last}`} />
                <DetailField label="Student Number" value={item.studentNumber} />
                <DetailField label="State ID" value={item.stateId} />
                <DetailField label="School" value={item.school} />
                <DetailField label="Grade" value={item.grade} />
                <DetailField label="Gender" value={item.gender} />
                <DetailField label="Date of Birth" value={item.dob} />
                <DetailField label="Email" value={item.email} />
                <DetailField label="Race" value={item.race} />
                <DetailField label="Hispanic/Latino" value={item.hispanicLatino} />
                <DetailField label="Home Language" value={item.homeLanguage} />
                <DetailField label="ELL Status" value={item.ellStatus} />
                <DetailField label="FRL Status" value={item.frlStatus} />
                <DetailField label="IEP Status" value={item.iepStatus} />
                <DetailField label="Address" value={`${item.street}, ${item.city}, ${item.state} ${item.zip}`} />
                <DetailField label="Data Source" value={item.dataSource} />
                {enrolledSections.length > 0 && (
                    <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Enrolled Sections ({enrolledSections.length})</span>
                        <ul className={styles.detailList}>
                            {enrolledSections.map(s => (
                                <li key={s.id}>{s.course} &mdash; {s.teacher} (P{s.period})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    const renderTeacherDetail = () => {
        const teacherSections = sections?.filter(s => s.teacherId === item.id) || [];
        return (
            <>
                <DetailField label="Name" value={`${item.title} ${item.first} ${item.middleName ? item.middleName + " " : ""}${item.last}`} />
                <DetailField label="Teacher Number" value={item.teacherNumber} />
                <DetailField label="State Teacher ID" value={item.stateTeacherId} />
                <DetailField label="School" value={item.school} />
                <DetailField label="Email" value={item.email} />
                <DetailField label="Username" value={item.username} />
                <DetailField label="Data Source" value={item.dataSource} />
                {teacherSections.length > 0 && (
                    <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Sections ({teacherSections.length})</span>
                        <ul className={styles.detailList}>
                            {teacherSections.map(s => (
                                <li key={s.id}>{s.course} &mdash; Grade {s.grade} (P{s.period})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    const renderStaffDetail = () => (
        <>
            <DetailField label="Name" value={`${item.first} ${item.last}`} />
            <DetailField label="Title" value={item.title} />
            <DetailField label="Department" value={item.department} />
            <DetailField label="Role" value={item.role} />
            <DetailField label="School" value={item.school} />
            <DetailField label="Email" value={item.email} />
            <DetailField label="Username" value={item.username} />
            <DetailField label="Data Source" value={item.dataSource} />
        </>
    );

    const renderSchoolDetail = () => (
        <>
            <DetailField label="Name" value={item.name} />
            <DetailField label="School Number" value={item.schoolNumber} />
            <DetailField label="State ID" value={item.stateId} />
            <DetailField label="Grades" value={`${item.lowGrade} - ${item.highGrade}`} />
            <DetailField label="Address" value={item.address} />
            <DetailField label="City" value={`${item.city}, ${item.state} ${item.zip}`} />
            <DetailField label="Phone" value={item.phone} />
            <DetailField label="Principal" value={item.principal} />
            <DetailField label="Principal Email" value={item.principalEmail} />
            <DetailField label="Students" value={item.students?.value} />
            <DetailField label="Teachers" value={item.teachers?.value} />
            <DetailField label="Sections" value={item.sections?.value} />
            <DetailField label="Data Source" value={item.dataSource} />
        </>
    );

    const renderSectionDetail = () => {
        const enrolledStudentIds = enrollmentsBySection?.[item.id] || [];
        const enrolledStudents = students?.filter(s => enrolledStudentIds.includes(s.id)) || [];
        return (
            <>
                <DetailField label="Name" value={item.name} />
                <DetailField label="Course" value={item.course} />
                <DetailField label="Course Number" value={item.courseNumber} />
                <DetailField label="Description" value={item.description} />
                <DetailField label="School" value={item.school} />
                <DetailField label="Grade" value={item.grade} />
                <DetailField label="Subject" value={item.subject} />
                <DetailField label="Period" value={item.period} />
                <DetailField label="Primary Teacher" value={item.teacher} />
                <DetailField label="Term" value={item.term} />
                <DetailField label="Term Dates" value={`${item.termStart} to ${item.termEnd}`} />
                <DetailField label="Data Source" value={item.dataSource} />
                {enrolledStudents.length > 0 && (
                    <div className={styles.detailField}>
                        <span className={styles.detailLabel}>Students ({enrolledStudents.length})</span>
                        <ul className={styles.detailList}>
                            {enrolledStudents.map(s => (
                                <li key={s.id}>{s.first} {s.last} &mdash; Grade {s.grade}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    const titles = {
        Students: `${item.first} ${item.last}`,
        Teachers: `${item.title || ""} ${item.first} ${item.last}`,
        Staff: `${item.first} ${item.last}`,
        Schools: item.name,
        Sections: item.name || item.course,
    };

    return (
        <div className={styles.detailOverlay} onClick={onClose}>
            <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
                <div className={styles.detailHeader}>
                    <h2 className={styles.detailTitle}>{titles[type] || "Details"}</h2>
                    <button className={styles.detailClose} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.detailBody}>
                    {type === "Students" && renderStudentDetail()}
                    {type === "Teachers" && renderTeacherDetail()}
                    {type === "Staff" && renderStaffDetail()}
                    {type === "Schools" && renderSchoolDetail()}
                    {type === "Sections" && renderSectionDetail()}
                </div>
                {(type === "Students" || type === "Teachers" || type === "Staff") && (
                    <div className={styles.detailPanelFooter}>
                        <Link
                            href={
                                type === "Students" ? buildStudentProfileRoute(item.id) :
                                type === "Teachers" ? buildTeacherProfileRoute(item.id) :
                                buildStaffProfileRoute(item.id)
                            }
                            className={styles.viewProfileLink}
                        >
                            View Full Profile →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Pagination ──────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className={styles.pagination}>
            <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >Prev</button>
            {start > 1 && (
                <>
                    <button className={styles.pageButton} onClick={() => onPageChange(1)}>1</button>
                    {start > 2 && <span className={styles.pageButton}>...</span>}
                </>
            )}
            {pages.map(p => (
                <button
                    key={p}
                    className={`${styles.pageButton} ${currentPage === p ? styles.activePage : ""}`}
                    onClick={() => onPageChange(p)}
                >{p}</button>
            ))}
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className={styles.pageButton}>...</span>}
                    <button className={styles.pageButton} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}
            <button
                className={`${styles.pageButton} ${styles.navButton}`}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
            >Next</button>
        </div>
    );
}

// ── Last Modified renderer ──────────────────────────────────
function LastModifiedCell({ row }) {
    return (
        <span className={styles.lastModified}>
            <span className={styles.modifiedDate}>{row.lastModified.date}</span>
            <span className={styles.modifiedTime}>{row.lastModified.time}</span>
        </span>
    );
}

// ── Main Component ──────────────────────────────────────────
export default function DataBrowser() {
    const { scenario } = useScenario();
    const {
        tabs: TABS,
        schools: SCHOOLS_DATA,
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        sections: SECTIONS_DATA,
        terms: TERMS_DATA,
        courses: COURSES_DATA,
        contacts: CONTACTS_DATA,
        enrollmentsByStudent: ENROLLMENTS_BY_STUDENT,
        enrollmentsBySection: ENROLLMENTS_BY_SECTION
    } = scenario.dataBrowser;

    const [activeTab, setActiveTab] = useState("Schools");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    // ── Filtered data ───────────────────────────────────────
    const filteredData = useMemo(() => {
        const searchKeys = {
            Schools: ["name", "city", "state", "principal"],
            Students: ["first", "last", "school", "grade", "email", "dob"],
            Teachers: ["first", "last", "school", "email", "title"],
            Staff: ["first", "last", "email", "title", "department"],
            Sections: ["name", "school", "teacher", "course", "subject", "grade"],
            Terms: ["name"],
            Courses: ["name", "number"],
            Contacts: ["name", "email"],
        };
        const dataForTab = {
            Schools: SCHOOLS_DATA,
            Students: STUDENTS_DATA,
            Teachers: TEACHERS_DATA,
            Staff: STAFF_DATA,
            Sections: SECTIONS_DATA,
            Terms: TERMS_DATA,
            Courses: COURSES_DATA,
            Contacts: CONTACTS_DATA || [],
        };
        const data = dataForTab[activeTab] || [];
        const keys = searchKeys[activeTab] || [];
        if (!searchQuery) return data;
        return data.filter(row => matchesSearch(row, searchQuery, keys));
    }, [activeTab, searchQuery, SCHOOLS_DATA, STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SECTIONS_DATA, TERMS_DATA, COURSES_DATA, CONTACTS_DATA]);

    // ── Pagination ──────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
    const pagedData = filteredData.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    // Reset page on tab or search change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
        setSearchQuery("");
        setSelectedItem(null);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleRowClick = (row) => {
        setSelectedItem(row);
    };

    // ── Format count text ───────────────────────────────────
    const formatCount = (count, singular, plural) => {
        const formatted = count.toLocaleString();
        return `${formatted} ${count === 1 ? singular : plural} found`;
    };

    const countText = formatCount(
        filteredData.length,
        activeTab.slice(0, -1).toLowerCase(),
        activeTab.toLowerCase()
    );

    // ── Last modified render helper ─────────────────────────
    const lastModifiedCol = {
        key: "lastModified",
        header: "Last Modified",
        sortable: true,
        render: (row) => <LastModifiedCell row={row} />
    };

    // ── Column definitions ──────────────────────────────────
    const schoolColumns = [
        { key: "name", header: "Name", sortable: true, render: (row) => <span className={styles.schoolName}>{row.name}</span> },
        { key: "city", header: "City", sortable: true },
        { key: "state", header: "State", sortable: true },
        { key: "students", header: "Students", sortable: false, render: (row) => row.students.link ? <span className={styles.link}>{row.students.value}</span> : row.students.value },
        { key: "dataSource", header: "Data Source", sortable: false },
        { key: "sections", header: "Sections", sortable: false, render: (row) => row.sections.link ? <span className={styles.link}>{row.sections.value}</span> : row.sections.value },
        { key: "teachers", header: "Teachers", sortable: false, render: (row) => row.teachers.link ? <span className={styles.link}>{row.teachers.value}</span> : row.teachers.value },
        lastModifiedCol,
    ];

    const studentColumns = [
        { key: "school", header: "School", sortable: true },
        { key: "first", header: "First", sortable: true },
        { key: "last", header: "Last", sortable: true },
        { key: "gender", header: "Gender", sortable: true },
        { key: "dataSource", header: "Data Source", sortable: false },
        { key: "dob", header: "Dob", sortable: true },
        { key: "grade", header: "Grade", sortable: true },
        lastModifiedCol,
    ];

    const teacherColumns = [
        { key: "school", header: "School", sortable: true },
        { key: "first", header: "First", sortable: true },
        { key: "last", header: "Last", sortable: true },
        { key: "title", header: "Title", sortable: true },
        { key: "dataSource", header: "Data Source", sortable: false },
        { key: "email", header: "Email", sortable: true, render: (row) => <span className={styles.link}>{row.email}</span> },
        lastModifiedCol,
    ];

    const staffColumns = [
        { key: "first", header: "First", sortable: true },
        { key: "last", header: "Last", sortable: true },
        { key: "title", header: "Title", sortable: true },
        { key: "email", header: "Email", sortable: true, render: (row) => <span className={styles.link}>{row.email}</span> },
        { key: "dataSource", header: "Data Source", sortable: false },
        lastModifiedCol,
    ];

    const sectionColumns = [
        { key: "school", header: "School", sortable: true },
        { key: "name", header: "Name", sortable: true, render: (row) => <span className={styles.schoolName}>{row.name}</span> },
        { key: "grade", header: "Grade", sortable: true },
        { key: "subject", header: "Subject", sortable: true },
        { key: "dataSource", header: "Data Source", sortable: false },
        { key: "teacher", header: "Primary Teacher", sortable: true },
        { key: "course", header: "Course", sortable: true, render: (row) => <span className={styles.link}>{row.course}</span> },
        { key: "term", header: "Term", sortable: true, render: (row) => <span className={styles.link}>{row.term}</span> },
        { key: "students", header: "Students", sortable: true },
        lastModifiedCol,
    ];

    const termColumns = [
        { key: "name", header: "Name", sortable: false, render: (row) => <span className={styles.schoolName}>{row.name}</span> },
        { key: "start", header: "Start Date", sortable: false },
        { key: "end", header: "End Date", sortable: false },
        { key: "cleverId", header: "Clever ID", sortable: false },
        { key: "created", header: "Created", sortable: false, render: (row) => (
            <span className={styles.lastModified}>
                <span className={styles.modifiedDate}>{row.created.date}</span>
                <span className={styles.modifiedTime}>{row.created.time}</span>
            </span>
        )},
        { key: "sections", header: "Sections", sortable: false, render: (row) => <span className={styles.link}>{row.sections}</span> },
        { ...lastModifiedCol, sortable: false },
    ];

    const courseColumns = [
        { key: "number", header: "Number", sortable: true },
        { key: "name", header: "Name", sortable: true, render: (row) => <span className={styles.schoolName}>{row.name}</span> },
        { key: "cleverId", header: "Clever ID", sortable: false },
        { key: "sections", header: "Sections", sortable: false, render: (row) => <span className={styles.link}>{row.sections}</span> },
        lastModifiedCol,
    ];

    const contactColumns = [
        { key: "name", header: "Name", sortable: false },
        { key: "email", header: "Email", sortable: false },
        { key: "phone", header: "Phone", sortable: false },
        { key: "students", header: "Students", sortable: false },
        { key: "dataSource", header: "Data Source", sortable: false },
        { key: "lastModified", header: "Last Modified", sortable: false },
    ];

    const columnsForTab = {
        Schools: schoolColumns,
        Students: studentColumns,
        Teachers: teacherColumns,
        Staff: staffColumns,
        Sections: sectionColumns,
        Terms: termColumns,
        Courses: courseColumns,
        Contacts: contactColumns,
    };

    // ── Clickable tabs (open profile) ───────────────────────
    const clickableTabs = new Set(["Schools", "Students", "Teachers", "Staff", "Sections"]);

    return (
        <div className={styles.container}>
            <div className={styles.pageTitleRow}>
                <div className={styles.titleSection}>
                    <h1>Data browser</h1>
                    <div className={styles.districtId}>
                        DISTRICT ID:
                        <span id="district-id-val" className={styles.districtIdValue}>{demoDistrict.id}</span>
                    </div>
                </div>
                <button className={styles.exportButton}>
                    Export {activeTab.toLowerCase()}
                </button>
            </div>

            <div className={styles.infoBanner}>
                <Icon name="portal" size={18} className={styles.infoIcon} />
                <span>
                    Learn to effectively <a href="#" className={styles.infoLink}>browse data here</a>.
                </span>
            </div>

            <nav className={styles.tabsContainer}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <div className={styles.tableActions}>
                <button className={styles.addFilterButton}>Add Filter</button>
                <div className={styles.searchWrapper}>
                    <Icon name="search" size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className={styles.countText}>
                    {countText}
                </div>
                {(activeTab === "Staff" || activeTab === "Terms" || activeTab === "Courses" || activeTab === "Contacts") && (
                    <div className={styles.learnMoreStaff}>
                        <Icon name="warning" size={16} className={styles.inlineIcon} /> Learn more about <a href="#" className={styles.infoLink}>{activeTab.toLowerCase()}</a>.
                    </div>
                )}
            </div>

            {activeTab === "Sections" && (
                <div className={styles.warningBanner}>
                    <Icon name="warning" size={18} className={styles.warningIcon} />
                    <span>
                        Sections refer to the individual instance of a course, such as a 2nd period Algebra class taught by a specific teacher. Learn more about <a href="#" className={styles.infoLink}>sections</a>.
                    </span>
                </div>
            )}

            <div className={styles.tableWrapper}>
                <DataTable
                    columns={columnsForTab[activeTab] || []}
                    data={pagedData}
                    onRowClick={clickableTabs.has(activeTab) ? handleRowClick : undefined}
                />
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {selectedItem && (
                <DetailPanel
                    type={activeTab}
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    sections={SECTIONS_DATA}
                    students={STUDENTS_DATA}
                    enrollmentsByStudent={ENROLLMENTS_BY_STUDENT}
                    enrollmentsBySection={ENROLLMENTS_BY_SECTION}
                />
            )}
        </div>
    );
}
