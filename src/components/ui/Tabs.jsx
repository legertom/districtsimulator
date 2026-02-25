"use client";

/**
 * Reusable tab navigation component.
 * 
 * Usage:
 *   import { Tabs } from "@/components/ui/Tabs";
 *   
 *   const [activeTab, setActiveTab] = useState("Overview");
 *   
 *   <Tabs
 *     tabs={["Overview", "Settings", "Upload"]}
 *     activeTab={activeTab}
 *     onTabChange={setActiveTab}
 *   />
 * 
 * Or with objects for more control:
 *   <Tabs
 *     tabs={[{ id: "overview", label: "Overview" }, { id: "settings", label: "Settings" }]}
 *     activeTab={activeTab}
 *     onTabChange={setActiveTab}
 *   />
 */

import styles from "./Tabs.module.css";

export function Tabs({ tabs, activeTab, onTabChange, className = "" }) {
    return (
        <div className={`${styles.tabs} ${className}`}>
            {tabs.map((tab) => {
                const tabId = typeof tab === "string" ? tab : tab.id;
                const tabLabel = typeof tab === "string" ? tab : tab.label;
                const isActive = activeTab === tabId;

                const dataTarget = typeof tab === "object" ? tab["data-instruction-target"] : undefined;

                return (
                    <button
                        key={tabId}
                        className={`${styles.tab} ${isActive ? styles.activeTab : ""}`}
                        onClick={() => onTabChange(tabId)}
                        {...(dataTarget ? { "data-instruction-target": dataTarget } : {})}
                    >
                        {tabLabel}
                    </button>
                );
            })}
        </div>
    );
}

export default Tabs;
