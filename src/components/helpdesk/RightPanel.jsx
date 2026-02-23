"use client";

import ChatView from "./ChatView";
import styles from "./RightPanel.module.css";

export default function RightPanel() {
    return (
        <div className={styles.panel}>
            <ChatView />
        </div>
    );
}
