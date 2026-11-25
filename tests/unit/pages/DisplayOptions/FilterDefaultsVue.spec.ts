jest.mock("@/components/SummitPillButton.vue", () => ({ __esModule: true, default: { name: "SummitPillButton", render: () => null } }), { virtual: true });
jest.mock("@/helpers", () => ({ __esModule: true, showTerrainToast: jest.fn() }));

import * as fs from "fs";
import * as path from "path";
import FilterDefaultsVue from "@/pages/DisplayOptions/components/FilterDefaultsVue";
import { loadFilterDefaults, loadFilterDefaultsAppliedAt, saveFilterDefaults, SYSTEM_FILTER_DEFAULTS } from "@/shared/filterDefaults";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const template = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/components/FilterDefaultsVue.vue"), "utf8");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const component = FilterDefaultsVue as any;

function makeContext() {
  return { ...component.data(), ...component.methods };
}

describe("FilterDefaultsVue", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows the saved defaults", () => {
    saveFilterDefaults({ ...SYSTEM_FILTER_DEFAULTS, nameFormat: "codename" });
    expect(component.data().defaults.nameFormat).toBe("codename");
  });

  it("saves each change straight away", () => {
    const context = makeContext();
    context.update({ sortBy: "lastName" });
    context.update({ showApproved: false });
    expect(loadFilterDefaults()).toEqual({ ...SYSTEM_FILTER_DEFAULTS, sortBy: "lastName", showApproved: false });
  });

  it("Reset to system defaults restores Summit's values without applying them to pages", () => {
    const context = makeContext();
    context.update({ nameFormat: "first", breakByPatrol: true });

    context.resetToSystemDefaults();

    expect(context.defaults).toEqual(SYSTEM_FILTER_DEFAULTS);
    expect(loadFilterDefaults()).toEqual(SYSTEM_FILTER_DEFAULTS);
    expect(loadFilterDefaultsAppliedAt()).toBeNull();
  });

  it("Apply only happens from the confirm dialog", () => {
    expect(template).toContain('@click="confirmApplyOpen = true">Apply defaults to all pages');
    expect(template).toContain('<v-btn text @click="confirmApplyOpen = false">Cancel</v-btn>');
    expect(template).toContain('@click="applyToAllPages">Apply</v-btn>');
    expect(loadFilterDefaultsAppliedAt()).toBeNull();
  });

  it("confirming Apply stamps the time and closes the dialog", () => {
    const context = makeContext();
    context.confirmApplyOpen = true;

    context.applyToAllPages();

    expect(loadFilterDefaultsAppliedAt()).not.toBeNull();
    expect(context.confirmApplyOpen).toBe(false);
  });

  it("lists every common default except Patrol, which is locked to All Patrols", () => {
    const switchKeys = component.data().switches.map((s: { key: string }) => s.key);
    expect(["nameFormat", "sortBy", ...switchKeys].sort()).toEqual(Object.keys(SYSTEM_FILTER_DEFAULTS).sort());
    expect(template).toContain("Patrol filters always start at All Patrols.");
  });
});

describe("DisplayOptions page", () => {
  it("mounts the Vuetify filter defaults section into its own div", () => {
    const vue = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/DisplayOptions.vue"), "utf8");
    const ts = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/DisplayOptions.ts"), "utf8");
    expect(vue).toContain('<div ref="filterDefaultsRoot"></div>');
    expect(ts).toContain("vuetify: window.summitVuetify");
    expect(ts).toContain("$destroy()");
  });
});
