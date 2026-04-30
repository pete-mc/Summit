import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const SUMMIT_CALENDAR_PATH = path.resolve(REPO_ROOT, "src/pages/SummitCalendar/components/SummitCalendar.tsx");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");
const PACKAGE_JSON_PATH = path.resolve(REPO_ROOT, "package.json");

const readCssRule = (css: string, selector: string): string => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escapedSelector}\\s*\\{[\\s\\S]*?\\}`))?.[0] ?? "";
};

describe("Phase 1 calendar editor layout spacing contract", () => {
  it("editor container defines explicit tokenized vertical spacing", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const editorContainerRule = readCssRule(css, ".editor-container");

    expect(editorContainerRule).toContain("display: flex");
    expect(editorContainerRule).toContain("flex-direction: column");
    expect(editorContainerRule).toMatch(/gap\s*:\s*var\(--summit-space-(sm|md|lg)\)/);
  });

  it("editor fields flow as block-level field groups instead of raw inline label content", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const editorFieldRule = readCssRule(css, ".editor-field");

    expect(source).toContain('className="editor-container"');
    expect(source).toContain('className="editor-field"');
    expect(editorFieldRule).toMatch(/display\s*:\s*(block|flex|grid)/);
    expect(editorFieldRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md)\)/);
  });

  it("documents executable browser-level visual coverage added for Phase 6", () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const browserSpecPath = path.resolve(REPO_ROOT, "tests/browser/calendar-editor-dialog-layout.spec.ts");
    const browserSpec = fs.readFileSync(browserSpecPath, "utf8");

    const expectedFutureBrowserCoverage = [
      "wide calendar editor dialog keeps field borders inside the dialog surface",
      "narrow calendar editor dialog avoids horizontal bleed",
      "calendar editor footer remains visible outside the scrolling body",
    ];

    expect(packageJson.scripts?.["test:browser"]).toBe("playwright test");
    expect(packageJson.devDependencies).toHaveProperty("@playwright/test");
    expect(browserSpec).toContain("wide viewport keeps borders and content inside the dialog with two-column date/time layout");
    expect(browserSpec).toContain("narrow viewport stacks date/time controls, keeps footer visible, and avoids horizontal bleed");
    expect(expectedFutureBrowserCoverage).toHaveLength(3);
    expectedFutureBrowserCoverage.forEach((coverageItem) => expect(coverageItem).toContain("calendar editor"));
  });
});

describe("Phase 2 calendar editor structured field layout contract", () => {
  it("editor template uses reusable field, label, control, and status hooks for major fields", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain('className="editor-field"');
    expect(source).toContain('className="editor-field-label"');
    expect(source).toContain('className="editor-field-control"');
    expect(source).toContain('className="editor-field-status"');

    ["title", "location", "challenge_area", "date_range", "scout_method_elements", "organisers", "leader_members", "assistant_members"].forEach((fieldId) => {
      expect(source).toContain(`data-editor-field="${fieldId}"`);
    });
  });

  it("field layout uses tokenized CSS hooks instead of raw label inline flow", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const editorFieldRule = readCssRule(css, ".editor-field");
    const editorFieldLabelRule = readCssRule(css, ".editor-field-label");
    const editorFieldControlRule = readCssRule(css, ".editor-field-control");
    const editorFieldStatusRule = readCssRule(css, ".editor-field-status");

    expect(source).not.toContain(".editor-container > label");
    expect(editorFieldRule).toMatch(/display\s*:\s*(flex|grid|block)/);
    expect(editorFieldRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md)\)/);
    expect(editorFieldLabelRule).toContain("var(--summit-font-weight-semibold)");
    expect(editorFieldControlRule).toMatch(/display\s*:\s*(flex|grid|block)/);
    expect(editorFieldControlRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md)\)/);
    expect(editorFieldStatusRule).toContain("var(--summit-font-size-sm)");
    expect(editorFieldStatusRule).toMatch(/color\s*:\s*var\(--summit-color-/);
    expect(css).toContain("--summit-color-text-danger");
    expect(readCssRule(css, ".editor-field-required")).toContain("var(--summit-color-text-danger)");
  });
});

describe("Phase 3 calendar editor date/time layout spacing contract", () => {
  it("places Start and End controls inside dedicated date/time layout wrappers", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toContain('className="editor-date-time-grid"');
    expect(source).toContain('className="editor-date-time-group"');
    expect(source).toContain('className="editor-date-time-label"');
    expect(source).toContain('className="editor-date-time-inputs"');

    const dateRangeField = source.match(/data-editor-field="date_range"[\s\S]*?data-editor-field="scout_method_elements"/)?.[0] ?? "";
    expect(dateRangeField).toContain('className="editor-date-time-grid"');
    expect(dateRangeField.match(/className="editor-date-time-group"/g)).toHaveLength(2);
    expect(dateRangeField).toMatch(/className="editor-date-time-label"[\s\S]*htmlFor="start_date"[\s\S]*Start/);
    expect(dateRangeField).toMatch(/className="editor-date-time-label"[\s\S]*htmlFor="end_date"[\s\S]*End/);
    expect(dateRangeField).toMatch(/className="editor-date-time-inputs"[\s\S]*id="start_date"[\s\S]*id="start_time"/);
    expect(dateRangeField).toMatch(/className="editor-date-time-inputs"[\s\S]*id="end_date"[\s\S]*id="end_time"/);
  });

  it("uses tokenized gaps and min-width safeguards to prevent adjacent date/time borders colliding", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const gridRule = readCssRule(css, ".editor-date-time-grid");
    const groupRule = readCssRule(css, ".editor-date-time-group");
    const inputsRule = readCssRule(css, ".editor-date-time-inputs");

    expect(gridRule).toMatch(/display\s*:\s*grid/);
    expect(gridRule).toMatch(/gap\s*:\s*var\(--summit-space-(sm|md|lg)\)/);
    expect(gridRule).toContain("minmax(0, 1fr)");
    expect(groupRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md)\)/);
    expect(groupRule).toMatch(/min-width\s*:\s*0/);
    expect(inputsRule).toMatch(/display\s*:\s*(grid|flex)/);
    expect(inputsRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md)\)/);
    expect(inputsRule).toMatch(/min-width\s*:\s*0/);
  });

  it("uses two columns when space allows and stacks date/time groups on narrow widths", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const gridRule = readCssRule(css, ".editor-date-time-grid");
    const narrowLayoutRule = css.match(/@media\s*\([^)]*max-width[^)]*\)\s*\{[\s\S]*?\.editor-date-time-grid\s*\{[\s\S]*?\}\s*\}/)?.[0] ?? "";
    const narrowInputsRule = css.match(/@media\s*\([^)]*max-width[^)]*\)\s*\{[\s\S]*?\.editor-date-time-inputs\s*\{[\s\S]*?\}\s*\}/)?.[0] ?? "";

    expect(gridRule).toMatch(/grid-template-columns\s*:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
    expect(narrowLayoutRule).toContain(".editor-date-time-grid");
    expect(narrowLayoutRule).toMatch(/grid-template-columns\s*:\s*minmax\(0,\s*1fr\)/);
    expect(narrowInputsRule).toContain(".editor-date-time-inputs");
    expect(narrowInputsRule).toMatch(/grid-template-columns\s*:\s*minmax\(0,\s*1fr\)/);
  });

  it("keeps date range validation and conflict warning hooks discoverable after date/time grouping", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const dateRangeField = source.match(/data-editor-field="date_range"[\s\S]*?data-editor-field="scout_method_elements"/)?.[0] ?? "";

    expect(dateRangeField).toContain('data-editor-validation="date_range"');
    expect(dateRangeField).toContain('data-editor-warning="event-conflicts"');
    expect(dateRangeField).toContain('className="editor-field-status"');
    expect(dateRangeField).toContain('className="editor-field-help"');
    expect(dateRangeField.indexOf('data-editor-validation="date_range"')).toBeGreaterThan(dateRangeField.indexOf('className="editor-date-time-grid"'));
    expect(dateRangeField.indexOf('data-editor-warning="event-conflicts"')).toBeGreaterThan(dateRangeField.indexOf('className="editor-date-time-grid"'));
  });
});

describe("Phase 5 calendar editor footer action layout contract", () => {
  it("calendar editor footer and action group expose dedicated flex layout hooks with tokenized wrapping gaps", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const footerRule = readCssRule(css, ".calendar-editor-footer");
    const actionsRule = readCssRule(css, ".calendar-editor-actions");

    expect(source).toContain('id="event-footer"');
    expect(source).toContain('className="calendar-editor-footer"');
    expect(source).toContain('id="right-button"');
    expect(source).toContain('className="calendar-editor-actions"');

    expect(footerRule).toMatch(/display\s*:\s*flex/);
    expect(footerRule).toMatch(/justify-content\s*:\s*flex-end/);
    expect(footerRule).toMatch(/width\s*:\s*100%/);

    expect(actionsRule).toMatch(/display\s*:\s*(inline-)?flex/);
    expect(actionsRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md|lg)\)/);
    expect(actionsRule).toMatch(/flex-wrap\s*:\s*wrap/);
    expect(actionsRule).toMatch(/align-items\s*:\s*center/);
    expect(actionsRule).toMatch(/justify-content\s*:\s*flex-end/);
  });

  it("calendar editor button spacing is owned by the action group instead of relying only on global summit-button margin-left", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");
    const globalButtonRule = readCssRule(css, ".summit-button");
    const actionsRule = readCssRule(css, ".calendar-editor-actions");
    const scopedButtonRule = readCssRule(css, ".calendar-editor-actions .summit-button");

    expect(globalButtonRule).toMatch(/margin-left\s*:\s*var\(--summit-space-sm\)/);
    expect(actionsRule).toMatch(/gap\s*:\s*var\(--summit-space-(xs|sm|md|lg)\)/);
    expect(scopedButtonRule).toMatch(/margin-left\s*:\s*0/);
  });

  it("calendar editor actions remain in the shared custom footer path outside scrollable content", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");

    expect(source).toMatch(/id="calendar-editor-dialog"[\s\S]*footer=\{!this\.state\.editorIsLoading \? this\.editorFooterTemplate\(\) : undefined\}/);

    const scrollableChildMatch = source.match(/data-editor-speed-contract="calendar-editor-speed"[\s\S]*?<\/div>\s*<\/DialogComponent>/);
    expect(scrollableChildMatch).not.toBeNull();
    expect(scrollableChildMatch![0]).not.toContain("editorFooterTemplate()");
    expect(scrollableChildMatch![0]).not.toContain("calendar-editor-footer");
  });

  it("Save, Delete, Open, and Cancel actions keep discoverable hooks and existing behavior wiring", () => {
    const source = fs.readFileSync(SUMMIT_CALENDAR_PATH, "utf8");
    const footerTemplate = source.match(/editorFooterTemplate = \(\) => \{[\s\S]*?\n  dialogButtons = \[/)?.[0] ?? "";

    ["save-next-week", "delete", "open-terrain", "save", "cancel"].forEach((action) => {
      expect(footerTemplate).toContain(`data-editor-action="${action}"`);
    });

    expect(footerTemplate).toContain("onClick={() => this.saveActivity(true)}");
    expect(footerTemplate).toContain('deleteEvent(this.state.activity?.id || "")');
    expect(footerTemplate).toContain("onClick={this.openTerrainDialog}");
    expect(footerTemplate).toContain("onClick={() => this.saveActivity()}");
    expect(footerTemplate).toContain("onClick={this.closeEditor}");
  });
});
