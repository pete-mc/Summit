import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const BUILD_WORKFLOW_PATH = path.resolve(REPO_ROOT, ".github/workflows/build.yaml");
const README_PATH = path.resolve(REPO_ROOT, "README.md");
const ENV_PATH = path.resolve(REPO_ROOT, ".env");

describe("phase 6 cleanup guard: build without license key", () => {
  it("does not expose Syncfusion license activation hooks", () => {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };

    const scriptValues = Object.values(packageJson.scripts ?? {});
    const scriptNames = Object.keys(packageJson.scripts ?? {});

    expect(scriptNames.some((name) => /licen[cs]e/i.test(name))).toBe(false);
    expect(scriptValues.some((value) => /syncfusion-license|SYNCFUSION_LICENSE/i.test(value))).toBe(false);

    const workflow = fs.readFileSync(BUILD_WORKFLOW_PATH, "utf8");
    expect(workflow).not.toMatch(/syncfusion-license|SYNCFUSION_LICENSE/i);

    const readme = fs.readFileSync(README_PATH, "utf8");
    expect(readme).not.toMatch(/syncfusion-license|SYNCFUSION_LICENSE|Syncfusion license activation/i);

    if (fs.existsSync(ENV_PATH)) {
      const envFile = fs.readFileSync(ENV_PATH, "utf8");
      expect(envFile).not.toMatch(/SYNCFUSION_LICENSE|syncfusion/i);
    }
  });
});
