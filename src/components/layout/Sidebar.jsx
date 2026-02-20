"use client";

import { useEffect, useMemo, useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { useInstructional } from "@/context/InstructionalContext";
import styles from "./Sidebar.module.css";
import { Icons } from "@/components/ui/Icons";

export default function Sidebar({ activeNav, onNavChange }) {
    const { scenario } = useScenario();
    const { navItems, districtInfo } = scenario.sidebar;
    const { currentStep, showHint, coachMarksEnabled } = useInstructional();

    const parentByChild = useMemo(() => {
        const map = new Map();

        navItems.forEach((item) => {
            item.children?.forEach((child) => {
                map.set(child.id, item.id);
            });
        });

        return map;
    }, [navItems]);

    const [expandedItem, setExpandedItem] = useState(() => {
        const parentId = parentByChild.get(activeNav);
        return parentId ?? "applications";
    });

    // Auto-expand parent section when a hint targets a collapsed child nav item
    useEffect(() => {
        if (!coachMarksEnabled || !showHint || !currentStep?.hint?.target) return;

        const hintTarget = currentStep.hint.target;
        const parentId = parentByChild.get(hintTarget);
        if (parentId) {
            const timer = setTimeout(() => setExpandedItem(parentId), 0);
            return () => clearTimeout(timer);
        }
    }, [currentStep, showHint, coachMarksEnabled, parentByChild]);

    useEffect(() => {
        const parentId = parentByChild.get(activeNav);
        if (parentId) {
            const timer = setTimeout(() => setExpandedItem(parentId), 0);
            return () => clearTimeout(timer);
        }
    }, [activeNav, parentByChild]);

    const openItemId = expandedItem;

    const toggleExpand = (itemId) => {
        setExpandedItem((prev) => (prev === itemId ? "" : itemId));
    };

    const handleNavClick = (item) => {
        if (item.children) {
            toggleExpand(item.id);
        } else {
            onNavChange(item.id);
        }
    };

    const handleSubItemClick = (parentId, subItem) => {
        onNavChange(subItem.id);
        // Ensure only parent is expanded
        setExpandedItem(parentId);
    };

    return (
        <aside className={styles.sidebar}>
            {/* Clever Logo */}
            <div className={styles.logo}>
                <span className={styles.logoText}>Clever</span>
            </div>

            {/* District Info */}
            <div className={styles.districtInfo}>
                <span className={styles.districtName}>{districtInfo.name}</span>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isExpanded = openItemId === item.id;
                    const hasChildren = item.children && item.children.length > 0;
                    const isActive = activeNav === item.id ||
                        (hasChildren && item.children.some((child) => child.id === activeNav));

                    return (
                        <div key={item.id} className={styles.navGroup}>
                            <button
                                className={`${styles.navItem} ${isExpanded ? styles.expanded : ""}`}
                                onClick={() => handleNavClick(item)}
                                data-nav-id={item.id}
                            >
                                <span className={styles.navIcon}>
                                    {Icons[item.icon]}
                                </span>
                                <span className={styles.navLabel}>{item.label}</span>
                                {hasChildren && (
                                    <span className={styles.chevron}>
                                        {isExpanded ? Icons.chevronUp : Icons.chevronDown}
                                    </span>
                                )}
                            </button>

                            {/* Submenu */}
                            {hasChildren && isExpanded && (
                                <div className={styles.submenu}>
                                    {item.children.map((child) => (
                                        <button
                                            key={child.id}
                                            className={`${styles.submenuItem} ${activeNav === child.id ? styles.active : ""}`}
                                            onClick={() => handleSubItemClick(item.id, child)}
                                            data-nav-id={child.id}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* Divider after certain items */}
                            {item.hasDividerAfter && <div className={styles.divider} />}
                        </div>
                    );
                })}
            </nav>

            {/* Training & Support */}
            <div className={styles.bottomSection}>
                <button className={styles.navItem}>
                    <span className={styles.navIcon}>
                        {Icons.trainingSupport}
                    </span>
                    <span className={styles.navLabel}>Training & Support</span>
                </button>
            </div>
        </aside>
    );
}
