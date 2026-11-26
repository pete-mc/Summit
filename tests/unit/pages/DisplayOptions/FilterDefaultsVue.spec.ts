jest.mock("@/components/NameFormatSelect.vue", () => ({ __esModule: true, default: { name: "NameFormatSelect", render: () => null } }), { virtual: true });
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
    const showKeys = component.data().showOptions.map((option: { key: string }) => option.key);
    expect(["nameFormat", "sortBy", ...showKeys].sort()).toEqual(Object.keys(SYSTEM_FILTER_DEFAULTS).sort());
    expect(template).toContain("The Patrol selection defaults to All Patrols.");
  });

  it("labels the Show switches exactly as the report filters do", () => {
    expect(component.data().showOptions.map((option: { label: string }) => option.label)).toEqual(["Break by patrol", "Approved", "Skills not started", "Stages not started"]);
  });

  it("shows each Show setting as a labelled switch", () => {
    expect(template).toContain("<v-switch");
    expect(template).toContain(':input-value="defaults[option.key]"');
    expect(template).not.toContain("v-chip");
  });

  it("uses the report filters' compact controls", () => {
    expect(template).toContain("<NameFormatSelect");
    expect(template).toContain('class="oas-vue-filter-select"');
    expect(template).not.toContain("persistent-hint");
  });
});

describe("DisplayOptions page", () => {
  it("mounts the Vuetify tabs into its own div, with Filters as the first tab", () => {
    const vue = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/DisplayOptions.vue"), "utf8");
    const ts = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/DisplayOptions.ts"), "utf8");
    const tabs = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/components/DisplayOptionsTabsVue.vue"), "utf8");
    expect(vue).toContain('<div ref="vuetifyRoot"></div>');
    expect(ts).toContain("vuetify: window.summitVuetify");
    expect(ts).toContain("$destroy()");
    expect(tabs).toContain('<v-tab tab-value="filters">Filters</v-tab>');
  });

  // The old help-button setting hid Terrain's help button on every load; removing only the checkbox would strand it hidden.
  it("no longer has the help button setting anywhere", () => {
    const vue = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/DisplayOptions/DisplayOptions.vue"), "utf8");
    const store = fs.readFileSync(path.resolve(REPO_ROOT, "src/modules/summitModule.ts"), "utf8");
    expect(vue).not.toContain("helpbutton");
    expect(store).not.toContain("helpButton");
    expect(store).not.toContain("freshworks");
  });
});
