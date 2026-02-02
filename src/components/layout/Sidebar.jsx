"use client";

import { useState } from "react";
import styles from "./Sidebar.module.css";
import { Icons } from "@/components/ui/Icons";
import { useInstructional } from "@/context/InstructionalContext";

const navItems = [
    {
        id: "dashboard",
        label: "Dashboard home",
        icon: "dashboard",
    },
    {
        id: "applications",
        label: "Applications",
        icon: "applicationsGrid",
        children: [
            { id: "my-applications", label: "My applications" },
            { id: "add-applications", label: "Add applications" },
            { id: "lms-connect", label: "LMS Connect" },
            { id: "library-controls", label: "Library controls" },
        ]
    },
    {
        id: "data-sources",
        label: "Data sources",
        icon: "dataSources",
        children: [
            { id: "sis-sync", label: "SIS sync" },
            { id: "custom-data", label: "Custom data" },
        ]
    },
    {
        id: "data-browser",
        label: "Data browser",
        icon: "dataBrowser",
        hasDividerAfter: true,
    },
    {
        id: "user-management",
        label: "User management",
        icon: "userManagement",
        children: [
            { id: "idm", label: "IDM" },
            { id: "license-manager", label: "License manager" },
            { id: "admin-team", label: "Admin team" },
        ]
    },
    {
        id: "authentication",
        label: "Authentication",
        icon: "authentication",
        children: [
            { id: "access-logs", label: "Access logs" },
            { id: "sso-settings", label: "SSO settings" },
            { id: "badges", label: "Badges" },
            { id: "classroom-mfa", label: "Classroom MFA" },
        ]
    },
    {
        id: "portal",
        label: "Portal",
        icon: "portal",
        hasDividerAfter: true,
        children: [
            { id: "organize-district-portal", label: "Organize district portal" },
            { id: "portal-settings", label: "Portal settings" },
            { id: "communication", label: "Communication" },
        ]
    },
    {
        id: "support-tools",
        label: "Support tools",
        icon: "supportTools",
        children: [
            { id: "troubleshoot-login", label: "Troubleshoot login" },
            { id: "troubleshoot-sharing", label: "Troubleshoot sharing" },
            { id: "data-quality", label: "Data quality" },
            { id: "clever-admin-checklist", label: "Clever admin checklist" },
        ]
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: "analytics",
        children: [
            { id: "portal-analytics", label: "Portal analytics" },
            { id: "edtech-analytics", label: "Edtech analytics" },
            { id: "reports", label: "Reports" },
        ]
    },
];

export default function Sidebar({ activeNav, onNavChange }) {
    const { checkNavigationGoal } = useInstructional();
    const [expandedItems, setExpandedItems] = useState(["applications"]);
    const [activeSubItem, setActiveSubItem] = useState("my-applications");

    const toggleExpand = (itemId) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? [] // Close if already open
                : [itemId] // Open this one and close others
        );
    };

    const handleNavClick = (item) => {
        if (item.children) {
            toggleExpand(item.id);
        } else {
            onNavChange(item.id);
            checkNavigationGoal(item.id);
        }
    };

    const handleSubItemClick = (parentId, subItem) => {
        setActiveSubItem(subItem.id);
        onNavChange(subItem.id);
        checkNavigationGoal(subItem.id);
        // Ensure only parent is expanded
        setExpandedItems([parentId]);
    };

    return (
        <aside className={styles.sidebar}>
            {/* Clever Logo */}
            <div className={styles.logo}>
                <span className={styles.logoText}>Clever</span>
            </div>

            {/* District Info */}
            <div className={styles.districtInfo}>
                <span className={styles.districtName}>#DEMO Store Code (Dev) Sand...</span>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isExpanded = expandedItems.includes(item.id);
                    const hasChildren = item.children && item.children.length > 0;
                    const isActive = activeNav === item.id ||
                        (hasChildren && item.children.some(child => child.id === activeSubItem));

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
                                            className={`${styles.submenuItem} ${activeSubItem === child.id ? styles.active : ""}`}
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
