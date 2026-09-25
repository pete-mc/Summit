import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/**
 * Jest cannot import .vue files in this project (no vue transform configured, and
 * @vue/test-utils isn't installed), so route/nav registration is asserted against the router
 * source text — the same approach as summit-router-oasprogression-vue-route.spec.ts.
 */
describe("SummitRouter registers the Present Awards Vue replica alongside the React page", () => {
  const routerSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/router/SummitRouter.ts"), "utf8");
  const pagesBarrelSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/index.ts"), "utf8");

  it("routes the Vue replica to its own path", () => {
    expect(routerSource).toContain('path: "/summit/tools/presentawards-vue"');
    expect(routerSource).toContain("component: PresentAwardsVue,");
  });

  it("leaves the existing React Present Awards route untouched", () => {
    expect(routerSource).toContain('path: "/summit/tools/PresentAwards"');
    expect(routerSource).toContain("component: PresentAwards,");
  });

  it("adds a nav menu entry for the Vue replica", () => {
    expect(routerSource).toContain('title: "Present Awards (Vue)"');
    expect(routerSource).toContain('to: "/summit/tools/presentawards-vue"');
  });

  it("keeps the React page's own nav entry, so both are reachable for comparison", () => {
    expect(routerSource).toContain('title: "Present Awards"');
    expect(routerSource).toContain('to: "/summit/tools/PresentAwards"');
  });

  it("exports the new page from the pages barrel", () => {
    expect(pagesBarrelSource).toContain('import PresentAwardsVue from "./PresentAwardsVue/PresentAwardsVue.vue"');
    expect(pagesBarrelSource).toContain("PresentAwardsVue,");
  });
});
