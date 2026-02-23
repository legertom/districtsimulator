/**
 * Default scenario data for District Simulator
 * 
 * This is the central export point for all domain-specific default data.
 * Each domain will be extracted from components and defined here in separate files.
 * 
 * Usage:
 *   import { defaultScenario } from '@/data/defaults';
 */

import { teamMembers, pageActionsMenu, rowActionsMenu } from './team';
import { myApplications, availableApplications } from './applications';
import { accessData } from './accessLogs';
import { badgeData } from './badges';
import { mockPeople } from './people';
import { profileData, emailPrefs, emailPreferences } from './profile';
import { initialMessages, customerInfo, scenarioContext } from './chat';
import { dashboardStats, sisSync, ssoStatus, awaitingAction, applicationStats, pinnedApplications } from './dashboard';
import { techSupportContact, accessControlData } from './ssoSettings';
import { portalShortname, customizationEnabled, tabs as portalTabs } from './portalSettings';
import { navItems, districtInfo } from './sidebar';
import { searchPlaceholder, userInfo } from './topNav';
import { SYNC_STATES, syncMetadata } from './sisSync';
import { destinations as idmDestinations, syncHistory as idmSyncHistory, events as idmEvents } from './idm';
import { TABS, SCHOOLS_DATA, STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA, SECTIONS_DATA, TERMS_DATA, COURSES_DATA, CONTACTS_DATA, ENROLLMENTS_BY_STUDENT, ENROLLMENTS_BY_SECTION } from './dataBrowser';
import {
    portalApps,
    portalCategories,
    portalNotice,
    portalTopNavItems
} from './portalLobby';




/**
 * Initial safe scenario shape
 * Domains will be added incrementally as they are extracted from components
 */
export const defaultScenario = {
    // Metadata
    meta: {
        scenarioName: "Default Training Scenario",
        districtName: "Example District",
        districtId: "68759062d10d9a9ab79dbe04",
        lastModified: new Date().toISOString()
    },

    // Batch A domains (leaf pages)
    team: {
        members: teamMembers,
        pageActionsMenu,
        rowActionsMenu
    },
    applications: {
        myApplications,
        availableApplications
    },
    accessLogs: {
        data: accessData
    },
    badges: {
        data: badgeData
    },
    people: {
        data: mockPeople
    },

    // Batch B domains (mid-complexity pages)
    profile: {
        data: profileData,
        emailPrefs,
        emailPreferences
    },
    chat: {
        initialMessages,
        customerInfo,
        scenarioContext
    },
    dashboard: {
        stats: dashboardStats,
        sisSync,
        ssoStatus,
        awaitingAction,
        applicationStats,
        pinnedApplications
    },
    ssoSettings: {
        techSupportContact,
        accessControlData
    },
    portalSettings: {
        shortname: portalShortname,
        customizationEnabled,
        tabs: portalTabs
    },

    // Batch C domains (complex/layout pages) - Task 22A
    sidebar: {
        navItems,
        districtInfo
    },
    topNav: {
        searchPlaceholder,
        userInfo
    },
    sisSync: {
        syncStates: SYNC_STATES,
        metadata: syncMetadata
    },

    // Portal Lobby — Thread C
    portalLobby: {
        topNavItems: portalTopNavItems,
        categories: portalCategories,
        notice: portalNotice,
        apps: portalApps
    },

    // IDM domain
    idm: {
        destinations: idmDestinations,
        syncHistory: idmSyncHistory,
        events: idmEvents,
    },

    // Batch C domains (complex/layout pages) - Task 22B
    dataBrowser: {
        tabs: TABS,
        schools: SCHOOLS_DATA,
        students: STUDENTS_DATA,
        teachers: TEACHERS_DATA,
        staff: STAFF_DATA,
        sections: SECTIONS_DATA,
        terms: TERMS_DATA,
        courses: COURSES_DATA,
        contacts: CONTACTS_DATA,
        enrollmentsByStudent: ENROLLMENTS_BY_STUDENT,
        enrollmentsBySection: ENROLLMENTS_BY_SECTION
    }
};

export default defaultScenario;
