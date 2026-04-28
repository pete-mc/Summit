import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 1 calendar loading/empty/error UX contract", () => {
  it("defines baseline markers for loading, empty, and error states", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("calendarLoadState");
    expect(source).toContain("calendarLoadError");
    expect(source).toContain("data-calendar-load-state");
    expect(source).toContain('id="calendar-loading-state"');
    expect(source).toContain('id="calendar-empty-state"');
    expect(source).toContain('id="calendar-error-state"');
  });
});
