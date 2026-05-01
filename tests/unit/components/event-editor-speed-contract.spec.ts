import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 1 event editor speed proxy contract", () => {
  it("includes non-functional instrumentation markers for editor responsiveness proxies", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("data-editor-speed-contract");
    expect(source).toContain("data-editor-open-proxy");
    expect(source).toContain("data-editor-loading-proxy");
    expect(source).toContain('data-editor-action="save-next-week"');
    expect(source).toContain('data-editor-action="save"');
    expect(source).toContain('data-editor-action="cancel"');
  });
});
