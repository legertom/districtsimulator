"use client";

import styles from "./ClassroomMFA.module.css";

export default function ClassroomMFA() {
    return (
        <div className={styles.page}>


            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Classroom MFA</h1>
                    <p className={styles.heroSubtitle}>
                        Secures access to integrated applications for students and teachers.
                    </p>
                    <div className={styles.heroActions}>
                        <button className={styles.primaryBtn}>Explore settings</button>
                        <button className={styles.secondaryBtn}>Purchase</button>
                    </div>
                    <p className={styles.setupLink}>
                        Need more setup info? <a href="#">Get configuration guide</a>
                    </p>
                </div>
                <div className={styles.pricingCard}>
                    <div className={styles.price}>
                        $1.50
                    </div>
                    <div className={styles.priceUnit}>per user per year</div>
                </div>
            </div>

            <div className={styles.featureSection}>
                <h2 className={styles.sectionTitle}>MFA built for K-12, no device necessary</h2>
                <p className={styles.sectionSubtitle}>
                    Including robust teacher support and troubleshooting tools
                </p>

                <div className={styles.featureRow}>
                    <div className={styles.videoPlaceholder}>
                        <div className={styles.playButton}>▶</div>
                        <div className={styles.videoTime}>0:14</div>
                    </div>
                    <div className={styles.featureText}>
                        <h3>Picture MFA</h3>
                        <ul>
                            <li>A simple, secure method for your <strong>youngest students</strong>.</li>
                            <li>Built-in teacher tools if students forget their pictures.</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.featureRowReverse}>
                    <div className={styles.videoPlaceholder}>
                        <div className={styles.playButton}>▶</div>
                        <div className={styles.videoTime}>0:11</div>
                    </div>
                    <div className={styles.featureText}>
                        <h3>Badge MFA</h3>
                        <ul>
                            <li>An easy, safe method using a device&apos;s webcam that doesn&apos;t require a phone.</li>
                            <li>Badges <strong>printable</strong> by district admins or teachers for easy distribution.</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomCta}>
                    <h3>Ready to get started?</h3>
                    <button className={styles.contactBtn}>Contact a specialist</button>
                </div>
            </div>
        </div>
    );
}
