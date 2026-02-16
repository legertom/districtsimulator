"use client";

import { PageHeader, InfoBanner } from "@/components/ui";
import styles from "./EdtechAnalytics.module.css";

export default function EdtechAnalytics() {
    return (
        <div className={styles.page}>
            <PageHeader title="Edtech Analytics" />

            <div className={styles.content}>
                <div className={styles.mainLayout}>
                    <div className={styles.leftPanel}>
                        <h2 className={styles.headline}>
                            Get a holistic view of your district&apos;s edtech usage
                        </h2>
                        <p className={styles.description}>
                            Edtech Analytics shows you all of your district&apos;s app usage in one
                            place down to the school and grade level—whether or not the
                            apps are integrated with Clever. And best of all, it&apos;s free.
                        </p>
                        <p className={styles.description}>
                            Set up our secure browser extension in less than 10 minutes. It
                            won&apos;t impact the student and teacher experience in any way.
                        </p>
                        <button className={styles.getStartedButton}>Get started</button>

                        <InfoBanner variant="info">
                            Check out a <a href="#" className={styles.link}>clickable tutorial</a> of this tool or learn more
                            in our <a href="#" className={styles.link}>Help Center</a>.
                        </InfoBanner>
                    </div>

                    <div className={styles.rightPanel}>
                        <div className={styles.previewCard}>
                            <div className={styles.previewHeader}>
                                <span className={styles.previewBrand}>Clever</span>
                            </div>
                            <div className={styles.previewBody}>
                                <div className={styles.previewTitle}>Edtech Analytics</div>
                                <div className={styles.previewStats}>
                                    <span>79,296 <small>STUDENTS</small></span>
                                    <span>6,014 <small>TEACHERS</small></span>
                                </div>
                                <div className={styles.previewTabs}>
                                    <span className={styles.previewTabActive}>Year</span>
                                    <span>Month</span>
                                    <span>Week</span>
                                </div>
                                <div className={styles.previewMetrics}>
                                    <div className={styles.previewMetric}><strong>266</strong></div>
                                    <div className={styles.previewMetric}><strong>68</strong> District apps</div>
                                    <div className={styles.previewMetric}><strong>75</strong> Teacher apps</div>
                                    <div className={styles.previewMetric}><strong>123</strong> Other apps</div>
                                </div>
                                <table className={styles.previewTable}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Students</th>
                                            <th>Teachers</th>
                                            <th>Active time per user</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Clever</td><td>98%</td><td>83%</td><td>8 minutes</td></tr>
                                        <tr><td>Newsela</td><td>67%</td><td>89%</td><td>158 minutes</td></tr>
                                        <tr><td>CK-12 Foundation</td><td>40%</td><td>22%</td><td>166 minutes</td></tr>
                                        <tr><td>Office 365</td><td>31%</td><td>8%</td><td>96 minutes</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
