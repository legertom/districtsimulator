"use client";

import React, { useMemo, useState } from "react";
import styles from "../GoogleProvisioningWizard.module.css";

function GroupCard({ title, group, onConfigure }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{title}</div>
                <button className={styles.configureBtn} onClick={onConfigure}>Configure</button>
            </div>
            <div>
                <div className={styles.cardLabel}>NUMBER OF RULES CONFIGURED</div>
                <div className={styles.cardValue}>
                    {group.rulesConfigured === 0 ? "None" : group.rulesConfigured}
                </div>
            </div>
        </div>
    );
}

const GROUP_COPY = {
    students: { singular: "Student", plural: "Student groups", pluralNoun: "students" },
    teachers: { singular: "Teacher", plural: "Teacher groups", pluralNoun: "teachers" },
    staff: { singular: "Staff", plural: "Staff groups", pluralNoun: "staff members" },
};

const GROUP_DIRECTORY = {
    students: [
        {
            id: "elementary-staff-teachers",
            name: "Elementary School Staff & Teachers",
            email: "elementary@maytonlyceum.com",
            members: 0,
            type: "Mailing Group",
        },
        {
            id: "grade-7-homeroom",
            name: "Grade 7 Homeroom",
            email: "grade7@maytonlyceum.com",
            members: 28,
            type: "Security Group",
        },
    ],
    teachers: [
        {
            id: "teachers-all",
            name: "All Teachers",
            email: "teachers@maytonlyceum.com",
            members: 10,
            type: "Mailing Group",
        },
    ],
    staff: [
        {
            id: "staff-operations",
            name: "Operations Staff",
            email: "operations@maytonlyceum.com",
            members: 6,
            type: "Mailing Group",
        },
    ],
};

const WarningIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2.2l6.2 11H1.8l6.2-11z" fill="currentColor" />
        <path d="M8 5.3v4.1" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11.3" r="0.9" fill="#fff" />
    </svg>
);

const LeftArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M8.5 2.8L4.3 7l4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 7h5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
            d="M11.7 4.9A4.9 4.9 0 104.5 11M2.3 9.1A4.9 4.9 0 009.5 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
        <path d="M9.3 2.6h2.3V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4.7 11.4H2.4V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

export default function ConfigureGroupsStep({ state, updateState, goNext, setToast }) {
    const [panelMode, setPanelMode] = useState("user-type");
    const [activeType, setActiveType] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroupsByType, setSelectedGroupsByType] = useState(() => ({
        students: new Set([GROUP_DIRECTORY.students[0].id]),
        teachers: new Set([GROUP_DIRECTORY.teachers[0].id]),
        staff: new Set([GROUP_DIRECTORY.staff[0].id]),
    }));
    const [rulesByType, setRulesByType] = useState({
        students: [],
        teachers: [],
        staff: [],
    });

    const copy = activeType ? GROUP_COPY[activeType] : null;
    const selectedGroupIds = activeType ? selectedGroupsByType[activeType] : new Set();

    const currentGroups = useMemo(() => {
        return activeType ? GROUP_DIRECTORY[activeType] : [];
    }, [activeType]);

    const filteredGroups = useMemo(() => {
        if (!activeType) return [];
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) return currentGroups;
        return currentGroups.filter((group) => {
            return (
                group.name.toLowerCase().includes(normalizedQuery) ||
                group.email.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [activeType, currentGroups, searchQuery]);

    const selectedCount = selectedGroupIds.size;
    const activeRules = activeType ? rulesByType[activeType] : [];
    const allVisibleSelected =
        filteredGroups.length > 0 && filteredGroups.every((group) => selectedGroupIds.has(group.id));

    const handleConfigure = (type) => {
        setActiveType(type);
        setPanelMode("group-select");
        setSearchQuery("");
    };

    const handleBackToUserTypes = () => {
        setPanelMode("user-type");
        setActiveType(null);
        setSearchQuery("");
    };

    const handleToggleGroup = (groupId) => {
        if (!activeType) return;
        setSelectedGroupsByType((prev) => {
            const nextSelected = new Set(prev[activeType]);
            if (nextSelected.has(groupId)) {
                nextSelected.delete(groupId);
            } else {
                nextSelected.add(groupId);
            }
            return { ...prev, [activeType]: nextSelected };
        });
    };

    const handleToggleAllVisible = () => {
        if (!activeType) return;
        setSelectedGroupsByType((prev) => {
            const nextSelected = new Set(prev[activeType]);
            if (allVisibleSelected) {
                filteredGroups.forEach((group) => nextSelected.delete(group.id));
            } else {
                filteredGroups.forEach((group) => nextSelected.add(group.id));
            }
            return { ...prev, [activeType]: nextSelected };
        });
    };

    const handleRuleSetup = () => {
        if (!activeType) return;
        setPanelMode("rules-config");
    };

    const handleAddRule = () => {
        if (!activeType) return;
        const nextRuleNumber = rulesByType[activeType].length + 1;
        const nextRule = {
            id: `${activeType}-rule-${Date.now()}`,
            label: `${copy.singular} Rule ${nextRuleNumber}`,
        };
        setRulesByType((prev) => ({
            ...prev,
            [activeType]: [...prev[activeType], nextRule],
        }));
        setToast(`${copy.singular} membership rule added.`);
    };

    const handleRemoveRule = (ruleId) => {
        if (!activeType) return;
        setRulesByType((prev) => ({
            ...prev,
            [activeType]: prev[activeType].filter((rule) => rule.id !== ruleId),
        }));
    };

    const handleSaveRules = () => {
        if (!activeType) return;
        const configuredRuleCount = rulesByType[activeType].length;
        updateState?.({
            groups: {
                ...state.groups,
                [activeType]: {
                    ...state.groups[activeType],
                    rulesConfigured: configuredRuleCount,
                },
            },
        });
        setToast(`${copy.singular} group rules saved.`);
        handleBackToUserTypes();
    };

    return (
        <>
            <div className={styles.pendingChangesBanner}>
                <span className={styles.pendingChangesIcon}>
                    <WarningIcon />
                </span>
                <p className={styles.pendingChangesText}>
                    Note: you have pending unprovisioned changes in your configuration. Your nightly syncs will be paused until you review, preview, and provision those changes.
                </p>
            </div>

            <h1 className={styles.stepTitle}>
                Set up group assignment
                <span className={styles.optionalBadge}>Optional</span>
            </h1>
            <p className={styles.stepDescription}>
                Configure which Google Groups you want Clever IDM to manage. Clever IDM will automate
                adding and removing users in Clever managed groups. For more information please see the{" "}
                <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>
                    Configure groups section
                </a>{" "}
                of our Clever IDM course in Clever Academy.
            </p>

            <hr style={{ border: "none", borderTop: "1px solid var(--gray-200)", margin: "0 0 24px 0" }} />

            {panelMode === "group-select" && activeType ? (
                <section className={styles.groupConfigPanel}>
                    <button className={styles.groupConfigBackBtn} onClick={handleBackToUserTypes}>
                        <LeftArrowIcon />
                        Back to all user types
                    </button>

                    <h3 className={styles.groupConfigTitle}>Select {copy.singular} groups</h3>
                    <p className={styles.groupConfigDescription}>
                        Select the groups you want Clever IDM to manage. In the next step, you will create membership rules for these groups, which Clever IDM will use to add or remove users from your managed groups.
                    </p>

                    <div className={styles.groupConfigToolbar}>
                        <div className={styles.groupConfigToolbarLeft}>
                            <span className={styles.groupConfigTableTitle}>Your Google Groups</span>
                            <button className={styles.groupRefreshBtn} onClick={() => setToast("Google Groups refreshed.")}>
                                <RefreshIcon />
                                Refresh
                            </button>
                        </div>

                        <input
                            className={styles.groupSearchInput}
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search for a Google Group"
                            aria-label="Search for a Google Group"
                        />
                    </div>

                    <table className={styles.groupTable}>
                        <thead>
                            <tr>
                                <th className={styles.groupTableCheckboxCol}>
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={handleToggleAllVisible}
                                        aria-label="Select all visible groups"
                                    />
                                </th>
                                <th>Group name</th>
                                <th>Group email address</th>
                                <th>Number of members</th>
                                <th>Group type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.groupTableEmpty}>
                                        No groups match your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredGroups.map((group) => {
                                    const isSelected = selectedGroupIds.has(group.id);
                                    return (
                                        <tr key={group.id}>
                                            <td className={styles.groupTableCheckboxCol}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleGroup(group.id)}
                                                    aria-label={`Select ${group.name}`}
                                                />
                                            </td>
                                            <td className={styles.groupNameCell}>
                                                <span>{group.name}</span>
                                                {isSelected && <span className={styles.willBeManagedPill}>Will be managed</span>}
                                            </td>
                                            <td>{group.email}</td>
                                            <td>{group.members}</td>
                                            <td>{group.type}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    <div className={styles.groupConfigActions}>
                        <button className={styles.groupCancelBtn} onClick={handleBackToUserTypes}>
                            Cancel
                        </button>
                        <button className={styles.groupSetupBtn} onClick={handleRuleSetup} disabled={selectedCount === 0}>
                            Set up rules for the {selectedCount} selected group{selectedCount === 1 ? "" : "s"}
                        </button>
                    </div>
                </section>
            ) : panelMode === "rules-config" && activeType ? (
                <section className={styles.groupConfigPanel}>
                    <button className={styles.groupConfigBackBtn} onClick={handleBackToUserTypes}>
                        <LeftArrowIcon />
                        Back to all group selection
                    </button>

                    <h3 className={styles.groupRulesTitle}>Configure {copy.singular} groups</h3>
                    <p className={styles.groupRulesDescription}>
                        Configure membership rules which will determine both group name and which users will be assigned to each individual group. Rules are compared against every {copy.singular.toLowerCase()} to sort {copy.pluralNoun} into groups.
                    </p>

                    <table className={styles.groupRulesTable}>
                        <thead>
                            <tr>
                                <th>Membership rule</th>
                                <th className={styles.groupRulesActionHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeRules.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className={styles.groupRulesEmpty}>
                                        <p>There are no membership rules set up for {copy.pluralNoun} yet</p>
                                        <p>Create a membership rule by clicking the button below</p>
                                    </td>
                                </tr>
                            ) : (
                                activeRules.map((rule) => (
                                    <tr key={rule.id}>
                                        <td>{rule.label}</td>
                                        <td className={styles.groupRulesActionHeader}>
                                            <button
                                                className={styles.groupRuleActionBtn}
                                                onClick={() => handleRemoveRule(rule.id)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className={styles.groupRulesActions}>
                        <button className={styles.groupAddRuleBtn} onClick={handleAddRule}>
                            + Add rule
                        </button>
                    </div>

                    <div className={styles.groupConfigActions}>
                        <button className={styles.groupCancelBtn} onClick={handleBackToUserTypes}>
                            Cancel
                        </button>
                        <button className={styles.groupSaveBtn} onClick={handleSaveRules}>
                            Save
                        </button>
                    </div>
                </section>
            ) : (
                <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--gray-900)", margin: "0 0 16px 0" }}>
                        Select a user type to configure groups
                    </h3>

                    <div className={styles.cardGrid}>
                        {state.provisionStudents && (
                            <GroupCard
                                title="Student Groups"
                                group={state.groups.students}
                                onConfigure={() => handleConfigure("students")}
                            />
                        )}
                        {state.provisionTeachers && (
                            <GroupCard
                                title="Teacher Groups"
                                group={state.groups.teachers}
                                onConfigure={() => handleConfigure("teachers")}
                            />
                        )}
                        {state.provisionStaff && (
                            <GroupCard
                                title="Staff Groups"
                                group={state.groups.staff}
                                onConfigure={() => handleConfigure("staff")}
                            />
                        )}
                    </div>

                    <div className={styles.nextBtnRow}>
                        <button className={styles.nextBtn} onClick={goNext}>
                            Review Summary
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
