"use client";

import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Tabs, Modal, Icon, PageHeader } from "@/components/ui";
import styles from "./Profile.module.css";

export default function Profile() {
    const { scenario } = useScenario();
    const { data: initialProfileData, emailPreferences } = scenario.profile;

    const [activeTab, setActiveTab] = useState("Overview");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(initialProfileData);
    const [emailPrefs, setEmailPrefs] = useState(scenario.profile.emailPrefs);

    const togglePref = (key) => {
        setEmailPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderOverview = () => (
        <div className={styles.overviewContainer}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Account Information</h2>
                </div>
                <div className={styles.infoGrid}>
                    <div className={styles.infoGroup}>
                        <label>User name</label>
                        <div className={styles.infoValue}>{profileData.firstName} {profileData.lastName}</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label>Phone number</label>
                        <div className={styles.infoValue}>{profileData.phoneNumber || "Not set"}</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label>Job title</label>
                        <div className={styles.infoValue}>{profileData.jobTitle}</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label>Password</label>
                        <div className={styles.infoValue}>••••••••••••••••</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label>Email</label>
                        <div className={styles.infoValue}>{profileData.email}</div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label>User roles</label>
                        <div className={styles.infoValue}>
                            Clever Admin (Owner)
                            <p className={styles.hintText}>
                                Learn about your user permissions by reading this <a href="#" target="_blank" rel="noopener noreferrer">help center article</a>
                            </p>
                        </div>
                    </div>
                    <div className={styles.infoGroup}>
                        <label>District ID:</label>
                        <div className={styles.infoValue}>68759062d10d9a9ab79dbe04</div>
                    </div>
                </div>
                <button className={styles.editButton} onClick={() => setIsEditModalOpen(true)}>Edit</button>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Multi-factor authentication</h2>
                    <span className={styles.statusBadge}>Unactivated</span>
                </div>
                <p className={styles.sectionDescription}>
                    Protect your account with simple MFA methods for free. For more details check <a href="#">Help Center</a>.
                </p>
                <button className={styles.primaryButton}>Activate MFA</button>
            </div>
        </div>
    );

    const renderEmails = () => (
        <div className={styles.emailsContainer}>
            <div className={styles.emailsHeader}>
                <h2>Email Preferences</h2>
                <p>Change what kinds of emails you will receive from Clever.</p>
            </div>

            <div className={styles.prefsList}>
                {emailPreferences.map(pref => (
                    <div key={pref.key} className={styles.prefItem}>
                        <div className={styles.prefInfo}>
                            <h3>{pref.title}</h3>
                            <p>{pref.description}</p>
                        </div>
                        <button
                            className={`${styles.toggle} ${emailPrefs[pref.key] ? styles.toggleOn : ""}`}
                            onClick={() => togglePref(pref.key)}
                        >
                            <div className={styles.toggleKnob} />
                            {emailPrefs[pref.key] && <Icon name="check" size={10} className={styles.toggleCheck} />}
                        </button>
                    </div>
                ))}
            </div>

            <button className={styles.primaryButton} style={{ marginTop: "24px" }}>Save</button>
        </div>
    );

    const handleUpdateProfile = () => {
        const newData = {
            firstName: document.getElementById("firstNameInput").value,
            lastName: document.getElementById("lastNameInput").value,
            jobTitle: document.getElementById("jobTitleInput").value,
            phoneNumber: document.getElementById("phoneInput").value,
            email: document.getElementById("emailInput").value
        };
        setProfileData(newData);
        setIsEditModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Profile"
            >
                <div className={styles.modalForm}>
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>First name</label>
                            <input
                                type="text"
                                defaultValue={profileData.firstName}
                                id="firstNameInput"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Last name</label>
                            <input
                                type="text"
                                defaultValue={profileData.lastName}
                                id="lastNameInput"
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Job title</label>
                        <input
                            type="text"
                            defaultValue={profileData.jobTitle}
                            id="jobTitleInput"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Phone number</label>
                        <input
                            type="text"
                            defaultValue={profileData.phoneNumber}
                            id="phoneInput"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            defaultValue={profileData.email}
                            id="emailInput"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.passwordInput}>
                            <input type="password" value="••••••••••••" disabled />
                        </div>
                        <button className={styles.changePasswordLink}>Change Password</button>
                    </div>

                    <div className={styles.modalActions}>
                        <button className={styles.updateButton} onClick={handleUpdateProfile}>Update</button>
                        <button className={styles.cancelButton} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            </Modal>

            <PageHeader title="Profile" />

            <Tabs
                tabs={["Overview", "Emails"]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={styles.content}>
                {activeTab === "Overview" ? renderOverview() : renderEmails()}
            </div>
        </div>
    );
}
