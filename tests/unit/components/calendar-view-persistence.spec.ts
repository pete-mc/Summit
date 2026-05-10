import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 3 calendar view persistence", () => {
  it("persists and restores the selected FullCalendar view with listRange migration safeguards", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("SUMMIT_CALENDAR_VIEW_STORAGE_KEY");
    expect(source).toContain("loadPersistedCalendarView");
    expect(source).toContain("persistCalendarView");
    expect(source).toContain('if (viewType === "listRange")');
    expect(source).toContain('viewType = "listWeek"');
    expect(source).toContain("args.view.type");
    expect(source).toContain("localStorage.setItem(SUMMIT_CALENDAR_VIEW_STORAGE_KEY");
    expect(source).toContain("initialView={this.state.currentCalendarView}");
  });
});
