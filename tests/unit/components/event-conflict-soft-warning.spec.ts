import { detectSummitCalendarSoftConflicts } from "@/helpers/SummitCalendarValidation";

describe("Phase 4 event conflict soft warning detection", () => {
  const buildActivity = () => ({
    id: "new-event",
    title: "Planning Night",
    start_datetime: "2026-05-01T10:00:00.000Z",
    end_datetime: "2026-05-01T11:00:00.000Z",
  });

  it("returns warnings when another event overlaps with the edited event", () => {
    const warnings = detectSummitCalendarSoftConflicts(buildActivity(), [
      {
        Id: "existing-1",
        Subject: "Hike prep",
        StartTime: new Date("2026-05-01T10:30:00.000Z"),
        EndTime: new Date("2026-05-01T12:00:00.000Z"),
      },
    ]);

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Hike prep");
    expect(warnings[0]).toContain("Potential conflict");
  });

  it("does not return warnings when overlaps do not exist", () => {
    const warnings = detectSummitCalendarSoftConflicts(buildActivity(), [
      {
        Id: "existing-2",
        Subject: "Camp setup",
        StartTime: new Date("2026-05-01T12:00:00.000Z"),
        EndTime: new Date("2026-05-01T13:00:00.000Z"),
      },
    ]);

    expect(warnings).toEqual([]);
  });
});
