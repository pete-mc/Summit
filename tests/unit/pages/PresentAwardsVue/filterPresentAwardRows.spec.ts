import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";
import { filterPresentAwardRows, PRESENTED_FILTER_NO, PRESENTED_FILTER_YES } from "@/pages/PresentAwardsVue/components/PresentAwardsTableVue";

function makeMember(firstName: string): TerrainUnitMember {
  return {
    id: "member-1",
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

function makeItem(id: string, options: { name?: string; type?: string; presentedOn?: string } = {}): SummitAchievement {
  const achievement = {
    id,
    member_id: "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: (options.type ?? TerrainAchievementsType.IntroScouting) as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: "2026-03-05T00:00:00.000Z",
  } as TerrainAchievements;

  const item = new SummitAchievement(achievement, makeMember(options.name ?? "Alex"), []);
  if (options.presentedOn) item.updatePresented(options.presentedOn);
  return item;
}

describe("filterPresentAwardRows", () => {
  const alex = makeItem("a", { name: "Alex" });
  const sam = makeItem("b", { name: "Sam", type: TerrainAchievementsType.PeakAward });
  const items = [alex, sam];

  it("returns everything when no filters are set", () => {
    expect(filterPresentAwardRows(items, {})).toEqual(items);
    expect(filterPresentAwardRows(items)).toEqual(items);
  });

  it("ignores filters that are empty or whitespace only", () => {
    expect(filterPresentAwardRows(items, { member: "", type: "   " })).toEqual(items);
  });

  it("matches on a case-insensitive substring", () => {
    expect(filterPresentAwardRows(items, { member: "ale" })).toEqual([alex]);
    expect(filterPresentAwardRows(items, { member: "ALEX" })).toEqual([alex]);
  });

  it("ANDs multiple filters together", () => {
    expect(filterPresentAwardRows(items, { member: "Alex", type: alex.type })).toEqual([alex]);
    expect(filterPresentAwardRows(items, { member: "Alex", type: sam.type })).toEqual([]);
  });

  it("returns nothing when a filter matches no rows", () => {
    expect(filterPresentAwardRows(items, { member: "nobody" })).toEqual([]);
  });
});

describe("filterPresentAwardRows — the Presented column", () => {
  const presented = makeItem("a", { name: "Alex", presentedOn: "01/02/2026" });
  const notPresented = makeItem("b", { name: "Sam" });
  const items = [presented, notPresented];

  it("matches only dated rows for Yes", () => {
    expect(filterPresentAwardRows(items, { presented: PRESENTED_FILTER_YES })).toEqual([presented]);
  });

  it("matches only undated rows for No", () => {
    expect(filterPresentAwardRows(items, { presented: PRESENTED_FILTER_NO })).toEqual([notPresented]);
  });

  it("accounts for every row between Yes and No", () => {
    const yes = filterPresentAwardRows(items, { presented: PRESENTED_FILTER_YES });
    const no = filterPresentAwardRows(items, { presented: PRESENTED_FILTER_NO });
    expect(yes.length + no.length).toBe(items.length);
  });

  it("does not match award names that merely contain the word 'no'", () => {
    // A plain substring filter on "no" would also hit any award whose name contains it —
    // this column is matched on meaning, not text.
    const noticeable = makeItem("c", { name: "Nolan" });
    const result = filterPresentAwardRows([presented, noticeable], { presented: PRESENTED_FILTER_NO });
    expect(result).toEqual([noticeable]);
  });

  it("honours a pending unsaved edit, so filtering agrees with what is on screen", () => {
    // The row is stored as unpresented but has just been ticked; filtering by Yes must find it.
    const pending = { [notPresented.id]: "09/09/2026" } as Record<string, string>;
    const resolve = (item: SummitAchievement) => pending[item.id] ?? (item.presented !== "No" ? item.presented : "");

    expect(filterPresentAwardRows(items, { presented: PRESENTED_FILTER_YES }, resolve)).toEqual(items);
    expect(filterPresentAwardRows(items, { presented: PRESENTED_FILTER_NO }, resolve)).toEqual([]);
  });

  it("combines with another column filter", () => {
    expect(filterPresentAwardRows(items, { presented: PRESENTED_FILTER_YES, member: "Sam" })).toEqual([]);
    expect(filterPresentAwardRows(items, { presented: PRESENTED_FILTER_YES, member: "Alex" })).toEqual([presented]);
  });
});
