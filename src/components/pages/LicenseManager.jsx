"use client";

import { Icons, PageHeader } from "@/components/ui";
import styles from "./LicenseManager.module.css";

export default function LicenseManager() {
    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Google License Manager</h1>
                    <p className={styles.subtitle}>
                        Automatically assign and remove Google Workspace for Education licenses
                    </p>
                    <div className={styles.buttons}>
                        <button className={styles.primaryButton}>Get started</button>
                        <button className={styles.secondaryButton}>Learn more</button>
                    </div>
                </div>
                <div className={styles.priceTag}>
                    <div className={styles.priceText}>No additional</div>
                    <div className={styles.priceText}>cost</div>
                </div>
            </div>

            {/* Value Props Section */}
            <div className={styles.valueProps}>
                <h2 className={styles.sectionTitle}>Automated Google licensing, in one place</h2>
                <div className={styles.propsGrid}>
                    <div className={styles.propCard}>
                        <div className={styles.propIcon}>
                            {Icons.eye}
                        </div>
                        <h3 className={styles.propTitle}>Preview</h3>
                        <p className={styles.propDescription}>
                            Easily preview user licenses and your nightly sync status in one place
                        </p>
                    </div>
                    <div className={styles.propCard}>
                        <div className={styles.propIcon}>
                            {Icons.userManagement}
                        </div>
                        <h3 className={styles.propTitle}>Assign</h3>
                        <p className={styles.propDescription}>
                            Automatically assign licenses to all users in specified OUs
                        </p>
                    </div>
                    <div className={styles.propCard}>
                        <div className={styles.propIcon}>
                            {Icons.xCircle}
                        </div>
                        <h3 className={styles.propTitle}>Remove</h3>
                        <p className={styles.propDescription}>
                            Automatically remove licenses from users that are suspended or removed from an OU
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className={styles.featureSection}>
                <div className={styles.featureImage}>
                    <div className={styles.imagePlaceholder}>
                        <div className={styles.mockupHeader}>
                            <span className={styles.cleverBrand}>Clever</span>
                            <span className={styles.mockupTitle}>Clever IDM</span>
                        </div>
                        <div className={styles.mockupContent}>
                            <div className={styles.mockupLabel}>Select Student Organizational Units</div>
                            <div className={styles.mockupTree}>
                                <div className={styles.treeItem}>○  Your Google Org Units  <span className={styles.refreshLink}>⟳ Refresh</span></div>
                                <div className={styles.treeItem}>  ○  + Students</div>
                                <div className={styles.treeItem}>    ○  - Clever Academy</div>
                                <div className={`${styles.treeItem} ${styles.treeItemActive}`}>      ●  Grade 1 Students</div>
                                <div className={styles.treeItem}>      ○  Grade 2 Students</div>
                                <div className={styles.treeItem}>      ○  Grade 3 Students</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.featureContent}>
                    <h3 className={styles.featureTitle}>Hands-off identity automation</h3>
                    <p className={styles.featureDescription}>
                        Clever IDM helps manage your OUs automatically, so that license assignments are kept up to date across your internal systems and Google Workspace.
                    </p>
                    <p className={styles.featureDescription}>
                        Plus, get automated Google account creation and archival, giving you even more time back.
                    </p>
                    <a href="#" className={styles.learnMoreLink}>
                        {Icons.externalLink}
                        Learn more about Clever IDM
                    </a>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className={styles.bottomCta}>
                <h2 className={styles.ctaTitle}>Interested in other ways Google + Clever work well together?</h2>
                <div className={styles.logoRow}>
                    <div className={styles.googleLogo}>G</div>
                    <span className={styles.plusSign}>+</span>
                    <div className={styles.cleverLogo}>C</div>
                </div>
            </div>
        </div>
    );
}
