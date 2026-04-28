import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 3 calendar quick filters", () => {
  it("provides discoverable quick-filter controls and applies a selected filter to rendered events", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("calendarQuickFilter");
    expect(source).toContain("setCalendarQuickFilter");
    expect(source).toContain('data-calendar-quick-filters="enabled"');
    expect(source).toContain('data-calendar-quick-filter="all"');
    expect(source).toContain('data-calendar-quick-filter="next7days"');
    expect(source).toContain('data-calendar-quick-filter="thisMonth"');
    expect(source).toContain("applyCalendarQuickFilter");
  });
});
