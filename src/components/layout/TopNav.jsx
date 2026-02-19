"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { useSession, signOut } from "next-auth/react";
import styles from "./TopNav.module.css";
import { Icon } from "@/components/ui/Icons";

export default function TopNav({ onNavChange, onSwitchToPortal }) {
    const { scenario } = useScenario();
    const { data: session } = useSession();
    const { searchPlaceholder, userInfo: defaultUserInfo } = scenario.topNav;
    const installedApplications = useMemo(() => {
        const apps = scenario.applications?.myApplications;
        return Array.isArray(apps) ? apps : [];
    }, [scenario.applications]);

    // Use session data if available (real login), otherwise fall back to scenario default (simulated env)
    const userInfo = session?.user ? {
        name: session.user.name,
        firstName: session.user.name.split(' ')[0], // Simple split for display
        email: session.user.email,
        role: session.user.role || defaultUserInfo.role
    } : defaultUserInfo;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const searchRef = useRef(null);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredApplications = useMemo(() => {
        if (!normalizedQuery) {
            return [];
        }

        return installedApplications
            .filter((app) => app.name.toLowerCase().includes(normalizedQuery))
            .slice(0, 8);
    }, [installedApplications, normalizedQuery]);
    const showSearchResults = isSearchOpen && normalizedQuery.length > 0;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }

            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
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
    };

    const handleSearchChange = (event) => {
        const nextValue = event.target.value;
        setSearchQuery(nextValue);
        setIsSearchOpen(nextValue.trim().length > 0);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setIsSearchOpen(false);
    };

    const handleSelectApplication = (application) => {
        onNavChange?.("my-applications", { applicationId: application.id });
        clearSearch();
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === "Escape") {
            setIsSearchOpen(false);
            return;
        }

        if (event.key === "Enter" && filteredApplications.length > 0) {
            event.preventDefault();
            handleSelectApplication(filteredApplications[0]);
        }
    };

    return (
        <header className={styles.topnav}>
            {/* Search */}
            <div className={styles.searchContainer} ref={searchRef}>
                <div className={`${styles.search} ${showSearchResults ? styles.searchActive : ""}`}>
                    <span className={styles.searchIcon}>
                        <Icon name="search" size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => {
                            if (searchQuery.trim().length > 0) {
                                setIsSearchOpen(true);
                            }
                        }}
                        aria-label="Search installed applications"
                    />

                    {searchQuery ? (
                        <button
                            type="button"
                            className={styles.clearSearchButton}
                            onClick={clearSearch}
                            aria-label="Clear search"
                        >
                            <Icon name="xCircle" size={18} />
                        </button>
                    ) : null}
                </div>

                {showSearchResults ? (
                    <div className={styles.searchResults} role="listbox" aria-label="Installed applications">
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map((application) => (
                                <button
                                    key={application.id}
                                    type="button"
                                    className={styles.searchResultItem}
                                    onClick={() => handleSelectApplication(application)}
                                >
                                    <span
                                        className={styles.resultIcon}
                                        style={{
                                            background: application.iconBackground ?? application.iconColor ?? "var(--gray-200)",
                                            color: application.iconTextColor ?? "#ffffff",
                                        }}
                                    >
                                        {application.icon}
                                    </span>

                                    <span className={styles.resultText}>
                                        <span className={styles.resultName}>{application.name}</span>
                                        <span className={styles.resultMeta}>Installed application</span>
                                    </span>

                                    <span className={styles.resultChevron}>
                                        <Icon name="chevronRight" size={14} />
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className={styles.searchNoResults}>No installed applications found.</div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Right side */}
            <div className={styles.actions} ref={userDropdownRef}>
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
