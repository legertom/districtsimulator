"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";

export default function DashboardError({ error, reset }) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Something went wrong</h2>
                <p className={styles.message}>
                    An error occurred while loading this page. This might be a temporary issue.
                </p>
                <div className={styles.actions}>
                    <button className={styles.retryButton} onClick={() => reset()}>
                        Try again
                    </button>
                    <Link href="/dashboard" className={styles.homeLink}>
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
