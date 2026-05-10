import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");
const STYLES_TYPES_PATH = path.resolve(REPO_ROOT, "src/types/styles.d.ts");

describe("Phase 3 revision typing contracts", () => {
  it("uses a compatibility ref cast for FullCalendar", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain("ref={this.calendarRef as any}");
  });

  it("declares the react-datepicker side-effect css module", () => {
    const source = fs.readFileSync(STYLES_TYPES_PATH, "utf8");

    expect(source).toContain('declare module "react-datepicker/dist/react-datepicker.css";');
    expect(source).not.toMatch(/^\s*import\s/m);
  });
});
