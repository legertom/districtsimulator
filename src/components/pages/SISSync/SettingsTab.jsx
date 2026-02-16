"use client";

/**
 * Settings tab content for the SIS Sync page.
 * Contains SFTP settings, SSH keys, sync mappings, school year dates,
 * schedule sync pause, and sync hold thresholds.
 */

import styles from "../SISSync.module.css";

// Threshold types for the sync hold thresholds grid
const thresholdTypes = ["Schools", "Students", "Teachers", "Sections", "Contacts", "Terms", "Staff", "District Admins"];

export function SettingsTab() {
    return (
        <div className={styles.settingsContainer}>
            <div className={styles.infoBannerBlue}>
                <span><strong>You can upload roster data securely via SFTP using the instructions below.</strong><br />
                    To change your district&apos;s SFTP credentials, contact <a href="#">Clever support</a>.</span>
            </div>

            {/* SFTP Settings */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>SFTP Settings</h2>
                <div className={styles.formGroup}>
                    <label>SFTP Upload URL</label>
                    <div className={styles.inputWithCopy}>
                        <input type="text" value="sftp.clever.com" readOnly />
                        <button className={styles.copyBtn}>Copy</button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>SFTP Username</label>
                    <div className={styles.inputWithCopy}>
                        <input type="text" value="clever-demo-store-code" readOnly />
                        <button className={styles.copyBtn}>Copy</button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>SFTP Password</label>
                    <div className={styles.inputWithCopy}>
                        <input type="password" value="password123" readOnly />
                        <button className={styles.copyBtn}>Copy</button>
                        <button className={styles.viewBtn}>👁</button>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>SFTP Port</label>
                    <div className={styles.inputWithCopy}>
                        <input type="text" value="22" readOnly />
                        <button className={styles.copyBtn}>Copy</button>
                    </div>
                </div>
                <div className={styles.infoBox}>
                    ⓘ Learn more about <a href="#">how to access your SFTP directory with your credentials</a>.
                </div>
            </div>

            {/* SSH Keys */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>SSH Keys</h2>
                <p>No keys added</p>
                <a href="#" className={styles.addLink}>Add New Key</a>
            </div>

            {/* Sync Mappings */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Sync Mappings</h2>
                <p>Clever automatically tries to map your data values to valid values within your SIS data. To view incorrect values and add manual mappings, please visit <a href="#">Field mappings</a>.
                </p>
                <div className={styles.infoBox}>
                    ⓘ Learn more about <a href="#">Field mappings</a>.
                </div>
            </div>

            {/* School Year Dates */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>School Year Dates</h2>
                <p className={styles.sectionDesc}>Let us know when a new school year begins so we can console you on the lost summer. These dates are for informational purposes only, and won&apos;t affect your sync formatting / rollover.</p>

                <div className={styles.dateRow}>
                    <div className={styles.formGroup}>
                        <label>Start Date</label>
                        <input type="date" className={styles.dateInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>End Date</label>
                        <input type="date" className={styles.dateInput} />
                    </div>
                </div>
                <button className={styles.secondaryBtn}>Update</button>
            </div>

            {/* Schedule Sync Pause */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Schedule Sync Pause</h2>
                <div className={styles.infoBannerBlue}>
                    <span className={styles.bannerIcon}>ℹ</span>
                    <div>
                        <strong>Pausing your sync</strong> allows you to make changes in your SIS without modifying the data in Clever. Many districts use this feature over the summer so that students and teachers can continue to access their learning applications without interruption.<br /><br />
                        Clever recommends the following dates when pausing your sync:
                        <ul>
                            <li><strong>Pause Start Date:</strong> the last day of the spring term. This will ensure data from the current school year is not deleted.</li>
                            <li><strong>Pause End Date:</strong> the day before your district starts sending data...</li>
                        </ul>
                    </div>
                </div>
                <p>Your district currently has no pause scheduled.</p>
                <div className={styles.dateRow}>
                    <div className={styles.formGroup}>
                        <label>Pause Start Date</label>
                        <input type="date" className={styles.dateInput} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Pause End Date</label>
                        <input type="date" className={styles.dateInput} />
                    </div>
                </div>
                <div className={styles.btnRow}>
                    <button className={styles.secondaryBtn}>Update</button>
                    <button className={styles.linkBtn}>Clear</button>
                </div>
            </div>

            {/* Sync Hold Thresholds */}
            <div className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Sync Hold Thresholds</h2>
                <p className={styles.sectionDesc}>When your district&apos;s most recent attempt will change a significant amount of data in Clever, our system initiates an automatic sync hold. This hold prevents the changes from processing... </p>

                <div className={styles.infoBox}>
                    ⓘ To learn more about sync hold thresholds, see our guide in our <a href="#">Help Center</a>.
                </div>

                <div className={styles.thresholdGrid}>
                    {thresholdTypes.map(type => (
                        <div key={type} className={styles.thresholdCard}>
                            <h3>Hold changes to <strong>{type.toUpperCase()}</strong> if:</h3>
                            <div className={styles.thresholdOption}>
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    more than <input type="text" defaultValue="25" className={styles.percentInput} /> % are updated
                                </label>
                            </div>
                            <div className={styles.thresholdOption}>
                                <label>
                                    <input type="checkbox" defaultChecked />
                                    more than <input type="text" defaultValue="10" className={styles.percentInput} /> % are deleted
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.footerActions}>
                <button className={styles.saveBtn} disabled>Save Changes</button>
                <button className={styles.revertBtn}>Revert to Default Thresholds</button>
            </div>

        </div>
    );
}

export default SettingsTab;
