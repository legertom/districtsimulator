"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useInstructional } from "@/context/InstructionalContext";
import { defaultScenario } from "@/data/defaults";

const DataVariantContext = createContext(undefined);

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Replace arrays, shallow-merge objects (1 level), replace primitives.
 */
export function applyOverrides(defaults, overrides) {
    if (!isObject(overrides)) return { ...defaults };

    const result = { ...defaults };

    for (const [key, value] of Object.entries(overrides)) {
        const baseValue = defaults?.[key];

        if (Array.isArray(value)) {
            result[key] = value;
        } else if (isObject(value) && isObject(baseValue)) {
            result[key] = { ...baseValue, ...value };
        } else {
            result[key] = value;
        }
    }

    return result;
}

export function DataVariantProvider({ children }) {
    const instructional = useInstructional();
    const activeScenarioOverrides = instructional?.activeScenario?.settings?.dataOverrides ?? null;
    const [activeVariant, setActiveVariant] = useState(null);

    const setVariantScenario = useCallback((variant) => {
        setActiveVariant(variant ?? null);
    }, []);

    const clearVariantScenario = useCallback(() => {
        setActiveVariant(null);
    }, []);

    const resolvedData = useMemo(() => {
        const variant = activeVariant ?? activeScenarioOverrides;
        return variant ? applyOverrides(defaultScenario, variant) : defaultScenario;
    }, [activeVariant, activeScenarioOverrides]);

    const value = useMemo(() => ({
        resolvedData,
        activeVariant,
        setVariantScenario,
        clearVariantScenario,
    }), [resolvedData, activeVariant, setVariantScenario, clearVariantScenario]);

    return (
        <DataVariantContext.Provider value={value}>
            {children}
        </DataVariantContext.Provider>
    );
}

export function useDataVariant() {
    const context = useContext(DataVariantContext);
    if (!context) {
        throw new Error("useDataVariant must be used within DataVariantProvider");
    }
    return context;
}

export default DataVariantContext;
