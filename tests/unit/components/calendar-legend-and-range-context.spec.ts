import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

describe("Phase 3 calendar legend and range context", () => {
  it("shows date-range context and an event colour legend with dedicated styling hooks", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const css = fs.readFileSync(STYLES_PATH, "utf8");

    expect(source).toContain("calendarRangeContextLabel");
    expect(source).toContain('data-calendar-range-context="visible"');
    expect(source).toContain("renderCalendarLegend");
    expect(source).toContain('data-calendar-legend="visible"');
    expect(source).toContain("calendar-legend-swatch");

    expect(css).toContain(".calendar-ux-toolbar");
    expect(css).toContain(".calendar-range-context");
    expect(css).toContain(".calendar-legend");
    expect(css).toContain(".calendar-legend-swatch");
    expect(css).toContain(".calendar-selector-panel");
  });
});
