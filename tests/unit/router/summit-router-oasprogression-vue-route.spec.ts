import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

describe("SummitRouter routes OAS Progression to the Vue page and archives the legacy React page", () => {
  const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/router/SummitRouter.ts"), "utf8");

  it("routes the primary OAS Progression path to the Vue component", () => {
    expect(source).toContain('path: "/summit/reports/oasprogression"');
    expect(source).toContain("component: OasProgressionVue");
  });

  it("adds a single 'OAS Progression' nav menu entry pointing at the primary route", () => {
    expect(source).toContain('title: "OAS Progression"');
    expect(source).toContain('to: "/summit/reports/oasprogression"');
    expect(source).not.toContain("OAS Progression (Vue)");
  });

  it("keeps the legacy React OAS Progression page routable at a separate, unlinked path", () => {
    expect(source).toContain('path: "/summit/reports/oasprogression-legacy"');
    expect(source).toContain("component: OasProgression,");
    expect(source).not.toContain('to: "/summit/reports/oasprogression-legacy"');
  });
});
