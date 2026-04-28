import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 5 calendar editor integration contract", () => {
  it("uses explicit React dialog state for calendar editor instead of Syncfusion popup templates", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("isEditorOpen");
    expect(source).toContain('id="calendar-editor-dialog"');
    expect(source).toContain("editorIsLoading");

    expect(source).not.toContain("popupOpen=");
    expect(source).not.toContain("popupClose=");
    expect(source).not.toContain("quickInfoTemplates");
  });
});
