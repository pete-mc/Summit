import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

describe("SummitRouter routes OAS Progression to the Vue page", () => {
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

  it("no longer has a legacy React OAS Progression route", () => {
    expect(source).not.toContain("oasprogression-legacy");
    expect(source).not.toContain("OasProgression,");
  });
});
