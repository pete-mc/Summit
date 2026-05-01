import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");
const DATA_GRID_PATH = path.resolve(REPO_ROOT, "src/components/DataGrid.tsx");
const DIALOG_COMPONENT_PATH = path.resolve(REPO_ROOT, "src/components/DialogComponent.tsx");
const SIMPLE_DROPDOWN_PATH = path.resolve(REPO_ROOT, "src/components/SimpleDropdown.tsx");
const DATETIME_INPUTS_PATH = path.resolve(REPO_ROOT, "src/components/DateTimeInputs.tsx");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");

describe("Phase 6 UI consistency smoke", () => {
  it("reuses shared visual primitives across calendar, editor, dialog, and data grid", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const gridSource = fs.readFileSync(DATA_GRID_PATH, "utf8");
    const dialogSource = fs.readFileSync(DIALOG_COMPONENT_PATH, "utf8");
    const dropdownSource = fs.readFileSync(SIMPLE_DROPDOWN_PATH, "utf8");
    const dateTimeSource = fs.readFileSync(DATETIME_INPUTS_PATH, "utf8");
    const calendarSource = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(css).toContain(".summit-dialog-surface");
    expect(css).toContain(".summit-dialog-header");
    expect(css).toContain(".summit-dialog-title");

    expect(gridSource).toContain('className="summit-button summit-button-secondary"');
    expect(gridSource).toContain('className="summit-form-input"');

    expect(dropdownSource).toContain('className="summit-form-input"');
    expect(dateTimeSource).toContain('className="summit-form-input"');

    expect(dialogSource).toContain('className="summit-dialog-surface"');
    expect(dialogSource).toContain('className="summit-dialog-header"');

    expect(calendarSource).toContain('className="summit-button summit-button-secondary"');
    expect(calendarSource).toContain('className="summit-form-input"');
  });
});
