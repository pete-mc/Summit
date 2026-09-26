import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/**
 * Jest cannot import .vue files in this project, so route/nav registration is asserted against the
 * source text — the same approach as summit-router-oasprogression-vue-route.spec.ts.
 *
 * The Vue rebuild has taken over the primary Present Awards route; the React original is archived
 * at -legacy, unlinked from the nav, and reachable from the Home page's Development tools list.
 */
describe("SummitRouter promotes the Present Awards Vue page and archives the React original", () => {
  const routerSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/router/SummitRouter.ts"), "utf8");
  const pagesBarrelSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/index.ts"), "utf8");
  const homeSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/Home/Home.vue"), "utf8");
  const legacyPageSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/PresentAwards/PresentAwards.vue"), "utf8");

  it("routes the primary Present Awards path to the Vue component", () => {
    expect(routerSource).toContain('path: "/summit/tools/PresentAwards"');
    expect(routerSource).toContain("component: PresentAwardsVue,");
  });

  it("keeps the React page routable at a separate, unlinked path", () => {
    expect(routerSource).toContain('path: "/summit/tools/presentawards-legacy"');
    expect(routerSource).toContain("component: PresentAwards,");
  });

  it("shows a single 'Present Awards' nav entry pointing at the primary route", () => {
    expect(routerSource).toContain('title: "Present Awards"');
    expect(routerSource).toContain('to: "/summit/tools/PresentAwards"');
    expect(routerSource).not.toContain("Present Awards (Vue)");
  });

  it("does not link the legacy page from the nav menu", () => {
    expect(routerSource).not.toContain('to: "/summit/tools/presentawards-legacy"');
  });

  it("links the legacy page from the Home page's development tools", () => {
    expect(homeSource).toContain('to="/summit/tools/presentawards-legacy"');
  });

  it("marks the legacy page as retired and points at the current one", () => {
    expect(legacyPageSource).toContain("Present Awards (legacy)");
    expect(legacyPageSource).toContain('to="/summit/tools/PresentAwards"');
  });

  it("exports both pages from the pages barrel", () => {
    expect(pagesBarrelSource).toContain('import PresentAwardsVue from "./PresentAwardsVue/PresentAwardsVue.vue"');
    expect(pagesBarrelSource).toContain("PresentAwardsVue,");
    expect(pagesBarrelSource).toContain('import PresentAwards from "./PresentAwards/PresentAwards.vue"');
  });
});
