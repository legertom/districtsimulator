"use client";

import { useInstructional } from "@/context/InstructionalContext";
import GuidancePanel from "@/components/guidance/GuidancePanel";
import TicketInbox from "./TicketInbox";
import ConversationView from "./ConversationView";
import InvestigationView from "./InvestigationView";
import styles from "./RightPanel.module.css";

export default function RightPanel() {
    const { rightPanelView } = useInstructional();

    return (
        <div className={styles.panel}>
            {rightPanelView === "inbox" && <TicketInbox />}
            {rightPanelView === "conversation" && <ConversationView />}
            {rightPanelView === "investigation" && <InvestigationView />}
        </div>
    );
}
