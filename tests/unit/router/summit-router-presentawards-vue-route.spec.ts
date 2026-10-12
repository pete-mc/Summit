import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");

/**
 * Jest cannot import .vue files in this project, so route/nav registration is asserted against the
 * source text — the same approach as summit-router-oasprogression-vue-route.spec.ts.
 *
 * The Vue rebuild is the only Present Awards page. The React original, archived at -legacy for a
 * while, was deleted 2026-10-12; its model and storage service stay under src/pages/PresentAwards/
 * (models/, services/) because the Vue page uses them.
 */
describe("SummitRouter routes Present Awards to the Vue page", () => {
  const routerSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/router/SummitRouter.ts"), "utf8");
  const pagesBarrelSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/index.ts"), "utf8");
  const homeSource = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/Home/Home.vue"), "utf8");

  it("routes the Present Awards path to the Vue component", () => {
    expect(routerSource).toContain('path: "/summit/tools/PresentAwards"');
    expect(routerSource).toContain("component: PresentAwardsVue,");
  });

  it("shows a single 'Present Awards' nav entry pointing at that route", () => {
    expect(routerSource).toContain('title: "Present Awards"');
    expect(routerSource).toContain('to: "/summit/tools/PresentAwards"');
    expect(routerSource).not.toContain("Present Awards (Vue)");
  });

  it("no longer has the legacy React page, its route, or any link to it", () => {
    expect(routerSource).not.toContain("presentawards-legacy");
    expect(routerSource).not.toContain("component: PresentAwards,");
    expect(homeSource).not.toContain("presentawards-legacy");
    expect(pagesBarrelSource).not.toContain('import PresentAwards from "./PresentAwards/PresentAwards.vue"');
    expect(fs.existsSync(path.resolve(REPO_ROOT, "src/pages/PresentAwards/PresentAwards.vue"))).toBe(false);
    expect(fs.existsSync(path.resolve(REPO_ROOT, "src/pages/PresentAwards/components/PresentAwards.tsx"))).toBe(false);
  });

  it("keeps the model and storage service the Vue page depends on", () => {
    expect(fs.existsSync(path.resolve(REPO_ROOT, "src/pages/PresentAwards/models/SummitAchievement.ts"))).toBe(true);
    expect(fs.existsSync(path.resolve(REPO_ROOT, "src/pages/PresentAwards/services/awardStorageEvent.ts"))).toBe(true);
  });

  it("exports the Vue page from the pages barrel", () => {
    expect(pagesBarrelSource).toContain('import PresentAwardsVue from "./PresentAwardsVue/PresentAwardsVue.vue"');
    expect(pagesBarrelSource).toContain("PresentAwardsVue,");
  });
});
