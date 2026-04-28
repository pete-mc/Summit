import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 5 calendar view switching contract", () => {
  it("uses FullCalendar community edition with explicit view-switching toolbar", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("@fullcalendar/react");
    expect(source).toContain("@fullcalendar/daygrid");
    expect(source).toContain("@fullcalendar/timegrid");
    expect(source).toContain("@fullcalendar/list");
    expect(source).toContain("@fullcalendar/interaction");

    expect(source).toContain("headerToolbar");
    expect(source).toContain('initialView="dayGridMonth"');
    expect(source).toContain("dayGridMonth");
    expect(source).toContain("timeGridWeek");
    expect(source).toContain("timeGridDay");
    expect(source).toContain("listWeek");

    expect(source).not.toContain("@syncfusion/ej2-react-schedule");
    expect(source).not.toContain("<ScheduleComponent");
    expect(source).not.toContain("@syncfusion");
  });
});
