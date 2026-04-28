import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

describe("Phase 6 focus ring and contrast contract", () => {
  it("applies a consistent keyboard focus ring and accessible primary contrast pair", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");

    expect(css).toContain(".summit-button:focus-visible");
    expect(css).toContain(".summit-form-input:focus-visible");
    expect(css).toContain("outline: var(--summit-focus-ring-width) solid var(--summit-focus-ring-color)");
    expect(css).toContain("outline-offset: 2px");

    expect(css).toContain("--summit-color-bg-primary");
    expect(css).toContain("--summit-color-text-on-primary");
    expect(css).toContain(".summit-button-primary {");
    expect(css).toContain("background: var(--summit-color-bg-primary)");
    expect(css).toContain("color: var(--summit-color-text-on-primary)");
  });
});
