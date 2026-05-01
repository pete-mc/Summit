import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 5 calendar event CRUD contract", () => {
  it("keeps create/update/delete service flows wired through the FullCalendar interactions", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("createNewEvent(");
    expect(source).toContain("updateEvent(");
    expect(source).toContain("deleteEvent(");

    expect(source).toContain("handleDateSelect");
    expect(source).toContain("handleEventClick");
    expect(source).toContain("eventClick=");
    expect(source).toContain("select=");

    expect(source).not.toContain("actionBegin=");
    expect(source).not.toContain("actionComplete=");
    expect(source).not.toContain("popupOpen=");
    expect(source).not.toContain("scheduleComponent.current");
  });
});
