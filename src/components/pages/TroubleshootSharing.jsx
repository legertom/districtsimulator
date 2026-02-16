"use client";

import { PageHeader, InfoBanner } from "@/components/ui";
import styles from "./Troubleshoot.module.css";

export default function TroubleshootSharing() {
    return (
        <div className={styles.page}>
            <PageHeader title="Troubleshoot sharing" />

            <div className={styles.content}>
                <div className={styles.mainLayout}>
                    <div className={styles.leftPanel}>
                        <h2 className={styles.sectionTitle}>How to use this tool</h2>
                        <p className={styles.sectionDesc}>
                            Use this tool to check if a user is shared with an app. After you select a user and an app, we&apos;ll
                            show you how they are or are not shared with an app, as well as next steps if needed.
                        </p>

                        <InfoBanner variant="info">
                            Check out a <a href="#" className={styles.link}>clickable tutorial</a> of this tool or learn more in our{" "}
                            <a href="#" className={styles.link}>Help Center</a>.
                        </InfoBanner>

                        <div className={styles.formCard}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Which user do you want to check?</label>
                                    <select className={styles.formSelect}>
                                        <option>Clever ID, SIS ID, name, or email</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Which app do you want to check?</label>
                                    <select className={styles.formSelect}>
                                        <option>Application name</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightPanel}>
                        <div className={styles.detailsCard}>
                            <h3 className={styles.detailsTitle}>Details</h3>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>USER ID</span>
                                <div className={styles.detailValue}>
                                    <span className={styles.dashes}>————————————</span>
                                    <button className={styles.copyBtn}>Copy</button>
                                </div>
                                <a href="#" className={styles.link}>view profile</a>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>APP ID</span>
                                <div className={styles.detailValue}>
                                    <span className={styles.dashes}>————————————</span>
                                    <button className={styles.copyBtn}>Copy</button>
                                </div>
                                <a href="#" className={styles.link}>view profile</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
