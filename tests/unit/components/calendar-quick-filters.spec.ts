import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 3 calendar quick filters", () => {
  it("provides list-range controls with presets and custom date-range handling for list views", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("AgendaRangePreset");
    expect(source).toContain("getAgendaRangePreset");
    expect(source).toContain("handleAgendaPresetSelect");
    expect(source).toContain("handleListRangePickerChange");

    expect(source).toContain('data-calendar-range-controls="visible"');
    expect(source).toContain('aria-label="List quick select"');
    expect(source).toContain("calendarApi.changeView(viewName)");
    expect(source).toContain('calendarApi.changeView("listRange"');

    expect(source).not.toContain("calendarQuickFilter");
    expect(source).not.toContain("applyCalendarQuickFilter");
  });
});
