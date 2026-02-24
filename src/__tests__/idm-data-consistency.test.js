import { describe, it, expect } from "vitest";
import { events } from "@/data/defaults/idm";
import { STUDENTS_DATA, TEACHERS_DATA, STAFF_DATA } from "@/data/defaults/dataBrowser";

/**
 * Verifies that every IDM event references a real person from the Data Browser.
 * This test will fail if the IDM event names get out of sync with the Data Browser data.
 */
describe("IDM Events ↔ Data Browser consistency", () => {
    function findPerson(name, userType) {
        const nameParts = name?.split(" ") || [];
        const firstName = nameParts[0]?.toLowerCase();
        const lastName = nameParts[nameParts.length - 1]?.toLowerCase();
        const type = userType?.toLowerCase();

        let collection;
        if (type === "student") collection = STUDENTS_DATA;
        else if (type === "teacher") collection = TEACHERS_DATA;
        else if (type === "staff") collection = STAFF_DATA;
        else return null;

        return collection?.find(
            (p) => p.first?.toLowerCase() === firstName && p.last?.toLowerCase() === lastName
        ) ?? null;
    }

    it("every IDM event user exists in the Data Browser", () => {
        const mismatches = events.filter(
            (ev) => findPerson(ev.user, ev.userType) === null
        );
        if (mismatches.length > 0) {
            const names = mismatches.map((ev) => `${ev.user} (${ev.userType})`);
            throw new Error(
                `IDM events reference people not in Data Browser:\n  - ${names.join("\n  - ")}`
            );
        }
        expect(mismatches).toHaveLength(0);
    });

    it("every IDM event sisId matches the Data Browser person ID", () => {
        const mismatches = events.filter((ev) => {
            const person = findPerson(ev.user, ev.userType);
            return person && person.id !== ev.sisId;
        });
        if (mismatches.length > 0) {
            const info = mismatches.map(
                (ev) => `${ev.user}: event sisId=${ev.sisId}, DB id=${findPerson(ev.user, ev.userType)?.id}`
            );
            throw new Error(
                `IDM event sisId doesn't match Data Browser id:\n  - ${info.join("\n  - ")}`
            );
        }
        expect(mismatches).toHaveLength(0);
    });

    it("no duplicate people across IDM events", () => {
        const seen = new Set();
        const duplicates = [];
        for (const ev of events) {
            const key = `${ev.user}|${ev.userType}`;
            if (seen.has(key)) duplicates.push(key);
            seen.add(key);
        }
        expect(duplicates).toHaveLength(0);
    });
});
