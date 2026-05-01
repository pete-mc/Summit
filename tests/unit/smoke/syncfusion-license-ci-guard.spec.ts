import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const BUILD_WORKFLOW_PATH = path.resolve(REPO_ROOT, ".github/workflows/build.yaml");

describe("syncfusion license CI guard expectations", () => {
  it("ensures license activation hooks are removed", () => {
    expect(fs.existsSync(BUILD_WORKFLOW_PATH)).toBe(true);

    const workflow = fs.readFileSync(BUILD_WORKFLOW_PATH, "utf8");
    expect(workflow).not.toMatch(/syncfusion-license|SYNCFUSION_LICENSE/i);

    const packageJsonPath = path.resolve(REPO_ROOT, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as { scripts?: Record<string, string> };
    const scripts = packageJson.scripts ?? {};

    expect(Object.keys(scripts).some((name) => /licen[cs]e/i.test(name))).toBe(false);
    expect(Object.values(scripts).some((command) => /syncfusion-license|SYNCFUSION_LICENSE/i.test(command))).toBe(false);
  });
});
