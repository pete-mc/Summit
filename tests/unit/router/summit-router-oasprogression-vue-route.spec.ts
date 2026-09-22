import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

describe("SummitRouter registers the OAS Progression (Vue) route and nav entry", () => {
  const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/router/SummitRouter.ts"), "utf8");

  it("adds the new route alongside the existing OAS Progression route", () => {
    expect(source).toContain('path: "/summit/reports/oasprogression-vue"');
    expect(source).toContain("component: OasProgressionVue");
  });

  it("adds a nav menu entry for it under Reports", () => {
    expect(source).toContain('title: "OAS Progression (Vue)"');
    expect(source).toContain('to: "/summit/reports/oasprogression-vue"');
  });

  it("leaves the existing React OAS Progression route and nav entry unchanged", () => {
    expect(source).toContain('path: "/summit/reports/oasprogression"');
    expect(source).toContain('title: "OAS Progression"');
    expect(source).toContain("component: OasProgression,");
  });
});
