"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WIZARD_STEPS, DEFAULT_PROVISIONING_STATE } from "@/data/defaults/idm-provisioning";
import { useInstructional } from "@/context/InstructionalContext";
import ConnectStep from "./steps/ConnectStep";
import ManagementLevelStep from "./steps/ManagementLevelStep";
import SelectUsersStep from "./steps/SelectUsersStep";
import SetCredentialsStep from "./steps/SetCredentialsStep";
import OrganizeOUsStep from "./steps/OrganizeOUsStep";
import ConfigureGroupsStep from "./steps/ConfigureGroupsStep";
import SummaryStep from "./steps/SummaryStep";
import PreviewStep from "./steps/PreviewStep";
import styles from "./GoogleProvisioningWizard.module.css";

const CheckSvg = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 6l2.5 2.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const BackArrow = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const STEP_COMPONENTS = {
    connect: ConnectStep,
    "management-level": ManagementLevelStep,
    users: SelectUsersStep,
    credentials: SetCredentialsStep,
    ous: OrganizeOUsStep,
    groups: ConfigureGroupsStep,
    summary: SummaryStep,
    preview: PreviewStep,
};

export default function GoogleProvisioningWizard({ currentStep, onStepChange, onExit }) {
    const [localStep, setLocalStep] = useState(WIZARD_STEPS[0].id);
    const [wizardState, setWizardState] = useState(() => {
        try {
            const saved = localStorage.getItem("idm-provisioning-state");
            if (saved) return JSON.parse(saved);
        } catch {
            // ignore
        }
        return { ...DEFAULT_PROVISIONING_STATE };
    });
    const [toast, setToast] = useState(null);
    const { checkActionGoal } = useInstructional();

    // Persist wizard state to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("idm-provisioning-state", JSON.stringify(wizardState));
        } catch {
            // ignore
        }
    }, [wizardState]);

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const updateState = useCallback((updates) => {
        setWizardState((prev) => ({ ...prev, ...updates }));
    }, []);

    const setStep = onStepChange ?? setLocalStep;
    const requestedStep = currentStep ?? localStep;
    const activeStep = WIZARD_STEPS.some((step) => step.id === requestedStep)
        ? requestedStep
        : WIZARD_STEPS[0].id;

    const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === activeStep);
    const currentStepDef = WIZARD_STEPS[currentStepIndex];

    const goToStep = (stepId) => {
        if (stepId === activeStep) return;
        checkActionGoal(`wizard-step-${stepId}`);
        setStep(stepId);
    };

    const goNext = () => {
        if (currentStepIndex < WIZARD_STEPS.length - 1) {
            setStep(WIZARD_STEPS[currentStepIndex + 1].id);
        }
    };

    const goBack = () => {
        if (currentStepIndex > 0) {
            setStep(WIZARD_STEPS[currentStepIndex - 1].id);
        } else {
            onExit?.();
        }
    };

    // Determine completed steps
    const isStepCompleted = (stepId) => {
        switch (stepId) {
            case "connect": return wizardState.googleConnected;
            case "management-level": return !!wizardState.managementLevel;
            case "users": return wizardState.provisionStudents || wizardState.provisionTeachers || wizardState.provisionStaff;
            case "credentials": return Object.values(wizardState.credentials).every((c) => c.completed);
            case "ous": return Object.values(wizardState.ous).every((o) => o.completed);
            case "groups": return true; // optional step
            case "summary": return true;
            case "preview": return false; // final step
            default: return false;
        }
    };

    const StepComponent = STEP_COMPONENTS[activeStep];

    return (
        <div className={styles.wizardOverlay}>
            {/* ── Top Bar ───────────────────────── */}
            <div className={styles.wizardTopBar}>
                <button className={styles.backLink} onClick={goBack}>
                    <BackArrow /> Back
                </button>
                <span className={styles.topBarSeparator}>|</span>
                <span className={styles.topBarTitle}>{currentStepDef?.label}</span>
            </div>

            <div className={styles.wizardBody}>
                {/* ── Sidebar ───────────────────── */}
                <nav className={styles.wizardSidebar}>
                    <h2 className={styles.sidebarHeading}>Google Provisioning Setup</h2>
                    <ul className={styles.stepList}>
                        {WIZARD_STEPS.map((step) => {
                            const completed = isStepCompleted(step.id) && step.id !== activeStep;
                            const active = step.id === activeStep;
                            return (
                                <li key={step.id}>
                                    <button
                                        className={styles.stepItem}
                                        data-instruction-target={`wizard-step-${step.id}`}
                                        onClick={() => goToStep(step.id)}
                                    >
                                        <span
                                            className={`${styles.stepIndicator} ${
                                                active
                                                    ? styles.stepActive
                                                    : completed
                                                    ? styles.stepCompleted
                                                    : styles.stepPending
                                            }`}
                                        >
                                            {completed && !active ? (
                                                <CheckSvg />
                                            ) : (
                                                step.number
                                            )}
                                        </span>
                                        <span
                                            className={`${styles.stepLabel} ${
                                                active ? styles.stepLabelActive : ""
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className={styles.needHelp}>
                        <span className={styles.needHelpIcon}>🔄</span>
                        <div>
                            <div className={styles.needHelpText}>Need help?</div>
                            <a href="#" className={styles.needHelpLink} onClick={(e) => e.preventDefault()}>
                                Talk to a specialist
                            </a>
                        </div>
                    </div>
                </nav>

                {/* ── Step Content ──────────────── */}
                <div className={styles.wizardContent}>
                    {StepComponent && (
                        <StepComponent
                            state={wizardState}
                            updateState={updateState}
                            goNext={goNext}
                            goBack={goBack}
                            goToStep={goToStep}
                            setToast={setToast}
                            onExit={onExit}
                        />
                    )}
                </div>
            </div>

            {/* ── Toast ────────────────────────── */}
            {toast && <div className={styles.toast}>{toast}</div>}
        </div>
    );
}
