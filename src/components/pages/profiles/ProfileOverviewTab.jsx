"use client";

import styles from "./ProfilePage.module.css";

/**
 * Shared Overview tab for Student and Teacher profiles.
 * Shows: Sections table, Apps card, Logins chart placeholder.
 *
 * @param {{ sections: Array, sectionColumns: Array<{ key: string, label: string }> }} props
 */
export default function ProfileOverviewTab({ sections = [], sectionColumns = [] }) {
    return (
        <div className={styles.content}>
            {/* Sections table */}
            <div className={styles.card}>
                <h2 className={styles.cardHeader}>Sections ({sections.length})</h2>
                {sections.length > 0 ? (
                    <table className={styles.cardTable}>
                        <thead>
                            <tr>
                                {sectionColumns.map((col) => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((s) => (
                                <tr key={s.id}>
                                    {sectionColumns.map((col) => (
                                        <td key={col.key}>{s[col.key] || "—"}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className={styles.emptyState}>No sections found.</p>
                )}
            </div>

            {/* Apps card */}
            <div className={styles.placeholderCard}>
                <h3>Apps</h3>
                <div className={styles.placeholderEmpty}>
                    No apps shared with this user
                </div>
            </div>

            {/* Logins chart placeholder */}
            <div className={styles.placeholderCard}>
                <h3>Logins to Clever</h3>
                <div className={styles.placeholderEmpty}>
                    No login data available
                </div>
            </div>
        </div>
    );
}
