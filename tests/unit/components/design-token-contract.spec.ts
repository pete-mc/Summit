import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

describe("Phase 6 design token contract", () => {
  it("defines reusable CSS tokens for spacing, typography, colour hierarchy, and component states", () => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");

    expect(css).toContain(":root {");

    expect(css).toContain("--summit-space-xs");
    expect(css).toContain("--summit-space-sm");
    expect(css).toContain("--summit-space-md");

    expect(css).toContain("--summit-font-size-sm");
    expect(css).toContain("--summit-font-size-md");
    expect(css).toContain("--summit-font-weight-semibold");

    expect(css).toContain("--summit-color-bg-primary");
    expect(css).toContain("--summit-color-bg-muted");
    expect(css).toContain("--summit-color-text-primary");
    expect(css).toContain("--summit-color-text-on-primary");
    expect(css).toContain("--summit-color-border-default");

    expect(css).toContain("--summit-focus-ring-color");
    expect(css).toContain("--summit-focus-ring-width");

    expect(css).toContain(".summit-button {");
    expect(css).toContain("var(--summit-space-sm)");
    expect(css).toContain("var(--summit-font-size-md)");
    expect(css).toContain(".summit-form-input {");
    expect(css).toContain("var(--summit-color-border-default)");
  });
});
