"use client";

import { getCustomerInfo } from "@/data/characters";
import styles from "./TicketCard.module.css";

/**
 * TicketCard — pinned at top of InvestigationView.
 * Shows the coworker's static request message (email/Slack-style).
 * The coworker appears here and at the resolution step only.
 */
export default function TicketCard({ scenario }) {
    const customer = getCustomerInfo(scenario?.customerId);

    if (!scenario?.ticketMessage) return null;

    return (
        <div className={styles.ticketCard}>
            <div className={styles.ticketHeader}>
                <div
                    className={styles.ticketAvatar}
                    style={{ backgroundColor: customer.avatarColor }}
                >
                    {customer.avatar}
                </div>
                <div className={styles.ticketMeta}>
                    <span className={styles.ticketName}>{customer.name}</span>
                    <span className={styles.ticketRole}>
                        {customer.role}
                        {customer.school ? ` · ${customer.school}` : ""}
                    </span>
                </div>
                {scenario.ticketNumber && (
                    <span className={styles.ticketNumber}>
                        #{scenario.ticketNumber}
                    </span>
                )}
            </div>
            <div className={styles.ticketBody}>
                {scenario.ticketMessage}
            </div>
        </div>
    );
}
