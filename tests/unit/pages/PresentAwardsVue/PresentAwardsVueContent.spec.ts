import Vue from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

// The content component's .vue sibling imports the table's .vue file, which Jest cannot parse
// (vue-loader only merges template + external script at webpack build time). Stub it so the
// options object under test can be required — the table is covered by its own logic tests.
jest.mock("@/pages/PresentAwardsVue/components/PresentAwardsTableVue.vue", () => ({ __esModule: true, default: { name: "PresentAwardsTableVue", render: () => null } }), { virtual: true });

import PresentAwardsVueContent, { NOTHING_SELECTED_MESSAGE, SAVED_MESSAGE } from "@/pages/PresentAwardsVue/components/PresentAwardsVueContent";

function makeMember(id: string, firstName: string): TerrainUnitMember {
  return {
    id,
    member_number: "123",
    first_name: firstName,
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
  };
}

function makeItem(id: string, options: { memberId?: string; awardedOn?: string; presentedOn?: string } = {}): SummitAchievement {
  const achievement = {
    id,
    member_id: options.memberId ?? "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: TerrainAchievementsType.IntroScouting as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: options.awardedOn ?? "2026-03-05T00:00:00.000Z",
  } as TerrainAchievements;

  const item = new SummitAchievement(achievement, makeMember(options.memberId ?? "member-1", "Alex"), []);
  if (options.presentedOn) item.updatePresented(options.presentedOn);
  return item;
}

/**
 * The component is a plain Vue 2 options object, so it can be instantiated directly without a
 * template or DOM — the approach .claude/OASProgression/PLAN_VUESTAGE_2.md establishes for this
 * project, since Jest here cannot import .vue files.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountContent(items: SummitAchievement[], onSave?: (presented: SummitAchievement[]) => Promise<string | null>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor: any = Vue.extend(PresentAwardsVueContent as any);
  return new Ctor({ propsData: { items, loadState: "ready", onSave } });
}

describe("PresentAwardsVueContent — edit state", () => {
  it("seeds the selection from awards that are already presented", () => {
    const content = mountContent([makeItem("a", { presentedOn: "01/02/2026" }), makeItem("b")]);

    expect(content.selectedIds.has("a")).toBe(true);
    expect(content.selectedIds.has("b")).toBe(false);
    expect(content.presentedDates).toEqual({ a: "01/02/2026" });
  });

  it("defaults a newly ticked award's date to the date it was awarded", () => {
    const item = makeItem("b", { awardedOn: "2026-03-05T00:00:00.000Z" });
    const content = mountContent([item]);

    content.onTogglePresent(item, true);

    expect(content.selectedIds.has("b")).toBe(true);
    expect(content.presentedDates.b).toBe("05/03/2026");
  });

  it("clears the date when an award is unticked", () => {
    const item = makeItem("a", { presentedOn: "01/02/2026" });
    const content = mountContent([item]);

    content.onTogglePresent(item, false);

    expect(content.selectedIds.has("a")).toBe(false);
    expect(content.presentedDates.a).toBeUndefined();
  });

  it("replaces the Set rather than mutating it, so Vue 2 can observe the change", () => {
    const item = makeItem("b");
    const content = mountContent([item]);
    const before = content.selectedIds;

    content.onTogglePresent(item, true);

    // Vue 2 cannot intercept Set.add/.delete — an in-place mutation would update the data while
    // leaving the checkbox stale.
    expect(content.selectedIds).not.toBe(before);
  });

  it("replaces the dates object rather than adding a key in place", () => {
    const item = makeItem("b");
    const content = mountContent([item]);
    const before = content.presentedDates;

    content.onUpdateDate(item, "09/09/2026");

    expect(content.presentedDates).not.toBe(before);
    expect(content.presentedDates.b).toBe("09/09/2026");
  });

  it("keeps edit state keyed by id so it survives a reordering of items", () => {
    const first = makeItem("a", { presentedOn: "01/02/2026" });
    const second = makeItem("b");
    const content = mountContent([first, second]);

    content.items = [second, first];

    expect(content.selectedIds.has("a")).toBe(true);
  });
});

describe("PresentAwardsVueContent — saving", () => {
  it("warns and does not save when nothing is selected", async () => {
    const onSave = jest.fn();
    const content = mountContent([makeItem("b")], onSave);

    await content.onSaveClick();

    expect(onSave).not.toHaveBeenCalled();
    expect(content.feedback).toBe(NOTHING_SELECTED_MESSAGE);
  });

  it("saves the selected awards with their edited dates applied", async () => {
    const onSave = jest.fn().mockResolvedValue(null);
    const item = makeItem("a", { presentedOn: "01/02/2026" });
    const content = mountContent([item], onSave);

    content.onUpdateDate(item, "09/09/2026");
    await content.onSaveClick();

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as SummitAchievement[];
    expect(saved.map((entry) => entry.id)).toEqual(["a"]);
    expect(saved[0].presented).toBe("09/09/2026");
    expect(content.feedback).toBe(SAVED_MESSAGE);
  });

  it("excludes unticked awards from the saved payload", async () => {
    const onSave = jest.fn().mockResolvedValue(null);
    const presented = makeItem("a", { presentedOn: "01/02/2026" });
    const other = makeItem("b", { presentedOn: "02/02/2026" });
    const content = mountContent([presented, other], onSave);

    content.onTogglePresent(other, false);
    await content.onSaveClick();

    expect((onSave.mock.calls[0][0] as SummitAchievement[]).map((entry) => entry.id)).toEqual(["a"]);
  });

  it("reports a failure message rather than silently swallowing it", async () => {
    const onSave = jest.fn().mockResolvedValue("Request failed with status 500");
    const content = mountContent([makeItem("a", { presentedOn: "01/02/2026" })], onSave);

    await content.onSaveClick();

    expect(content.feedback).toBe("Save failed: Request failed with status 500");
  });

  it("clears the saving flag even when the save fails", async () => {
    const onSave = jest.fn().mockRejectedValue(new Error("network down"));
    const content = mountContent([makeItem("a", { presentedOn: "01/02/2026" })], onSave);

    await expect(content.onSaveClick()).rejects.toThrow("network down");
    expect(content.isSaving).toBe(false);
  });
});
