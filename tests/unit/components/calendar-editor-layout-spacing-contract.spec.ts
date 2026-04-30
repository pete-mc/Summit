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

  it("documents browser-level visual coverage expectations without adding unsupported tooling in Phase 1", () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const availableScripts = Object.keys(packageJson.scripts ?? {});
    const availableDevDependencies = Object.keys(packageJson.devDependencies ?? {});
    const hasBrowserHarness = [...availableScripts, ...availableDevDependencies].some((name) => /playwright|cypress|webdriver|puppeteer/i.test(name));

    const expectedFutureBrowserCoverage = [
      "wide calendar editor dialog keeps field borders inside the dialog surface",
      "narrow calendar editor dialog avoids horizontal bleed",
      "calendar editor footer remains visible outside the scrolling body",
    ];

    expect(hasBrowserHarness).toBe(false);
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
