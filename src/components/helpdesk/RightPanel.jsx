"use client";

import { useInstructional } from "@/context/InstructionalContext";
import GuidancePanel from "@/components/guidance/GuidancePanel";
import TicketInbox from "./TicketInbox";
import ConversationView from "./ConversationView";
import styles from "./RightPanel.module.css";

export default function RightPanel() {
    const { rightPanelView } = useInstructional();

    return (
        <div className={styles.panel}>
            {rightPanelView === "conversation" && <GuidancePanel />}
            {rightPanelView === "inbox" ? <TicketInbox /> : <ConversationView />}
        </div>
    );
}
