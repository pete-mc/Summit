import Vue from "vue";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import PresentAwardsTableVue, { sortPresentAwardRows, type PresentAwardsExportView } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";

/** Fake members only. `awardedOn` is ISO; `presentedOn` is the stored DD/MM/YYYY presentation. */
function makeItem(id: string, name: string, awardedOn: string, presentedOn?: string): SummitAchievement {
  const member: TerrainUnitMember = {
    id: `member-${name}`,
    member_number: "123",
    first_name: name,
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
  };
  const achievement = {
    id,
    member_id: member.id,
    section: "scout" as TerrainAchievements["section"],
    type: TerrainAchievementsType.IntroScouting as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: `${awardedOn}T00:00:00.000Z`,
  } as TerrainAchievements;
  const item = new SummitAchievement(achievement, member, []);
  if (presentedOn) item.updatePresented(presentedOn);
  return item;
}

const ids = (items: SummitAchievement[]) => items.map((i) => i.id);

// Dates chosen so text order and date order disagree: "01/12/2025" < "02/01/2024" as text.
const OLD = makeItem("old", "Sam", "2024-01-02");
const NEW = makeItem("new", "Alex", "2025-12-01");
const MID = makeItem("mid", "Alex", "2025-06-15", "20/06/2025");

describe("sortPresentAwardRows (the table's own order)", () => {
  it("leaves the order alone when nothing is sorted and not grouped", () => {
    expect(ids(sortPresentAwardRows([OLD, NEW, MID], [], [], false))).toEqual(["old", "new", "mid"]);
  });

  it("sorts Date as a date, ascending and descending", () => {
    expect(ids(sortPresentAwardRows([NEW, OLD, MID], ["dateAwarded"], [false], false))).toEqual(["old", "mid", "new"]);
    expect(ids(sortPresentAwardRows([NEW, OLD, MID], ["dateAwarded"], [true], false))).toEqual(["new", "mid", "old"]);
  });

  it("sorts not-presented first when Presented (Yes/No) is ascending", () => {
    expect(ids(sortPresentAwardRows([MID, OLD], ["presented"], [false], false))).toEqual(["old", "mid"]);
    expect(ids(sortPresentAwardRows([OLD, MID], ["presented"], [true], false))).toEqual(["mid", "old"]);
  });

  it("sorts Date Presented as a date, not-presented first", () => {
    expect(ids(sortPresentAwardRows([MID, OLD], ["presentedDate"], [false], false))).toEqual(["old", "mid"]);
    expect(ids(sortPresentAwardRows([OLD, MID], ["presentedDate"], [true], false))).toEqual(["mid", "old"]);
  });

  it("sorts by member first when grouped, then by the chosen column", () => {
    expect(ids(sortPresentAwardRows([OLD, NEW, MID], ["dateAwarded"], [true], true))).toEqual(["new", "mid", "old"]);
  });

  it("doesn't reorder the array it was given", () => {
    const items = [NEW, OLD];
    sortPresentAwardRows(items, ["dateAwarded"], [false], false);
    expect(ids(items)).toEqual(["new", "old"]);
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountTable(props: { items: SummitAchievement[]; selectedIds: Set<string>; presentedDates?: Record<string, string>; groupByMember?: boolean; columnFilters?: Record<string, string> }): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor: any = Vue.extend(PresentAwardsTableVue as any);
  return new Ctor({ propsData: { presentedDates: {}, groupByMember: true, columnFilters: {}, ...props } });
}

const exportView = (table: { getExportView(): PresentAwardsExportView }) => table.getExportView();

describe("PresentAwardsTableVue.getExportView", () => {
  it("flat: one unlabelled group, in the table's current sort", () => {
    const table = mountTable({ items: [NEW, OLD, MID], selectedIds: new Set(["mid"]), groupByMember: false });
    table.sortBy = ["dateAwarded"];
    table.sortDesc = [false];

    const view = exportView(table);
    expect(view.grouped).toBe(false);
    expect(view.groups).toHaveLength(1);
    expect(view.groups[0].label).toBe("");
    expect(view.groups[0].rows.map((r) => r.member)).toEqual(["Sam Scout", "Alex Scout", "Alex Scout"]);
  });

  it("grouped: a group per member with the screen's label", () => {
    const table = mountTable({ items: [OLD, NEW, MID], selectedIds: new Set(["mid"]), presentedDates: { mid: "20/06/2025" } });

    const view = exportView(table);
    expect(view.grouped).toBe(true);
    expect(view.groups.map((g) => g.label)).toEqual(["Alex Scout (1 not presented)", "Sam Scout (1 not presented)"]);
    expect(view.groups[0].rows).toHaveLength(2);
  });

  it("only exports rows that pass the column filters, ignoring paging", () => {
    const table = mountTable({ items: [OLD, NEW, MID], selectedIds: new Set(), columnFilters: { member: "Sam" } });
    table.itemsPerPage = 1;

    expect(exportView(table).groups.flatMap((g) => g.rows.map((r) => r.member))).toEqual(["Sam Scout"]);
  });

  it("shows the Presented value on screen: an unsaved date, and empty when unticked", () => {
    const table = mountTable({ items: [MID, NEW], selectedIds: new Set(["mid"]), presentedDates: { mid: "01/07/2025" }, groupByMember: false });

    const rows = exportView(table).groups[0].rows;
    expect(rows.map((r) => r.presented)).toEqual(["01/07/2025", ""]);
  });

  it("carries the data columns and the Present tick box", () => {
    const table = mountTable({ items: [MID, NEW], selectedIds: new Set(["mid"]), groupByMember: false });
    const rows = exportView(table).groups[0].rows;
    expect(Object.keys(rows[0]).sort()).toEqual(["award", "dateAwarded", "member", "present", "presented", "type"]);
    expect(rows.map((r) => r.present)).toEqual([true, false]);
  });
});
