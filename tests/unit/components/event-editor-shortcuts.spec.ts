import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 2 event editor keyboard shortcuts", () => {
  it("supports ctrl/cmd + s save shortcuts for a faster editor workflow", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("handleEditorKeyDown");
    expect(source).toContain("event.ctrlKey || event.metaKey");
    expect(source).toContain('event.key.toLowerCase() === "s"');
    expect(source).toContain("event.preventDefault()");
    expect(source).toContain("this.saveActivity()");
    expect(source).toContain('data-editor-shortcuts="enabled"');
  });
});
