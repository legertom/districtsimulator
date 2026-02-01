"use client";

import { useState } from "react";
import styles from "./AdminTeam.module.css";
import { Icons, Icon } from "@/components/ui/Icons";

const teamMembers = [
    {
        id: 1,
        name: "Tom Leger",
        nickname: "🖊️",
        email: "tomleger+printdemo@gmail.com",
        roles: "Clever Admin (Owner)",
        title: "Dev Dude",
        mfaStatus: "Unactivated MFA",
        isOwner: true,
    },
    {
        id: 2,
        name: "Jane Smith",
        nickname: "👤",
        email: "detailed-textbook-3790@clever.com",
        roles: "Clever Admin",
        title: "",
        mfaStatus: "Unactivated MFA",
        isOwner: false,
    },
];

const pageActionsMenu = [
    { label: "Add team member", isHighlighted: true },
    { label: "Create custom role" },
    { label: "Change account owner" },
];

const rowActionsMenu = [
    { label: "Access Portal as user" },
    { label: "Access Dashboard as user" },
];

const tabs = ["Members", "Roles", "Access control", "Role settings"];

export default function AdminTeam() {
    const [activeActionsMenu, setActiveActionsMenu] = useState(null);
    const [pageActionsOpen, setPageActionsOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const toggleRowActions = (memberId) => {
        setActiveActionsMenu(activeActionsMenu === memberId ? null : memberId);
        setPageActionsOpen(false);
    };

    const togglePageActions = () => {
        setPageActionsOpen(!pageActionsOpen);
        setActiveActionsMenu(null);
    };

    return (
        <div className={styles.page}>
            {/* Page Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Team</h1>
                <div className={styles.actionsWrapper}>
                    <button
                        className={styles.actionsButton}
                        onClick={togglePageActions}
                    >
                        Actions {pageActionsOpen ? Icons.chevronUp : Icons.chevronDown}
                    </button>
                    {pageActionsOpen && (
                        <div className={styles.dropdown}>
                            {pageActionsMenu.map((item, index) => (
                                <button
                                    key={index}
                                    className={`${styles.dropdownItem} ${item.isHighlighted ? styles.dropdownItemHighlighted : ""}`}
                                    onClick={() => {
                                        if (item.label === "Add team member") {
                                            setIsAddModalOpen(true);
                                            setPageActionsOpen(false);
                                        }
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div className={styles.infoBanner}>
                <span className={styles.infoIcon}>{Icons.info}</span>
                <p>
                    Clever requires Multi-Factor Authentication for all Clever Admin. Learn more about this feature{" "}
                    <a href="#" className={styles.link}>here</a>.
                </p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${index === 0 ? styles.tabActive : ""}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>User Type</label>
                        <select className={styles.select}>
                            <option value="">All</option>
                        </select>
                    </div>
                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>Role</label>
                        <select className={styles.select}>
                            <option value="">All</option>
                        </select>
                    </div>
                </div>
                <div className={styles.searchWrapper}>
                    {Icons.search}
                    <input
                        type="text"
                        placeholder="Search"
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name {Icons.sort}</th>
                            <th>Email {Icons.sort}</th>
                            <th>Roles {Icons.info} {Icons.sort}</th>
                            <th>Title {Icons.sort}</th>
                            <th>MFA Status {Icons.info} {Icons.sort}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers.map((member) => (
                            <tr key={member.id}>
                                <td className={styles.nameCell}>
                                    {member.name} {member.nickname}
                                </td>
                                <td>{member.email}</td>
                                <td>{member.roles}</td>
                                <td>{member.title}</td>
                                <td>
                                    <span className={styles.mfaBadge}>
                                        <span className={styles.warningIcon}>{Icons.warning}</span> {member.mfaStatus}
                                    </span>
                                </td>
                                <td className={styles.actionsCell}>
                                    {!member.isOwner && (
                                        <div className={styles.actionsWrapper}>
                                            <button
                                                className={styles.rowActionsButton}
                                                onClick={() => toggleRowActions(member.id)}
                                            >
                                                Actions {activeActionsMenu === member.id ? Icons.chevronUp : Icons.chevronDown}
                                            </button>
                                            {activeActionsMenu === member.id && (
                                                <div className={styles.dropdown}>
                                                    {rowActionsMenu.map((item, index) => (
                                                        <button
                                                            key={index}
                                                            className={styles.dropdownItem}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <button className={styles.pageButton} disabled>←</button>
                <span className={styles.pageNumber}>1</span>
                <button className={styles.pageButton} disabled>→</button>
            </div>

            {/* Add Team Member Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add team member</h2>
                            <button className={styles.closeModal} onClick={() => setIsAddModalOpen(false)}>
                                <Icon name="xCircle" size={24} />
                            </button>
                        </div>

                        <div className={styles.infoBox}>
                            <Icon name="portal" size={16} />
                            <span>Learn more about user roles and permissions in our <a href="#">Help Center</a>.</span>
                        </div>

                        <div className={styles.modalForm}>
                            <div className={styles.inputGroup}>
                                <label>First name</label>
                                <input type="text" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Last name</label>
                                <input type="text" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <input type="email" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Title</label>
                                <input type="text" />
                            </div>

                            <div className={styles.rolesSection}>
                                <div className={styles.rolesHeader}>
                                    <span>Default roles</span>
                                    <Icon name="info" size={16} className={styles.roleInfoIcon} />
                                </div>
                                <div className={styles.roleOptions}>
                                    <label className={styles.roleOption}>
                                        <input type="checkbox" className={styles.checkbox} />
                                        <span>Clever Admin</span>
                                    </label>
                                    <label className={styles.roleOption}>
                                        <input type="checkbox" className={styles.checkbox} />
                                        <span>District Curriculum Lead</span>
                                    </label>
                                    <label className={styles.roleOption}>
                                        <input type="checkbox" className={styles.checkbox} />
                                        <span>District Help Desk</span>
                                    </label>
                                </div>
                                <p className={styles.roleHint}>
                                    School Tech Lead roles are created and assigned on the <a href="#">custom staff page</a>.
                                </p>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.saveButton} onClick={() => setIsAddModalOpen(false)}>Save</button>
                                <button className={styles.cancelButton} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
