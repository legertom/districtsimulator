"use client";

import { useState } from "react";
import styles from "./DataBrowser.module.css";
import { Icon } from "@/components/ui/Icons";

const TABS = [
    "Schools",
    "Students",
    "Teachers",
    "Staff",
    "Sections",
    "Terms",
    "Courses",
    "Contacts"
];

const SCHOOLS_DATA = [
    {
        name: "Default District Office (Auto-generated)",
        city: "--",
        state: "--",
        students: { value: "--", link: false },
        dataSource: "SIS",
        sections: { value: "--", link: false },
        teachers: { value: "--", link: false },
        lastModified: { date: "Jul 14, 2025", time: "7:24 p.m." }
    },
    {
        name: "Fort Virgilfield Elementary School",
        city: "Bloomington",
        state: "KS",
        students: { value: "1713", link: true },
        dataSource: "SIS",
        sections: { value: "17", link: true },
        teachers: { value: "9", link: true },
        lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." }
    },
    {
        name: "Santa Rosa Elementary School",
        city: "Fort Enola",
        state: "NY",
        students: { value: "1613", link: true },
        dataSource: "SIS",
        sections: { value: "14", link: true },
        teachers: { value: "7", link: true },
        lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." }
    },
    {
        name: "Treutelside Middle School",
        city: "Stantonchester",
        state: "RI",
        students: { value: "1674", link: true },
        dataSource: "SIS",
        sections: { value: "19", link: true },
        teachers: { value: "9", link: true },
        lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." }
    }
];

const STUDENTS_DATA = [
    { school: "Treutelside Middle School", first: "Remington", last: "Stoltenberg", gender: "F", dataSource: "SIS", dob: "2013-08-25", grade: "7", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Madisyn", last: "Hoeger", gender: "M", dataSource: "SIS", dob: "2012-11-22", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Brando", last: "Hane", gender: "M", dataSource: "SIS", dob: "2014-07-24", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Lavon", last: "Botsford", gender: "X", dataSource: "SIS", dob: "2012-12-12", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Albert", last: "Sawayn", gender: "F", dataSource: "SIS", dob: "2013-10-12", grade: "7", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Leslie", last: "Flatley", gender: "M", dataSource: "SIS", dob: "2014-08-13", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Rhiannon", last: "Hackett", gender: "M", dataSource: "SIS", dob: "2012-03-24", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Adrianna", last: "Muller", gender: "X", dataSource: "SIS", dob: "2014-08-25", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Cleveland", last: "Grant", gender: "M", dataSource: "SIS", dob: "2012-03-02", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Nicklaus", last: "Turner", gender: "M", dataSource: "SIS", dob: "2012-06-28", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Dan", last: "Schumm", gender: "F", dataSource: "SIS", dob: "2014-09-05", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Sierra", last: "Grimes-Ebert", gender: "X", dataSource: "SIS", dob: "2014-01-22", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Bernardo", last: "Halvorson", gender: "M", dataSource: "SIS", dob: "2012-10-23", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Everette", last: "Klohn", gender: "F", dataSource: "SIS", dob: "2013-05-08", grade: "7", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Irwin", last: "Herman", gender: "X", dataSource: "SIS", dob: "2013-09-30", grade: "7", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Alaina", last: "Kilback", gender: "M", dataSource: "SIS", dob: "2012-05-21", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Jarrell", last: "Wisoky", gender: "X", dataSource: "SIS", dob: "2014-03-24", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Eldred", last: "Reinger", gender: "M", dataSource: "SIS", dob: "2012-04-27", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Zoe", last: "Goyette", gender: "X", dataSource: "SIS", dob: "2014-05-20", grade: "6", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Guy", last: "Kuh", gender: "M", dataSource: "SIS", dob: "2012-08-31", grade: "8", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } }
];

const TEACHERS_DATA = [
    { school: "Treutelside Middle School", first: "Betty", last: "Bauch", title: "Ms.", dataSource: "SIS", email: "betty_bauch@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Earnest", last: "Rolfson", title: "Dr.", dataSource: "SIS", email: "earnest_rolfson82@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Rogelio", last: "Welch", title: "Ms.", dataSource: "SIS", email: "rogelio.welch93@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Uriah", last: "Connelly", title: "Dr.", dataSource: "SIS", email: "uriah_connelly17@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Walter", last: "Krajcik", title: "Ms.", dataSource: "SIS", email: "walter.krajcik@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Gerardo", last: "Erdman", title: "Mrs.", dataSource: "SIS", email: "gerardo_erdman91@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Lorelne", last: "Brakus", title: "Dr.", dataSource: "SIS", email: "lorelne_brakus@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Freeman", last: "Koney", title: "Dr.", dataSource: "SIS", email: "freeman.koney1@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Treutelside Middle School", first: "Jalen", last: "Reinger", title: "Dr.", dataSource: "SIS", email: "jalen.reinger61@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Sierra", last: "Hintz", title: "Mrs.", dataSource: "SIS", email: "sierra_hintz@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Claudie", last: "Cummings", title: "Mr.", dataSource: "SIS", email: "claudie_cummings22@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Anibal", last: "Hand-Schroeder", title: "Dr.", dataSource: "SIS", email: "anibal.hand-schroeder@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Skylar", last: "Corwin", title: "Ms.", dataSource: "SIS", email: "skylar_corwin74@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Gregory", last: "Crist", title: "Mr.", dataSource: "SIS", email: "gregory.crist57@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Malcolm", last: "Reynolds", title: "Mr.", dataSource: "SIS", email: "malcolm_reynolds43@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Destiny", last: "Kunze", title: "Ms.", dataSource: "SIS", email: "destiny_kunze@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Alexane", last: "Hyatt", title: "Mrs.", dataSource: "SIS", email: "alexanne_hyatt@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Fort Virgilfield Elementary School", first: "Erna", last: "Keeling", title: "Dr.", dataSource: "SIS", email: "erna.keeling71@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Santa Rosa Elementary School", first: "Armen", last: "Yost", title: "Mr.", dataSource: "SIS", email: "armen.yost@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } },
    { school: "Santa Rosa Elementary School", first: "Drake", last: "Keiser", title: "Dr.", dataSource: "SIS", email: "drake_keiser@exampledistrict.org", lastModified: { date: "Feb 1, 2026", time: "9:45 a.m." } }
];

const STAFF_DATA = [
    { first: "Maegan", last: "Fadel", title: "Principal", email: "maegan.fadel73@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Shyanne", last: "Kuhic", title: "Librarian", email: "shyanne.kuhic@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Jaycee", last: "O'Hara", title: "Assistant Principal", email: "jaycee.ohara@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Donavon", last: "Johnson", title: "Principal", email: "donavon_johnson5@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Andy", last: "Willms", title: "Counselor", email: "andy.willms36@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Tess", last: "Heaney", title: "Special Education Coordinator", email: "tess.heaney@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Fanny", last: "Stracke", title: "Librarian", email: "fanny.stracke@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Percival", last: "Beier", title: "Teaching Assistant", email: "percival_beier23@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Leland", last: "Greenholt", title: "Counselor", email: "leland_greenholt@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Arvid", last: "Crooks", title: "Teaching Assistant", email: "arvid_crooks31@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Irving", last: "Labadie", title: "Assistant Principal", email: "irving_labadie22@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Seth", last: "Roberts", title: "Nurse", email: "seth.roberts@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Penelope", last: "Goyette", title: "Custodian", email: "penelope.goyette@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Carolina", last: "Parker", title: "Secretary", email: "carolina_parker2@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { first: "Tyrel", last: "McGlynn", title: "Nurse", email: "tyrel.mcglynn38@exampledistrict.com", dataSource: "SIS", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } }
];

const SECTIONS_DATA = [
    { school: "Treutelside Middle School", name: "Mathematics - Grade 6 - Krajcik - 0", grade: "6", subject: "math", dataSource: "SIS", teacher: "Walter Krajcik", course: "Mathematics - Grade 6", term: "2025-2026 School Year", students: "66", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Art - Grade 7 - Koney - 0", grade: "7", subject: "arts and music", dataSource: "SIS", teacher: "Freeman Koney", course: "Art - Grade 7", term: "2025-2026 School Year", students: "30", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Music - Grade 6 - Erdman - 2", grade: "6", subject: "arts and music", dataSource: "SIS", teacher: "Gerardo Erdman", course: "Music - Grade 6", term: "2025-2026 School Year", students: "66", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Physical Education - Grade 7 - Rolfson - 7", grade: "7", subject: "PE and health", dataSource: "SIS", teacher: "Earnest Rolfson", course: "Physical Education - Grade 7", term: "2025-2026 School Year", students: "36", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Mathematics - Grade 8 - Rolfson - 6", grade: "8", subject: "math", dataSource: "SIS", teacher: "Earnest Rolfson", course: "Mathematics - Grade 8", term: "2025-2026 School Year", students: "50", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Science - Grade 6 - Krajcik - 3", grade: "6", subject: "science", dataSource: "SIS", teacher: "Walter Krajcik", course: "Science - Grade 6", term: "2025-2026 School Year", students: "66", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Music - Grade 8 - Reinger - 5", grade: "8", subject: "arts and music", dataSource: "SIS", teacher: "Jalen Reinger", course: "Music - Grade 8", term: "2025-2026 School Year", students: "50", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Art - Grade 7 - Brakus - 4", grade: "7", subject: "arts and music", dataSource: "SIS", teacher: "Lorelne Brakus", course: "Art - Grade 7", term: "2025-2026 School Year", students: "32", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "Science - Grade 6 - Krajcik - 5", grade: "6", subject: "science", dataSource: "SIS", teacher: "Walter Krajcik", course: "Science - Grade 6", term: "2025-2026 School Year", students: "66", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { school: "Treutelside Middle School", name: "World Languages - Grade 8 - Reinger - 8", grade: "8", subject: "language", dataSource: "SIS", teacher: "Jalen Reinger", course: "World Languages - Grade 8", term: "2025-2026 School Year", students: "50", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } }
];

const TERMS_DATA = [
    { name: "2025-2026 School Year", start: "Aug 15, 2025", end: "Jun 15, 2026", cleverId: "697ee1f29df72ba415b49128", created: { date: "Feb 1, 2026", time: "12:17 a.m." }, sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "12:17 a.m." } }
];

const COURSES_DATA = [
    { number: "ART182", name: "Art - Grade 2", cleverId: "697ee1f29df72ba415b49129", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART209", name: "Art - Grade Kindergarten", cleverId: "697ee1f29df72ba415b4912a", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART402", name: "Art - Grade 3", cleverId: "697ee1f29df72ba415b4912b", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART618", name: "Art - Grade 7", cleverId: "697ee1f29df72ba415b4912c", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART721", name: "Art - Grade 7", cleverId: "697ee1f29df72ba415b4912d", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART816", name: "Art - Grade 7", cleverId: "697ee1f29df72ba415b4912e", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART862", name: "Art - Grade 5", cleverId: "697ee1f29df72ba415b4912f", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ART978", name: "Art - Grade Kindergarten", cleverId: "697ee1f29df72ba415b49130", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ENG218", name: "English Language Arts - Grade Kindergarten", cleverId: "697ee1f29df72ba415b49131", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } },
    { number: "ENG226", name: "English Language Arts - Grade 4", cleverId: "697ee1f29df72ba415b49132", sections: "Sections", lastModified: { date: "Feb 1, 2026", time: "10:52 a.m." } }
];

export default function DataBrowser() {
    const [activeTab, setActiveTab] = useState("Schools");
    const [currentPage, setCurrentPage] = useState(1);

    const renderSchoolsTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>Name <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>City <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>State <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Students <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Data Source <Icon name="info" size={14} className={styles.infoIcon} /></div></th>
                        <th><div className={styles.headerCell}>Sections <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Teachers <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Last Modified <Icon name="sort" size={12} /></div></th>
                    </tr>
                </thead>
                <tbody>
                    {SCHOOLS_DATA.map((school, index) => (
                        <tr key={index}>
                            <td className={styles.schoolName}>{school.name}</td>
                            <td>{school.city}</td>
                            <td>{school.state}</td>
                            <td>
                                {school.students.link ? (
                                    <a href="#" className={styles.link}>{school.students.value}</a>
                                ) : (
                                    school.students.value
                                )}
                            </td>
                            <td>{school.dataSource}</td>
                            <td>
                                {school.sections.link ? (
                                    <a href="#" className={styles.link}>{school.sections.value}</a>
                                ) : (
                                    school.sections.value
                                )}
                            </td>
                            <td>
                                {school.teachers.link ? (
                                    <a href="#" className={styles.link}>{school.teachers.value}</a>
                                ) : (
                                    school.teachers.value
                                )}
                            </td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{school.lastModified.date}</span>
                                <span className={styles.modifiedTime}>{school.lastModified.time}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderStudentsTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>School <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>First <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Last <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Gender <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Data Source <Icon name="info" size={14} className={styles.infoIcon} /></div></th>
                        <th><div className={styles.headerCell}>Dob <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Grade <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Last Modified <Icon name="sort" size={12} /></div></th>
                    </tr>
                </thead>
                <tbody>
                    {STUDENTS_DATA.map((student, index) => (
                        <tr key={index}>
                            <td>{student.school}</td>
                            <td>{student.first}</td>
                            <td>{student.last}</td>
                            <td>{student.gender}</td>
                            <td>{student.dataSource}</td>
                            <td>{student.dob}</td>
                            <td>{student.grade}</td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{student.lastModified.date}</span>
                                <span className={styles.modifiedTime}>{student.lastModified.time}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={styles.pagination}>
                <button className={`${styles.pageButton} ${styles.navButton}`}>Prev</button>
                <button className={`${styles.pageButton} ${currentPage === 1 ? styles.activePage : ""}`} onClick={() => setCurrentPage(1)}>1</button>
                <button className={`${styles.pageButton} ${currentPage === 2 ? styles.activePage : ""}`} onClick={() => setCurrentPage(2)}>2</button>
                <button className={`${styles.pageButton} ${currentPage === 3 ? styles.activePage : ""}`} onClick={() => setCurrentPage(3)}>3</button>
                <button className={`${styles.pageButton} ${currentPage === 4 ? styles.activePage : ""}`} onClick={() => setCurrentPage(4)}>4</button>
                <button className={`${styles.pageButton} ${currentPage === 5 ? styles.activePage : ""}`} onClick={() => setCurrentPage(5)}>5</button>
                <span className={styles.pageButton}>...</span>
                <button className={`${styles.pageButton} ${styles.navButton}`}>Next</button>
            </div>
        </div>
    );

    const renderTeachersTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>School <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>First <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Last <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Title <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Data Source <Icon name="info" size={14} className={styles.infoIcon} /></div></th>
                        <th><div className={styles.headerCell}>Email <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Last Modified <Icon name="sort" size={12} /></div></th>
                    </tr>
                </thead>
                <tbody>
                    {TEACHERS_DATA.map((teacher, index) => (
                        <tr key={index}>
                            <td>{teacher.school}</td>
                            <td>{teacher.first}</td>
                            <td>{teacher.last}</td>
                            <td>{teacher.title}</td>
                            <td>{teacher.dataSource}</td>
                            <td className={styles.link}>{teacher.email}</td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{teacher.lastModified.date}</span>
                                <span className={styles.modifiedTime}>{teacher.lastModified.time}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={styles.pagination}>
                <button className={`${styles.pageButton} ${styles.navButton}`}>Prev</button>
                <button className={`${styles.pageButton} ${currentPage === 1 ? styles.activePage : ""}`} onClick={() => setCurrentPage(1)}>1</button>
                <button className={`${styles.pageButton} ${currentPage === 2 ? styles.activePage : ""}`} onClick={() => setCurrentPage(2)}>2</button>
                <button className={`${styles.pageButton} ${styles.navButton}`}>Next</button>
            </div>
        </div>
    );

    const renderStaffTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>First <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Last <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Title <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Email <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Data Source <Icon name="info" size={14} className={styles.infoIcon} /></div></th>
                        <th><div className={styles.headerCell}>Last Modified <Icon name="sort" size={12} /></div></th>
                    </tr>
                </thead>
                <tbody>
                    {STAFF_DATA.map((staff, index) => (
                        <tr key={index}>
                            <td>{staff.first}</td>
                            <td>{staff.last}</td>
                            <td>{staff.title}</td>
                            <td className={styles.link}>{staff.email}</td>
                            <td>{staff.dataSource}</td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{staff.lastModified.date}</span>
                                <span className={styles.modifiedTime}>{staff.lastModified.time}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderSectionsTable = () => (
        <>
            <div className={styles.warningBanner}>
                <Icon name="warning" size={18} className={styles.warningIcon} />
                <span>
                    Sections refer to the individual instance of a course, such as a 2nd period Algebra class taught by a specific teacher. Learn more about <a href="#" className={styles.infoLink}>sections</a>.
                </span>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th><div className={styles.headerCell}>School <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Name <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Grade <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Subject <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Data Source <Icon name="info" size={14} className={styles.infoIcon} /></div></th>
                            <th><div className={styles.headerCell}>Primary Teacher <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Course <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Term <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Students <Icon name="sort" size={12} /></div></th>
                            <th><div className={styles.headerCell}>Last Modified <Icon name="sort" size={12} /></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {SECTIONS_DATA.map((section, index) => (
                            <tr key={index}>
                                <td>{section.school}</td>
                                <td className={styles.schoolName}>{section.name}</td>
                                <td>{section.grade}</td>
                                <td>{section.subject}</td>
                                <td>{section.dataSource}</td>
                                <td>{section.teacher}</td>
                                <td className={styles.link}>{section.course}</td>
                                <td className={styles.link}>{section.term}</td>
                                <td>{section.students}</td>
                                <td className={styles.lastModified}>
                                    <span className={styles.modifiedDate}>{section.lastModified.date}</span>
                                    <span className={styles.modifiedTime}>{section.lastModified.time}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.pagination}>
                    <button className={`${styles.pageButton} ${styles.navButton}`}>Prev</button>
                    <button className={`${styles.pageButton} ${currentPage === 1 ? styles.activePage : ""}`} onClick={() => setCurrentPage(1)}>1</button>
                    <button className={`${styles.pageButton} ${currentPage === 2 ? styles.activePage : ""}`} onClick={() => setCurrentPage(2)}>2</button>
                    <button className={`${styles.pageButton} ${currentPage === 3 ? styles.activePage : ""}`} onClick={() => setCurrentPage(3)}>3</button>
                    <button className={`${styles.pageButton} ${styles.navButton}`}>Next</button>
                </div>
            </div>
        </>
    );

    const renderTermsTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>Name</div></th>
                        <th><div className={styles.headerCell}>Start Date</div></th>
                        <th><div className={styles.headerCell}>End Date</div></th>
                        <th><div className={styles.headerCell}>Clever ID</div></th>
                        <th><div className={styles.headerCell}>Created</div></th>
                        <th><div className={styles.headerCell}>Sections</div></th>
                        <th><div className={styles.headerCell}>Last Modified</div></th>
                    </tr>
                </thead>
                <tbody>
                    {TERMS_DATA.map((term, index) => (
                        <tr key={index}>
                            <td className={styles.schoolName}>{term.name}</td>
                            <td>{term.start}</td>
                            <td>{term.end}</td>
                            <td>{term.cleverId}</td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{term.created.date}</span>
                                <span className={styles.modifiedTime}>{term.created.time}</span>
                            </td>
                            <td className={styles.link}>{term.sections}</td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{term.lastModified.date}</span>
                                <span className={styles.modifiedTime}>{term.lastModified.time}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCoursesTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>Number <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Name <Icon name="sort" size={12} /></div></th>
                        <th><div className={styles.headerCell}>Clever ID</div></th>
                        <th><div className={styles.headerCell}>Sections</div></th>
                        <th><div className={styles.headerCell}>Last Modified <Icon name="sort" size={12} /></div></th>
                    </tr>
                </thead>
                <tbody>
                    {COURSES_DATA.map((course, index) => (
                        <tr key={index}>
                            <td>{course.number}</td>
                            <td className={styles.schoolName}>{course.name}</td>
                            <td>{course.cleverId}</td>
                            <td className={styles.link}>{course.sections}</td>
                            <td className={styles.lastModified}>
                                <span className={styles.modifiedDate}>{course.lastModified.date}</span>
                                <span className={styles.modifiedTime}>{course.lastModified.time}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className={styles.pagination}>
                <button className={`${styles.pageButton} ${styles.navButton}`}>Prev</button>
                <button className={`${styles.pageButton} ${currentPage === 1 ? styles.activePage : ""}`} onClick={() => setCurrentPage(1)}>1</button>
                <button className={`${styles.pageButton} ${currentPage === 2 ? styles.activePage : ""}`} onClick={() => setCurrentPage(2)}>2</button>
                <button className={`${styles.pageButton} ${currentPage === 3 ? styles.activePage : ""}`} onClick={() => setCurrentPage(3)}>3</button>
                <button className={`${styles.pageButton} ${styles.navButton}`}>Next</button>
            </div>
        </div>
    );

    const renderContactsTable = () => (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th><div className={styles.headerCell}>Name</div></th>
                        <th><div className={styles.headerCell}>Email</div></th>
                        <th><div className={styles.headerCell}>Phone</div></th>
                        <th><div className={styles.headerCell}>Students</div></th>
                        <th><div className={styles.headerCell}>Data Source <Icon name="info" size={14} className={styles.infoIcon} /></div></th>
                        <th><div className={styles.headerCell}>Last Modified</div></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontWeight: "500" }}>
                            NO DATA
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.pageTitleRow}>
                <div className={styles.titleSection}>
                    <h1>Data browser</h1>
                    <div className={styles.districtId}>
                        DISTRICT ID:
                        <span className={styles.districtIdValue} id="district-id-val">68759062d10d9a9ab79dbe04</span>
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
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <div className={styles.tableActions}>
                <button className={styles.addFilterButton}>Add Filter</button>
                <div className={styles.countText}>
                    {activeTab === "Schools" && "4 schools found"}
                    {activeTab === "Students" && "5,000 students found"}
                    {activeTab === "Teachers" && "25 teachers found"}
                    {activeTab === "Staff" && "15 staff found"}
                    {activeTab === "Sections" && "50 sections found"}
                    {activeTab === "Terms" && "1 term found"}
                    {activeTab === "Courses" && "50 courses found"}
                    {activeTab === "Contacts" && "0 contacts found"}
                </div>
                {(activeTab === "Staff" || activeTab === "Terms" || activeTab === "Courses" || activeTab === "Contacts") && (
                    <div className={styles.learnMoreStaff}>
                        <Icon name="warning" size={16} className={styles.inlineIcon} /> Learn more about <a href="#" className={styles.infoLink}>{activeTab.toLowerCase()}</a>.
                    </div>
                )}
            </div>

            {activeTab === "Schools" ? renderSchoolsTable() :
                activeTab === "Students" ? renderStudentsTable() :
                    activeTab === "Teachers" ? renderTeachersTable() :
                        activeTab === "Staff" ? renderStaffTable() :
                            activeTab === "Sections" ? renderSectionsTable() :
                                activeTab === "Terms" ? renderTermsTable() :
                                    activeTab === "Courses" ? renderCoursesTable() :
                                        activeTab === "Contacts" ? renderContactsTable() : (
                                            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                                                Tab content for {activeTab} will be implemented soon.
                                            </div>
                                        )}
        </div>
    );
}
