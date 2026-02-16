"use client";

import { useState, useRef, useEffect } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { useSession, signOut } from "next-auth/react";
import styles from "./TopNav.module.css";
import { Icon } from "@/components/ui/Icons";

export default function TopNav({ onNavChange, onSwitchToPortal }) {
    const { scenario } = useScenario();
    const { data: session } = useSession();
    const { searchPlaceholder, userInfo: defaultUserInfo } = scenario.topNav;

    // Use session data if available (real login), otherwise fall back to scenario default (simulated env)
    const userInfo = session?.user ? {
        name: session.user.name,
        firstName: session.user.name.split(' ')[0], // Simple split for display
        email: session.user.email,
        role: session.user.role || defaultUserInfo.role
    } : defaultUserInfo;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        onNavChange?.("profile");
        setIsDropdownOpen(false);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    }

    return (
        <header className={styles.topnav}>
            {/* Search */}
            <div className={styles.search}>
                <span className={styles.searchIcon}>
                    <Icon name="search" size={16} />
                </span>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className={styles.searchInput}
                />
            </div>

            {/* Right side */}
            <div className={styles.actions} ref={dropdownRef}>
                {/* Portal Link */}
                <button className={styles.portalLink} onClick={onSwitchToPortal}>
                    <span className={styles.portalIcon}>
                        <Icon name="applicationsGrid" size={16} />
                    </span>
                    <span>Portal</span>
                </button>

                {/* User dropdown */}
                <div className={styles.userDropdownContainer}>
                    <button
                        className={`${styles.userButton} ${isDropdownOpen ? styles.userButtonActive : ""}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className={styles.userName}>{userInfo.name}</span>
                        <span className={styles.chevron}>
                            <Icon name={isDropdownOpen ? "chevronUp" : "chevronDown"} size={10} />
                        </span>
                    </button>

                    {isDropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <div className={styles.dropdownHeader}>
                                <h2 className={styles.hiUser}>Hi, {userInfo.firstName}</h2>
                                <div className={styles.userRole}>{userInfo.role}</div>
                                <div className={styles.userEmail}>{userInfo.email}</div>
                            </div>
                            <div className={styles.dropdownDivider} />
                            <div className={styles.dropdownItems}>
                                <button className={styles.dropdownItem} onClick={handleProfileClick}>
                                    <Icon name="profile" size={18} className={styles.itemIcon} />
                                    <span>Profile</span>
                                </button>
                                <button className={styles.dropdownItem} onClick={handleLogout}>
                                    <Icon name="logout" size={18} className={styles.itemIcon} />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
