import { describe, it, expect } from "vitest";

// Copy the function for direct testing (same as in IDM.jsx)
function findProfileIdForEvent(ev, scenarioData) {
    const userType = ev.userType?.toLowerCase();
    const nameParts = ev.user?.split(" ") || [];
    const firstName = nameParts[0]?.toLowerCase();
    const lastName = nameParts[nameParts.length - 1]?.toLowerCase();

    let collection;
    if (userType === "student") collection = scenarioData.dataBrowser?.students;
    else if (userType === "teacher") collection = scenarioData.dataBrowser?.teachers;
    else if (userType === "staff") collection = scenarioData.dataBrowser?.staff;

    if (!collection || !firstName || !lastName) return null;

    const match = collection.find(
        (p) => p.first?.toLowerCase() === firstName && p.last?.toLowerCase() === lastName
    );
    return match ? { id: match.id, userType: ev.userType } : null;
}

const mockScenario = {
    dataBrowser: {
        students: [
            { id: "stu-1", first: "Annamarie", last: "Feest" },
            { id: "stu-2", first: "Remington", last: "Stoltenberg" },
        ],
        teachers: [
            { id: "tea-1", first: "Sierra", last: "Hirthe" },
        ],
        staff: [
            { id: "stf-1", first: "Percival", last: "Beier" },
        ],
    },
};

describe("findProfileIdForEvent", () => {
    it("finds a matching student", () => {
        const ev = { user: "Annamarie Feest", userType: "Student" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stu-1", userType: "Student" });
    });

    it("finds a matching teacher", () => {
        const ev = { user: "Sierra Hirthe", userType: "Teacher" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "tea-1", userType: "Teacher" });
    });

    it("finds a matching staff", () => {
        const ev = { user: "Percival Beier", userType: "Staff" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stf-1", userType: "Staff" });
    });

    it("returns null when no match found", () => {
        const ev = { user: "Nobody Exists", userType: "Student" };
        expect(findProfileIdForEvent(ev, mockScenario)).toBeNull();
    });

    it("returns null for empty user", () => {
        const ev = { user: "", userType: "Student" };
        expect(findProfileIdForEvent(ev, mockScenario)).toBeNull();
    });

    it("returns null for null scenario data", () => {
        const ev = { user: "Annamarie Feest", userType: "Student" };
        expect(findProfileIdForEvent(ev, {})).toBeNull();
    });

    it("is case-insensitive", () => {
        const ev = { user: "annamarie feest", userType: "Student" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stu-1", userType: "Student" });
    });

    it("handles middle names by using first and last parts", () => {
        const ev = { user: "Annamarie Finley Feest", userType: "Student" };
        const result = findProfileIdForEvent(ev, mockScenario);
        expect(result).toEqual({ id: "stu-1", userType: "Student" });
    });

    it("does not cross-match between user types", () => {
        const ev = { user: "Annamarie Feest", userType: "Teacher" };
        expect(findProfileIdForEvent(ev, mockScenario)).toBeNull();
    });
});
