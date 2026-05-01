import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 2 event editor defaults and layout contract", () => {
  it("applies speed-oriented defaults and compact grouped layout hooks", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("buildEditorDefaults");
    expect(source).toContain('data-editor-layout="compact"');
    expect(source).toContain('data-editor-default="title"');
    expect(source).toContain('data-editor-default="location"');
    expect(source).toContain("focusTitleInput");
  });
});
