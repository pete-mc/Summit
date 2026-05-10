import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

describe("Phase 3 calendar legend and range context", () => {
  it("shows list-range styling hooks and labels legend entries by invitee/section", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const css = fs.readFileSync(STYLES_PATH, "utf8");

    expect(source).toContain("item.event.invitee_name || item.event.section");
    expect(source).toContain("const key = `${item.color}|${label}`");
    expect(source).toContain("entries.push({ color: item.color, label })");
    expect(source).toContain("<span>{label}</span>");
    expect(source).toContain("renderCalendarLegend");
    expect(source).toContain('data-calendar-legend="visible"');
    expect(source).toContain('data-calendar-range-controls="visible"');
    expect(source).toContain("calendar-legend-swatch");
    expect(source).not.toContain('data-calendar-range-context="visible"');

    expect(css).toContain(".calendar-ux-toolbar");
    expect(css).toContain(".calendar-agenda-range-controls");
    expect(css).toContain(".calendar-agenda-range-label");
    expect(css).toContain(".calendar-agenda-presets");
    expect(css).toContain(".calendar-agenda-preset-active");
    expect(css).not.toContain(".calendar-range-context");
    expect(css).toContain(".calendar-legend");
    expect(css).toContain(".calendar-legend-swatch");
    expect(css).toContain(".calendar-selector-panel");
  });
});
