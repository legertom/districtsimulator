"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { buildDashboardRoute } from "@/lib/routing";
import styles from "./ProfilePage.module.css";

/**
 * Hero header for profile pages — replicates real Clever profile layout.
 *
 * @param {{
 *   name: string,
 *   cleverId: string,
 *   metaChips: Array<{ label?: string, value: string, isLink?: boolean, isBadge?: boolean, badgeGreen?: boolean }>,
 *   email: string,
 *   stats: Array<{ label: string, value: string }> | null,
 *   actions: Array<{ label: string, dividerBefore?: boolean }>,
 *   backLabel?: string,
 * }} props
 */
export default function ProfileHero({ name, cleverId, metaChips = [], email, stats, actions = [], backLabel = "Data Browser" }) {
    const [showActions, setShowActions] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!showActions) return;
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowActions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showActions]);

    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0]?.toUpperCase())
        .slice(0, 2)
        .join("");

    return (
        <>
            {/* Back link sits above the hero */}
            <div style={{ padding: "12px 32px 0", background: "white" }}>
                <Link href={buildDashboardRoute("data-browser")} className={styles.backLink}>
                    ← Back to {backLabel}
                </Link>
            </div>

            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    {/* Avatar */}
                    <div className={styles.avatar}>{initials}</div>

                    {/* Info */}
                    <div className={styles.heroInfo}>
                        <h1 className={styles.heroName}>{name}</h1>
                        <p className={styles.heroSubtext}>
                            Clever User ID: {cleverId.substring(0, 12)}...
                        </p>
                        <div className={styles.heroMeta}>
                            {metaChips.map((chip, i) => {
                                if (chip.isBadge) {
                                    return (
                                        <span
                                            key={i}
                                            className={`${styles.heroBadge} ${chip.badgeGreen ? styles.heroBadgeGreen : ""}`}
                                        >
                                            {chip.value}
                                        </span>
                                    );
                                }
                                if (chip.isLink) {
                                    return (
                                        <Link
                                            key={i}
                                            href={buildDashboardRoute("data-browser")}
                                            className={styles.heroLink}
                                        >
                                            {chip.value}
                                        </Link>
                                    );
                                }
                                return (
                                    <span key={i} className={styles.heroEmail}>
                                        {chip.value}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions dropdown */}
                    {actions.length > 0 && (
                        <div className={styles.heroActions} ref={dropdownRef} style={{ position: "relative" }}>
                            <button
                                className={styles.actionsButton}
                                onClick={() => setShowActions((prev) => !prev)}
                            >
                                Actions ▾
                            </button>
                            {showActions && (
                                <div className={styles.actionsDropdown}>
                                    {actions.map((action, i) => (
                                        <div key={i}>
                                            {action.dividerBefore && <div className={styles.actionsDropdownDivider} />}
                                            <button
                                                className={styles.actionsDropdownItem}
                                                onClick={() => setShowActions(false)}
                                            >
                                                {action.label}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats bar */}
            {stats && stats.length > 0 && (
                <div className={styles.statsBar}>
                    {stats.map((stat, i) => (
                        <div key={i} className={styles.statItem}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
