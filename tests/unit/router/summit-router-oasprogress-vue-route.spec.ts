import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

describe("SummitRouter routes OAS Progress to the Vue page", () => {
  const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/router/SummitRouter.ts"), "utf8");

  it("routes the primary OAS Progress path to the Vue component", () => {
    expect(source).toContain('path: "/summit/reports/oasprogress"');
    expect(source).toContain("component: OasProgressVue");
  });

  it("adds a single 'OAS Progress' nav menu entry pointing at the primary route", () => {
    expect(source).toContain('title: "OAS Progress"');
    expect(source).toContain('to: "/summit/reports/oasprogress"');
    expect(source).not.toContain("OAS Progress (Vue)");
  });

  it("no longer has a legacy React OAS Progress route", () => {
    expect(source).not.toContain("oasprogress-legacy");
    expect(source).not.toContain("OasProgress,");
  });
});
