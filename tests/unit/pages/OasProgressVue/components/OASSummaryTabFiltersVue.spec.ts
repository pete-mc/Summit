// Gotcha: Jest can't parse .vue files, so stub NameFormatSelect.
jest.mock("@/components/NameFormatSelect.vue", () => ({ __esModule: true, default: { name: "NameFormatSelect", render: () => null } }), { virtual: true });

import OASSummaryTabFiltersVue from "@/pages/OasProgressVue/components/OASSummaryTabFiltersVue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const options = OASSummaryTabFiltersVue as any;

function showOptions(props: { showNotStartedSkills: boolean | null; availablePatrols: string[] }) {
  return options.computed.showOptions.call(props) as Array<{ value?: string }>;
}

function showValues(props: { showNotStartedSkills: boolean | null; availablePatrols: string[] }) {
  return showOptions(props)
    .map((i) => i.value)
    .filter(Boolean);
}

describe("OASSummaryTabFiltersVue Show menu", () => {
  it("offers Not Started only when the tab passes a value for it (Summary, not Peak Award)", () => {
    expect(showValues({ showNotStartedSkills: true, availablePatrols: ["Eagles"] })).toEqual(["showNotStartedSkills", "breakByPatrol"]);
    expect(showValues({ showNotStartedSkills: null, availablePatrols: ["Eagles"] })).toEqual(["breakByPatrol"]);
  });

  it("has no options at all for Peak Award in a unit without patrols, so the menu is hidden", () => {
    expect(showOptions({ showNotStartedSkills: null, availablePatrols: [] })).toEqual([]);
  });

  it("emits one update per option, so each tab's .sync binding writes its own key", () => {
    const emitted: Array<[string, unknown]> = [];
    const context = { showOptions: showOptions({ showNotStartedSkills: true, availablePatrols: ["Eagles"] }), $emit: (e: string, v: unknown) => emitted.push([e, v]) };

    options.methods.onShowChange.call(context, ["breakByPatrol"]);

    expect(emitted).toEqual([
      ["update:showNotStartedSkills", false],
      ["update:breakByPatrol", true],
    ]);
  });
});
