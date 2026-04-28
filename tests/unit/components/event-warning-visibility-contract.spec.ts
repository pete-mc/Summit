import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 4 warning visibility contract", () => {
  it("renders soft conflict warnings inside the editor with stable hooks", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("editorSoftConflictWarnings");
    expect(source).toContain("detectSummitCalendarSoftConflicts");
    expect(source).toContain('data-editor-warning="event-conflicts"');
    expect(source).toContain("Potential conflict");
  });
});
