"use client";

import React, { useState, useRef, useEffect } from "react";
import { PageHeader, Tabs, DataTable, Modal, Pagination } from "@/components/ui";
import { useInstructional } from "@/context/InstructionalContext";
import { useDataVariant } from "@/context/DataVariantContext";
import styles from "./IDM.module.css";

/* ── Inline SVG helpers ─────────────────────── */

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="white" stroke="#e5e7eb" />
        <path d="M18 12.2A6 6 0 0 0 12.1 6l-.1.01V12h6z" fill="#4285f4" />
        <path d="M12 6a6 6 0 0 0-4.2 10.3L12 12V6z" fill="#ea4335" />
        <path d="M7.8 16.3A6 6 0 0 0 12 18v-6L7.8 16.3z" fill="#fbbc05" />
        <path d="M12 18a6 6 0 0 0 6-5.8H12V18z" fill="#34a853" />
    </svg>
);

const PersonIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: "middle" }}>
        <circle cx="7" cy="4" r="3" stroke="#6b7280" strokeWidth="1.5" fill="none" />
        <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4, verticalAlign: "middle" }}>
        <path d="M7 2v7M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const ChevronDown = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const ChevronUp = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 8l3-3 3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 6l2.5 2.5L9 4" stroke="white" strokeWidth="2" />
    </svg>
);

const WarningIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 1l5 10H1L6 1z" fill="white" />
    </svg>
);

const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ verticalAlign: "middle" }}>
        <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M10 4V2.5A1.5 1.5 0 008.5 1h-6A1.5 1.5 0 001 2.5v6A1.5 1.5 0 002.5 10H4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
);

/* ── Component ──────────────────────────────── */

export default function IDM({ onEditProvisioning }) {
    const { checkActionGoal } = useInstructional();
    const { resolvedData } = useDataVariant();
    const idm = resolvedData?.idm ?? {};
    const destinations = idm.destinations ?? [];
    const syncHistory = idm.syncHistory ?? [];
    const allEvents = idm.events ?? [];
    const [activeTab, setActiveTab] = useState("tasks");

    // Add Destination dropdown + modal
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const destDropdownRef = useRef(null);

    // Pause/Resume sync
    const [isPaused, setIsPaused] = useState(false);
    const [showPauseModal, setShowPauseModal] = useState(false);

    // Toast notifications
    const [toast, setToast] = useState(null);

    // Exports
    const [sftpEnabled, setSftpEnabled] = useState(false);

    // Events tab
    const [eventsPage, setEventsPage] = useState(1);
    const [expandedEventRows, setExpandedEventRows] = useState(new Set());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);
    const filterDropdownRef = useRef(null);

    // Modified data modal
    const [modifiedDataModal, setModifiedDataModal] = useState(null);

    // Clipboard feedback
    const [copiedField, setCopiedField] = useState(null);

    const EVENTS_PER_PAGE = 10;

    const tabs = [
        { id: "tasks", label: "Tasks" },
        { id: "sync-history", label: "Sync History" },
        { id: "exports", label: "Exports" },
        { id: "events", label: "Events" },
    ];

    /* ── Close dropdowns on outside click ───── */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destDropdownRef.current && !destDropdownRef.current.contains(event.target)) {
                setShowDestDropdown(false);
            }
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ── Toast auto-dismiss ─────────────────── */
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    /* ── Clipboard helper ───────────────────── */
    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard?.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 1500);
    };

    /* ── Add Destination handlers ────────────── */
    const handleDestinationSelect = (dest) => {
        setSelectedDestination(dest);
        setShowDestDropdown(false);
        setShowAddModal(true);
    };

    const handleConfirmAddDestination = () => {
        setShowAddModal(false);
        setToast(`${selectedDestination} has been added as a destination.`);
        setSelectedDestination(null);
    };

    /* ── Pause/Resume handlers ──────────────── */
    const handlePauseClick = () => {
        if (isPaused) {
            setIsPaused(false);
        } else {
            setShowPauseModal(true);
        }
    };

    const handleConfirmPause = () => {
        setIsPaused(true);
        setShowPauseModal(false);
    };

    /* ── Edit Google Provisioning ──────────── */
    const handleEditProvisioning = () => {
        onEditProvisioning?.();
    };

    /* ── Download helpers ────────────────────── */
    const handleDownloadUserEmails = () => {
        setToast("Download started — students.csv and teachers_and_staff.csv");
    };

    const handleDownloadLog = () => {
        setToast("Downloading sync log...");
    };

    const handleDownloadRecentAccounts = () => {
        setToast("Download started — recent_accounts.csv");
    };

    /* ── Events filtering & pagination ──────── */
    const filteredEvents = allEvents.filter((ev) => {
        if (startDate) {
            const evDate = new Date(ev.date.replace(";", ""));
            const filterStart = new Date(startDate);
            if (evDate < filterStart) return false;
        }
        if (endDate) {
            const evDate = new Date(ev.date.replace(";", ""));
            const filterEnd = new Date(endDate);
            filterEnd.setHours(23, 59, 59);
            if (evDate > filterEnd) return false;
        }
        for (const filter of activeFilters) {
            if (filter.field === "Event type" && ev.event !== filter.value) return false;
            if (filter.field === "Destination" && ev.destination !== filter.value) return false;
            if (filter.field === "User" && !ev.user.toLowerCase().includes(filter.value.toLowerCase())) return false;
        }
        return true;
    });

    const totalEventsPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
    const paginatedEvents = filteredEvents.slice(
        (eventsPage - 1) * EVENTS_PER_PAGE,
        eventsPage * EVENTS_PER_PAGE
    );

    const toggleEventRow = (globalIndex) => {
        setExpandedEventRows((prev) => {
            const next = new Set(prev);
            if (next.has(globalIndex)) {
                next.delete(globalIndex);
            } else {
                next.add(globalIndex);
            }
            return next;
        });
    };

    const addFilter = (field) => {
        setShowFilterDropdown(false);
        const value = field === "Event type" ? "Created" : field === "Destination" ? "Google Workspace" : "";
        setActiveFilters((prev) => [...prev, { field, value }]);
        setEventsPage(1);
    };

    const removeFilter = (index) => {
        setActiveFilters((prev) => prev.filter((_, i) => i !== index));
        setEventsPage(1);
    };

    /* ── Sync History columns for DataTable ── */
    const syncHistoryColumns = [
        {
            key: "destination",
            header: "Destination",
            render: () => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <GoogleIcon /> Google
                </span>
            ),
        },
        { key: "dateTime", header: "Date and Time" },
        { key: "creates", header: "Creates" },
        { key: "matches", header: "Matches" },
        { key: "updates", header: "Updates" },
        { key: "archives", header: "Archives" },
        { key: "issues", header: "Issues" },
        {
            key: "actions",
            header: "Actions",
            render: () => (
                <button className={styles.logLink} onClick={handleDownloadLog}>
                    <DownloadIcon /> Log
                </button>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <PageHeader
                title="Clever IDM"
                subtitle="Destinations are services to which Clever can provision user accounts."
            />

            <div className={styles.content}>
                {/* ── Add Destination Dropdown ────────── */}
                <div className={styles.destDropdownContainer} ref={destDropdownRef}>
                    <button
                        className={styles.addDestinationBtn}
                        onClick={() => setShowDestDropdown(!showDestDropdown)}
                    >
                        Add new destination
                        <span style={{ marginLeft: 6 }}>
                            {showDestDropdown ? <ChevronUp /> : <ChevronDown />}
                        </span>
                    </button>
                    {showDestDropdown && (
                        <div className={styles.destDropdownMenu}>
                            {destinations.map((dest) => (
                                <button
                                    key={dest}
                                    className={styles.destDropdownItem}
                                    onClick={() => handleDestinationSelect(dest)}
                                >
                                    {dest}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Google Workspace Card ───────────── */}
                <div className={styles.providerCard} data-instruction-target="google-provider-card">
                    <div className={styles.providerHeader}>
                        <div className={styles.providerName}>
                            <GoogleIcon />
                            <span>Google Workspace</span>
                        </div>
                        <div className={styles.providerBadges}>
                            <span className={styles.activeBadge}>
                                <CheckIcon /> Active
                            </span>
                            <span className={styles.issueBadge}>
                                <WarningIcon /> Issue
                            </span>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Create</span>
                            <span className={styles.statValue}>0</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Update</span>
                            <span className={styles.statValue}>0</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Archive</span>
                            <span className={styles.statValue}>0</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Issue</span>
                            <span className={styles.statValue}>1</span>
                        </div>
                    </div>
                </div>

                {/* ── Last Sync Timestamp ─────────────── */}
                <p className={styles.syncTimestamp} data-instruction-target="last-sync-timestamp">
                    Your last Google accounts sync was processed on 02/16/2026 at 4:45AM
                </p>

                {/* ── Action Buttons ──────────────────── */}
                <div className={styles.actionButtons}>
                    <button
                        className={styles.editProvisioningBtn}
                        data-instruction-target="edit-provisioning"
                        onClick={() => {
                            checkActionGoal("edit-provisioning");
                            handleEditProvisioning();
                        }}
                    >
                        Edit Google provisioning
                    </button>
                    <button
                        className={styles.pauseSyncBtn}
                        data-instruction-target="pause-sync"
                        onClick={handlePauseClick}
                    >
                        {isPaused ? "Resume Google sync" : "Pause Google sync"}
                    </button>
                </div>

                {/* ── Tabs ────────────────────────────── */}
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => {
                    setActiveTab(tabId);
                    checkActionGoal(`idm-tab-${tabId}`);
                }} />

                {/* ── Tasks Tab ───────────────────────── */}
                {activeTab === "tasks" && (
                    <div className={styles.tabContent}>
                        <div className={styles.sectionHeaderRow}>
                            <h2 className={styles.sectionTitle}>Notifications</h2>
                            <button className={styles.downloadLink} onClick={handleDownloadUserEmails}>
                                <DownloadIcon /> Download user emails
                            </button>
                        </div>
                        <div className={styles.notificationCard} data-instruction-target="managed-users-notification">
                            <span className={styles.successBadge}>
                                <CheckIcon /> Success
                            </span>
                            <div className={styles.notificationText}>
                                <p className={styles.notificationTitle}>
                                    Clever IDM is managing 40 Google users
                                </p>
                                <p className={styles.notificationDesc}>
                                    View students.csv and teachers_and_staff.csv for a list of emails to upload them to your SIS.
                                </p>
                            </div>
                        </div>

                        <h2 className={styles.sectionTitle}>Issues</h2>
                        <div className={styles.emptyCard}>
                            <p>You are all caught up!</p>
                        </div>
                    </div>
                )}

                {/* ── Sync History Tab ─────────────────── */}
                {activeTab === "sync-history" && (
                    <div className={styles.tabContent}>
                        <h2 className={styles.sectionTitle}>Sync History</h2>
                        <DataTable columns={syncHistoryColumns} data={syncHistory} />
                    </div>
                )}

                {/* ── Exports Tab ──────────────────────── */}
                {activeTab === "exports" && (
                    <div className={styles.tabContent} data-instruction-target="exports-tab-content">
                        <div className={styles.exportSection}>
                            <h3 className={styles.exportSectionTitle}>All Clever IDM Google Users</h3>
                            <p className={styles.exportDesc}>Clever IDM is managing 40 Google users.</p>
                            <button className={styles.downloadLink} onClick={handleDownloadUserEmails}>
                                <DownloadIcon /> Download user emails
                            </button>
                        </div>

                        <div className={styles.exportSection}>
                            <h3 className={styles.exportSectionTitle}>Recent Clever IDM Google Credentials</h3>
                            <p className={styles.exportDesc}>
                                Download credentials for accounts created or updated in the last 10 days.
                            </p>
                            <button
                                className={styles.downloadLink}
                                data-instruction-target="download-recent-accounts"
                                onClick={() => {
                                    checkActionGoal("download-recent-accounts");
                                    handleDownloadRecentAccounts();
                                }}
                            >
                                <DownloadIcon /> Download recent accounts
                            </button>
                        </div>

                        <div className={styles.exportSection}>
                            <h3 className={styles.exportSectionTitle}>Enable SFTP access for IDM exports</h3>
                            <p className={styles.exportDesc}>
                                Enable SFTP access to allow automated export of IDM data.
                                Visit the <a href="#" className={styles.helpLink}>Help Center</a> for more information.
                            </p>
                            <label className={styles.toggleLabel}>
                                <div
                                    className={`${styles.toggle} ${sftpEnabled ? styles.toggleOn : ""}`}
                                    onClick={() => setSftpEnabled(!sftpEnabled)}
                                    role="switch"
                                    aria-checked={sftpEnabled}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setSftpEnabled(!sftpEnabled);
                                        }
                                    }}
                                >
                                    <div className={styles.toggleThumb} />
                                </div>
                                <span>{sftpEnabled ? "Enabled" : "Disabled"}</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* ── Events Tab ───────────────────────── */}
                {activeTab === "events" && (
                    <div className={styles.tabContent} data-instruction-target="events-tab-content">
                        {/* Date Filters */}
                        <div className={styles.eventsFilterRow}>
                            <label className={styles.dateFilterLabel}>
                                Start Date
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setEventsPage(1); }}
                                />
                            </label>
                            <label className={styles.dateFilterLabel}>
                                End Date
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setEventsPage(1); }}
                                />
                            </label>
                            <div className={styles.addFilterContainer} ref={filterDropdownRef}>
                                <button
                                    className={styles.addFilterBtn}
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                >
                                    + Add filter
                                </button>
                                {showFilterDropdown && (
                                    <div className={styles.filterDropdownMenu}>
                                        {["Event type", "Destination", "User"].map((f) => (
                                            <button
                                                key={f}
                                                className={styles.filterDropdownItem}
                                                onClick={() => addFilter(f)}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        {activeFilters.length > 0 && (
                            <div className={styles.activeFilters}>
                                {activeFilters.map((filter, i) => (
                                    <span key={i} className={styles.filterChip}>
                                        {filter.field}: {filter.value}
                                        <button
                                            className={styles.filterChipRemove}
                                            onClick={() => removeFilter(i)}
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Events Table (custom — not DataTable, due to expandable rows) */}
                        <div className={styles.eventsTableContainer}>
                            <table className={styles.eventsTable}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 30 }}></th>
                                        <th>Date</th>
                                        <th>Event</th>
                                        <th>Destination</th>
                                        <th>User</th>
                                        <th>SIS ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedEvents.map((ev, i) => {
                                        const globalIndex = (eventsPage - 1) * EVENTS_PER_PAGE + i;
                                        const isExpanded = expandedEventRows.has(globalIndex);
                                        const moreFieldsCount = ev.allModifiedData.length - ev.modifiedFields.length;

                                        return (
                                            <React.Fragment key={globalIndex}>
                                                <tr
                                                    className={`${styles.eventsRow} ${isExpanded ? styles.eventsRowExpanded : ""}`}
                                                    onClick={() => toggleEventRow(globalIndex)}
                                                >
                                                    <td className={styles.chevronCell}>
                                                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                                    </td>
                                                    <td>{ev.date}</td>
                                                    <td>
                                                        <span className={styles.eventType}>
                                                            <PersonIcon /> {ev.event}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                                            <GoogleIcon /> {ev.destination}
                                                        </span>
                                                    </td>
                                                    <td>{ev.user}</td>
                                                    <td>{ev.sisId}</td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr className={styles.expandedRow}>
                                                        <td colSpan={6}>
                                                            <div className={styles.expandedContent}>
                                                                {/* User Details */}
                                                                <div className={styles.detailSection}>
                                                                    <h4 className={styles.detailSectionTitle}>User details</h4>
                                                                    <div className={styles.detailGrid}>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>Destination Username</span>
                                                                            <span className={styles.detailValue}>{ev.destinationUsername}</span>
                                                                        </div>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>User Type</span>
                                                                            <span className={styles.detailValue}>{ev.userType}</span>
                                                                        </div>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>SIS ID</span>
                                                                            <span className={styles.detailValue}>
                                                                                {ev.sisId}
                                                                                <button
                                                                                    className={styles.copyBtn}
                                                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(ev.sisId, `sis-${globalIndex}`); }}
                                                                                    title="Copy SIS ID"
                                                                                >
                                                                                    {copiedField === `sis-${globalIndex}` ? "Copied!" : <CopyIcon />}
                                                                                </button>
                                                                            </span>
                                                                        </div>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>Clever ID</span>
                                                                            <span className={styles.detailValue}>
                                                                                {ev.cleverId}
                                                                                <button
                                                                                    className={styles.copyBtn}
                                                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(ev.cleverId, `clever-${globalIndex}`); }}
                                                                                    title="Copy Clever ID"
                                                                                >
                                                                                    {copiedField === `clever-${globalIndex}` ? "Copied!" : <CopyIcon />}
                                                                                </button>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={styles.detailActions}>
                                                                        <a href="#" className={styles.detailActionLink} onClick={(e) => e.preventDefault()}>
                                                                            Open Profile
                                                                        </a>
                                                                        <a href="#" className={styles.detailActionLink} onClick={(e) => e.preventDefault()}>
                                                                            Unlink user
                                                                        </a>
                                                                    </div>
                                                                </div>

                                                                {/* Sync Details */}
                                                                <div className={styles.detailSection}>
                                                                    <h4 className={styles.detailSectionTitle}>Sync details</h4>
                                                                    <div className={styles.detailGrid}>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>Current OU</span>
                                                                            <span className={styles.detailValue}>{ev.currentOU}</span>
                                                                        </div>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>Previous OU</span>
                                                                            <span className={styles.detailValue}>{ev.previousOU}</span>
                                                                        </div>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>Current Managed Groups</span>
                                                                            <span className={styles.detailValue}>{ev.currentManagedGroups}</span>
                                                                        </div>
                                                                        <div className={styles.detailItem}>
                                                                            <span className={styles.detailLabel}>Previous Managed Groups</span>
                                                                            <span className={styles.detailValue}>{ev.previousManagedGroups}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Modified Data */}
                                                                <div className={styles.detailSection}>
                                                                    <h4 className={styles.detailSectionTitle}>Modified data</h4>
                                                                    <div className={styles.detailGrid}>
                                                                        {ev.modifiedFields.map((mf, mfi) => (
                                                                            <div key={mfi} className={styles.detailItem}>
                                                                                <span className={styles.detailLabel}>{mf.field}</span>
                                                                                <span className={styles.detailValue}>{mf.value}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {moreFieldsCount > 0 && (
                                                                        <button
                                                                            className={styles.seeMoreLink}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setModifiedDataModal(ev);
                                                                            }}
                                                                        >
                                                                            See {moreFieldsCount} more fields
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Additional Sync Details */}
                                                                <div className={styles.detailSection}>
                                                                    <h4 className={styles.detailSectionTitle}>Additional sync details</h4>
                                                                    <div className={styles.detailGrid}>
                                                                        {ev.additionalFields.map((af, afi) => (
                                                                            <div key={afi} className={styles.detailItem}>
                                                                                <span className={styles.detailLabel}>{af.field}</span>
                                                                                <span className={styles.detailValue}>{af.value}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredEvents.length === 0 && (
                                <div className={styles.emptyCard} style={{ marginTop: 16 }}>
                                    <p>No events match your filters.</p>
                                </div>
                            )}
                        </div>

                        {totalEventsPages > 1 && (
                            <Pagination
                                currentPage={eventsPage}
                                totalPages={totalEventsPages}
                                onPageChange={setEventsPage}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* ── Toast Notification ───────────────── */}
            {toast && (
                <div className={styles.toast}>
                    {toast}
                </div>
            )}

            {/* ── Add Destination Modal ────────────── */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add new destination?"
                maxWidth="480px"
            >
                <p className={styles.modalBody}>
                    Are you sure you want to add <strong>{selectedDestination}</strong> as a new destination?
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.modalPrimaryBtn} onClick={handleConfirmAddDestination}>
                        Add destination
                    </button>
                    <button className={styles.modalCancelBtn} onClick={() => setShowAddModal(false)}>
                        Cancel
                    </button>
                </div>
            </Modal>

            {/* ── Pause Sync Modal ─────────────────── */}
            <Modal
                isOpen={showPauseModal}
                onClose={() => setShowPauseModal(false)}
                title="Pause syncs?"
                maxWidth="480px"
            >
                <p className={styles.modalBody}>
                    Pausing Google provisioning syncs will prevent your district&apos;s syncs from making any changes in Google.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.modalPrimaryBtn} onClick={handleConfirmPause}>
                        Pause syncs
                    </button>
                    <button className={styles.modalCancelLink} onClick={() => setShowPauseModal(false)}>
                        Cancel
                    </button>
                </div>
            </Modal>

            {/* ── Modified Data Modal ──────────────── */}
            <Modal
                isOpen={!!modifiedDataModal}
                onClose={() => setModifiedDataModal(null)}
                title="Modified data"
                maxWidth="600px"
            >
                {modifiedDataModal && (
                    <div className={styles.modifiedDataList}>
                        {modifiedDataModal.allModifiedData.map((item, i) => (
                            <div key={i} className={styles.modifiedDataItem}>
                                <strong>{item.field}:</strong> {item.value}
                            </div>
                        ))}
                        <div className={styles.modalActions} style={{ marginTop: 24 }}>
                            <button className={styles.modalPrimaryBtn} onClick={() => setModifiedDataModal(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
