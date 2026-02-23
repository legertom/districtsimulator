"use client";

/**
 * Reusable data table component.
 * 
 * Usage:
 *   import { DataTable } from "@/components/ui";
 *   
 *   <DataTable
 *     columns={[
 *       { key: "name", header: "Name", sortable: true },
 *       { key: "status", header: "Status" },
 *       { key: "actions", header: "Actions", render: (row) => <button>Edit</button> }
 *     ]}
 *     data={[{ name: "Item 1", status: "Active" }]}
 *     selectable
 *     onSelect={(selectedRows) => {}}
 *   />
 */

import { useState } from "react";
import styles from "./DataTable.module.css";

export function DataTable({
    columns = [],
    data = [],
    selectable = false,
    onSelect,
    onRowClick,
    className = ""
}) {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = new Set(data.map((_, index) => index));
            setSelectedRows(allIds);
            onSelect?.(data);
        } else {
            setSelectedRows(new Set());
            onSelect?.([]);
        }
    };

    const handleSelectRow = (index, checked) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(index);
        } else {
            newSelected.delete(index);
        }
        setSelectedRows(newSelected);
        onSelect?.(data.filter((_, i) => newSelected.has(i)));
    };

    const handleSort = (key) => {
        const column = columns.find(c => c.key === key);
        if (!column?.sortable) return;

        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const direction = sortConfig.direction === "asc" ? 1 : -1;

        if (typeof aVal === "string") {
            return aVal.localeCompare(bVal) * direction;
        }
        return (aVal - bVal) * direction;
    });

    const allSelected = data.length > 0 && selectedRows.size === data.length;

    return (
        <div className={`${styles.container} ${className}`}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {selectable && (
                            <th className={styles.checkboxCell}>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                        )}
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={col.sortable ? styles.sortable : ""}
                                onClick={() => handleSort(col.key)}
                            >
                                {col.header}
                                {col.sortable && (
                                    <span className={styles.sortIcon}>
                                        {sortConfig.key === col.key
                                            ? (sortConfig.direction === "asc" ? " ↑" : " ↓")
                                            : " ↕"}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? styles.clickableRow : ""}
                            style={onRowClick ? { cursor: "pointer" } : undefined}
                        >
                            {selectable && (
                                <td className={styles.checkboxCell}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(rowIndex)}
                                        onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                                    />
                                </td>
                            )}
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className={styles.empty}>No data available</div>
            )}
        </div>
    );
}

export default DataTable;
