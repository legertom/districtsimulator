"use client";

import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { PageHeader, Icons } from "@/components/ui";
import styles from "./OrganizeDistrictPortal.module.css";

export default function OrganizeDistrictPortal() {
    const { scenario } = useScenario();
    const apps = scenario.applications.myApplications;

    return (
        <div className={styles.page}>
            <PageHeader title="Organize District Portal" />

            <div className={styles.content}>
                <p className={styles.description}>
                    Organize and edit the Portal for the users in your district. All resources appear in this view for you,
                    but an end user&apos;s experience is determined by the specific resources scoped to that individual.
                </p>

                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <button className={styles.outlineButton}>
                            Add to the Portal
                            {Icons.chevronDown}
                        </button>
                        <button className={styles.outlineButton}>
                            Preview Portal as
                            {Icons.chevronDown}
                        </button>
                    </div>
                    <div className={styles.toolbarRight}>
                        <button className={styles.cancelButton}>Cancel</button>
                        <button className={styles.publishButton}>Publish changes</button>
                    </div>
                </div>

                <div className={styles.mainLayout}>
                    <div className={styles.appsSection}>
                        <h3 className={styles.sectionLabel}>More Apps</h3>
                        <div className={styles.appsGrid}>
                            {apps.map((app) => (
                                <div key={app.id} className={styles.appCard}>
                                    <div className={styles.cardMenu}>
                                        {Icons.moreVertical}
                                    </div>
                                    <div
                                        className={styles.appCardIcon}
                                        style={{ backgroundColor: app.iconColor }}
                                    >
                                        {app.icon}
                                    </div>
                                    <span className={styles.appCardName}>{app.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.dividerVertical}>
                        <div className={styles.arrowCircle}>
                            {Icons.chevronRight}
                        </div>
                    </div>

                    <div className={styles.categoriesSection}>
                        <div className={styles.categoriesHeader}>
                            <h3 className={styles.categoriesTitle}>Arrange categories</h3>
                            <button className={styles.sortButton}>
                                Sort alphabetically
                                {Icons.chevronDown}
                            </button>
                        </div>
                        <p className={styles.categoriesDesc}>
                            Drag categories to reorder them. Use the trash can to delete categories. Changes will apply for all portal users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
