import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 3 keyboard new-event behavior", () => {
  it("supports an n-key shortcut to open the new-event editor from the calendar surface", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("handleSchedulerKeyDown");
    expect(source).toContain("shouldIgnoreSchedulerShortcut");
    expect(source).toContain('event.key.toLowerCase() === "n"');
    expect(source).toContain("this.newActivity");
    expect(source).toContain('data-calendar-shortcuts="new-event"');
  });
});
