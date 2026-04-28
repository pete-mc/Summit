import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 2 event editor inline validation contract", () => {
  it("uses inline validation state instead of alert-driven validation interruptions", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("editorValidationErrors");
    expect(source).toContain("setEditorValidationErrors");
    expect(source).toContain('data-editor-validation="title"');
    expect(source).toContain('data-editor-validation="location"');
    expect(source).toContain('data-editor-validation="challenge_area"');
    expect(source).toContain('data-editor-validation="date_range"');

    expect(source).not.toContain("alert(firstError)");
  });
});
