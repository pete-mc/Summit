import Vue from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

// The content component's .vue sibling imports the table's .vue file, which Jest cannot parse
// (vue-loader only merges template + external script at webpack build time). Stub it so the
// options object under test can be required — the table is covered by its own logic tests.
jest.mock("@/pages/PresentAwardsVue/components/PresentAwardsTableVue.vue", () => ({ __esModule: true, default: { name: "PresentAwardsTableVue", render: () => null } }), { virtual: true });
jest.mock("@/pages/PresentAwardsVue/components/PresentAwardsFiltersVue.vue", () => ({ __esModule: true, default: { name: "PresentAwardsFiltersVue", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitLoadingState.vue", () => ({ __esModule: true, default: { name: "SummitLoadingState", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPillButton.vue", () => ({ __esModule: true, default: { name: "SummitPillButton", render: () => null } }), { virtual: true });
jest.mock("@/components/SummitPrintButton.vue", () => ({ __esModule: true, default: { name: "SummitPrintButton", render: () => null } }), { virtual: true });

// The download itself is summit-excel's (tested in tests/unit/excel/); mocked here so these can
// assert what the page asks it for. The rows come from the table (presentAwardsExportView.spec.ts).
jest.mock("@/excel/summitExcel", () => ({
  ...jest.requireActual("@/excel/summitExcel"),
  exportExcelSheet: jest.fn().mockResolvedValue(undefined),
}));

import { exportExcelSheet } from "@/excel/summitExcel";

import PresentAwardsVueContent, { DISCARD_EDITS_PROMPT, NOTHING_SELECTED_MESSAGE, SAVED_MESSAGE } from "@/pages/PresentAwardsVue/components/PresentAwardsVueContent";

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

function makeItem(id: string, options: { memberId?: string; name?: string; awardedOn?: string; presentedOn?: string; alreadyStored?: boolean } = {}): SummitAchievement {
  const achievement = {
    id,
    member_id: options.memberId ?? "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: TerrainAchievementsType.IntroScouting as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: options.awardedOn ?? "2026-03-05T00:00:00.000Z",
  } as TerrainAchievements;

  // Passing the achievement's own id as an existing presentation is what marks a row as
  // previously presented, exactly as a loaded storage event would.
  const existing = options.alreadyStored ? [{ guid: id, date: new Date("2026-02-01T00:00:00.000Z") }] : [];
  const item = new SummitAchievement(achievement, makeMember(options.memberId ?? "member-1", options.name ?? "Alex"), existing);
  if (options.presentedOn) item.updatePresented(options.presentedOn);
  return item;
}

/**
 * The component is a plain Vue 2 options object, so it can be instantiated directly without a
 * template or DOM — the approach .claude/OASProgression/PLAN_VUESTAGE_2.md establishes for this
 * project, since Jest here cannot import .vue files.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountContent(items: SummitAchievement[], onSave?: (presented: SummitAchievement[]) => Promise<{ error?: string; mergeNotice?: string }>, onReload?: () => Promise<void>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor: any = Vue.extend(PresentAwardsVueContent as any);
  return new Ctor({ propsData: { items, loadState: "ready", onSave, onReload } });
}

// The component restores saved filters on construction, so each test starts from a clean slate.
beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
});

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

describe("PresentAwardsVueContent — previously presented visibility", () => {
  it("hides previously presented awards by default, matching the React page", () => {
    const content = mountContent([makeItem("a", { alreadyStored: true }), makeItem("b")]);

    expect(content.showPreviouslyPresented).toBe(false);
    expect(content.visibleItems.map((item: SummitAchievement) => item.id)).toEqual(["b"]);
  });

  it("shows them once toggled on", () => {
    const content = mountContent([makeItem("a", { alreadyStored: true }), makeItem("b")]);

    content.onDisplayFiltersUpdate({ ...content.displayFilters, showPreviouslyPresented: !content.showPreviouslyPresented });

    expect(content.showPreviouslyPresented).toBe(true);
    expect(content.visibleItems.map((item: SummitAchievement) => item.id)).toEqual(["a", "b"]);
  });

  it("toggles back off", () => {
    const content = mountContent([makeItem("a", { alreadyStored: true })]);

    content.onDisplayFiltersUpdate({ ...content.displayFilters, showPreviouslyPresented: !content.showPreviouslyPresented });
    content.onDisplayFiltersUpdate({ ...content.displayFilters, showPreviouslyPresented: !content.showPreviouslyPresented });

    expect(content.visibleItems).toEqual([]);
  });

  it("still saves a hidden award that remains ticked", async () => {
    // Hiding a row must not silently drop it from the next save — the storage event is a full
    // replace, so an omitted row would be erased.
    const onSave = jest.fn().mockResolvedValue({});
    const content = mountContent([makeItem("a", { alreadyStored: true, presentedOn: "01/02/2026" })], onSave);

    expect(content.visibleItems).toEqual([]);
    await content.onSaveClick();

    expect((onSave.mock.calls[0][0] as SummitAchievement[]).map((entry) => entry.id)).toEqual(["a"]);
  });
});

describe("PresentAwardsVueContent — column filters", () => {
  it("starts with no filters", () => {
    expect(mountContent([makeItem("a")]).columnFilters).toEqual({});
  });

  it("accepts a filter update from the table", () => {
    const content = mountContent([makeItem("a")]);

    content.onColumnFiltersUpdate({ member: "Alex" });

    expect(content.columnFilters).toEqual({ member: "Alex" });
  });

  it("clears all filters when the table emits an empty map", () => {
    const content = mountContent([makeItem("a")]);

    content.onColumnFiltersUpdate({ member: "Alex" });
    content.onColumnFiltersUpdate({});

    expect(content.columnFilters).toEqual({});
  });
});

describe("PresentAwardsVueContent — Excel export (.claude/Excel/PLAN_STAGE_3.md)", () => {
  const VIEW = { grouped: false, groups: [{ label: "", rows: [{ member: "Alex Scout", type: "Intro", award: "Award", dateAwarded: "05/03/2026", presented: "", present: false }] }] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function withTable(content: any) {
    const table = { getExportView: jest.fn().mockReturnValue(VIEW) };
    content.$refs.table = table;
    return table;
  }

  it("asks summit-excel for the Present Awards sheet, with the printout's header and filter line", async () => {
    const content = mountContent([makeItem("a")]);
    withTable(content);
    content.onColumnFiltersUpdate({ member: "Alex" });

    await content.onExcelExportClick();

    expect(exportExcelSheet).toHaveBeenCalledTimes(1);
    const request = (exportExcelSheet as jest.Mock).mock.calls[0][0];
    expect(request.printProfile).toBe("present-awards");
    expect(request.fileNameParts).toEqual(["Present Awards"]);
    expect(request.meta).toEqual(content.presentAwardsPrintMeta);
    expect(content.feedback).toBe("Excel export complete");
    expect(content.isExcelExporting).toBe(false);
  });

  it("builds the sheet from the table's own export view (rows as on screen)", async () => {
    const content = mountContent([makeItem("a")]);
    const table = withTable(content);

    await content.onExcelExportClick();
    const request = (exportExcelSheet as jest.Mock).mock.calls[0][0];
    const sheet = request.build({ title: "T", subtitle: "S", metaLine: "M" }, null);

    expect(table.getExportView).toHaveBeenCalledTimes(1);
    // Flat view: Name, Type, Award, Date, Presented, with the row after the header block and column header.
    expect(sheet.rows[5][0]).toMatchObject({ value: "Alex Scout" });
  });

  it("reports an export failure rather than failing silently, and clears the busy state", async () => {
    (exportExcelSheet as jest.Mock).mockRejectedValueOnce(new Error("disk full"));
    const content = mountContent([makeItem("a")]);
    withTable(content);

    await content.onExcelExportClick();

    expect(content.feedback).toBe("Excel export failed: disk full");
    expect(content.isExcelExporting).toBe(false);
  });
});

describe("PresentAwardsVueContent — refresh", () => {
  it("reloads without confirming when there is nothing unsaved", async () => {
    const onReload = jest.fn().mockResolvedValue(undefined);
    const confirmSpy = jest.spyOn(window, "confirm");
    const content = mountContent([makeItem("a")], undefined, onReload);

    await content.onReloadClick();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("confirms before discarding unsaved edits", async () => {
    const onReload = jest.fn().mockResolvedValue(undefined);
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const item = makeItem("a");
    const content = mountContent([item], undefined, onReload);

    content.onTogglePresent(item, true);
    await content.onReloadClick();

    expect(confirmSpy).toHaveBeenCalledWith(DISCARD_EDITS_PROMPT);
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("keeps the edits when the confirmation is cancelled", async () => {
    const onReload = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const item = makeItem("a");
    const content = mountContent([item], undefined, onReload);

    content.onTogglePresent(item, true);
    await content.onReloadClick();

    expect(onReload).not.toHaveBeenCalled();
    expect(content.selectedIds.has("a")).toBe(true);
  });

  it("clears the reloading flag even when the reload fails", async () => {
    const onReload = jest.fn().mockRejectedValue(new Error("network down"));
    const content = mountContent([makeItem("a")], undefined, onReload);

    await expect(content.onReloadClick()).rejects.toThrow("network down");
    expect(content.isReloading).toBe(false);
  });
});

describe("PresentAwardsVueContent — filter persistence", () => {
  it("saves filters as they change", () => {
    const content = mountContent([makeItem("a")]);

    content.onColumnFiltersUpdate({ member: "Alex" });

    expect(JSON.parse(window.localStorage.getItem("summit.presentAwardsVue.filters") as string)).toEqual({ columnFilters: { member: "Alex" }, showPreviouslyPresented: false, groupByMember: true });
  });

  it("saves the previously-presented toggle", () => {
    const content = mountContent([makeItem("a")]);

    content.onDisplayFiltersUpdate({ ...content.displayFilters, showPreviouslyPresented: !content.showPreviouslyPresented });

    expect(JSON.parse(window.localStorage.getItem("summit.presentAwardsVue.filters") as string).showPreviouslyPresented).toBe(true);
  });

  it("persists synchronously, so navigating away immediately does not lose the change", () => {
    // Vue 2 watchers fire on the next tick; persisting from one would drop this write.
    const content = mountContent([makeItem("a")]);

    content.onColumnFiltersUpdate({ member: "Alex" });

    expect(window.localStorage.getItem("summit.presentAwardsVue.filters")).not.toBeNull();
  });

  it("restores saved filters on construction", () => {
    window.localStorage.setItem("summit.presentAwardsVue.filters", JSON.stringify({ columnFilters: { member: "Sam" }, showPreviouslyPresented: true }));

    const content = mountContent([makeItem("a")]);

    expect(content.columnFilters).toEqual({ member: "Sam" });
    expect(content.showPreviouslyPresented).toBe(true);
  });

  it("never persists unsaved edit state", () => {
    const item = makeItem("a");
    const content = mountContent([item]);

    content.onTogglePresent(item, true);
    content.onColumnFiltersUpdate({ member: "Alex" });

    const stored = JSON.parse(window.localStorage.getItem("summit.presentAwardsVue.filters") as string);
    expect(Object.keys(stored).sort()).toEqual(["columnFilters", "groupByMember", "showPreviouslyPresented"]);
  });

  it("saves the group-by-member toggle", () => {
    const content = mountContent([makeItem("a")]);

    content.onDisplayFiltersUpdate({ ...content.displayFilters, groupByMember: !content.groupByMember });

    expect(JSON.parse(window.localStorage.getItem("summit.presentAwardsVue.filters") as string).groupByMember).toBe(false);
  });

  it("groups by member on a first visit", () => {
    expect(mountContent([makeItem("a")]).groupByMember).toBe(true);
  });

  it("restores a saved ungrouped preference", () => {
    window.localStorage.setItem("summit.presentAwardsVue.filters", JSON.stringify({ groupByMember: false }));

    expect(mountContent([makeItem("a")]).groupByMember).toBe(false);
  });

  it("Reset filters puts everything back to a first visit — grouping On, previously presented Off, no column filters — and saves it", () => {
    const content = mountContent([makeItem("a")]);
    content.onDisplayFiltersUpdate({ groupByMember: false, showPreviouslyPresented: true });
    content.onColumnFiltersUpdate({ member: "Alex", type: "OAS" });

    content.onResetFilters();

    expect(content.groupByMember).toBe(true);
    expect(content.showPreviouslyPresented).toBe(false);
    expect(content.columnFilters).toEqual({});
    expect(JSON.parse(window.localStorage.getItem("summit.presentAwardsVue.filters") as string)).toEqual({ columnFilters: {}, groupByMember: true, showPreviouslyPresented: false });
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
    const onSave = jest.fn().mockResolvedValue({});
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
    const onSave = jest.fn().mockResolvedValue({});
    const presented = makeItem("a", { presentedOn: "01/02/2026" });
    const other = makeItem("b", { presentedOn: "02/02/2026" });
    const content = mountContent([presented, other], onSave);

    content.onTogglePresent(other, false);
    await content.onSaveClick();

    expect((onSave.mock.calls[0][0] as SummitAchievement[]).map((entry) => entry.id)).toEqual(["a"]);
  });

  it("tells the user when their save had to be merged with someone else's", async () => {
    // A merge means the screen they were looking at was not the whole picture, so a plain
    // "Saved." would be misleading.
    const notice = "Saved. Someone else had also made changes at 9:41 am; both sets have been kept.";
    const onSave = jest.fn().mockResolvedValue({ mergeNotice: notice });
    const content = mountContent([makeItem("a", { presentedOn: "01/02/2026" })], onSave);

    await content.onSaveClick();

    expect(content.feedback).toBe(notice);
    expect(content.feedback).not.toBe(SAVED_MESSAGE);
  });

  it("reports a failure message rather than silently swallowing it", async () => {
    const onSave = jest.fn().mockResolvedValue({ error: "Request failed with status 500" });
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
