import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 4 save with warning allowed contract", () => {
  it("keeps save non-blocking even when soft conflict warnings are present", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("detectSummitCalendarSoftConflicts");
    expect(source).toContain("setState({ editorSoftConflictWarnings");
    expect(source).toContain("createNewEvent(");
    expect(source).toContain("updateEvent(");
    expect(source).not.toContain("if (softConflictWarnings.length) return;");
  });
});
