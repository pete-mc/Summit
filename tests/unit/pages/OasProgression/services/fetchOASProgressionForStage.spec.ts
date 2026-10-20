/** Separate from buildOASProgressionRows.spec.ts because it mocks the network and cache. */
jest.mock("@/services", () => ({
  fetchOASTemplate: jest.fn(),
  fetchOASTree: jest.fn(),
  fetchUnitAchievementsFilterd: jest.fn(),
}));
jest.mock("@/helpers", () => ({
  createLogger: () => ({ debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
  loadCached: () => undefined,
  saveCached: jest.fn(),
}));

import { fetchOASTemplate, fetchUnitAchievementsFilterd } from "@/services";
import { fetchOASProgressionForStage } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { OASTemplate, TerrainAchievements, TerrainUnitMember } from "@/types/terrainTypes";

const mockFetchTemplate = fetchOASTemplate as jest.MockedFunction<typeof fetchOASTemplate>;
const mockFetchAchievements = fetchUnitAchievementsFilterd as jest.MockedFunction<typeof fetchUnitAchievementsFilterd>;

function template(version: number, inputIds: string[]): OASTemplate {
  return {
    template: "oas/vertical/3",
    version,
    document: [{ title: "Vertical Stage 3", input_groups: [{ title: "Do>", inputs: inputIds.map((id) => ({ id, type: "text", label: `I can ${id}` })) }] }],
  } as OASTemplate;
}

const V1 = template(1, ["activities", "navigation", "climbed"]);
const V2 = template(2, ["activities", "climbed"]);

function member(id: string): TerrainUnitMember {
  return { id, first_name: id, last_name: "Scout", patrol: null } as unknown as TerrainUnitMember;
}

function achievement(memberId: string, version: number): TerrainAchievements {
  return {
    id: "a-" + memberId,
    member_id: memberId,
    section: "scout",
    type: "outdoor_adventure_skill",
    status: "in_progress",
    status_updated: "2026-01-01T00:00:00.000Z",
    template: "oas/vertical/3",
    version,
    answers: {},
  } as unknown as TerrainAchievements;
}

async function rowsFor(achievements: TerrainAchievements[]) {
  mockFetchAchievements.mockResolvedValue(achievements);
  const rows = await fetchOASProgressionForStage("unit-1", "vertical", "vertical", 3, "oas/vertical/3/latest.json", [member("old"), member("new")]);
  return (memberId: string) => rows.filter((r) => r.memberId === memberId).map((r) => r.inputId);
}

beforeEach(() => {
  mockFetchTemplate.mockReset();
  mockFetchTemplate.mockImplementation(async (link: string) => (link === "oas/vertical/3/1.json" ? V1 : link === "oas/vertical/3/latest.json" ? V2 : undefined));
});

it("builds a member on an older version from that version's template, in merged order", async () => {
  const idsFor = await rowsFor([achievement("old", 1), achievement("new", 2)]);

  expect(idsFor("old")).toEqual(["activities", "navigation", "climbed"]);
  expect(idsFor("new")).toEqual(["activities", "climbed"]);
});

it("makes no extra template request when every achievement is on the latest version", async () => {
  await rowsFor([achievement("old", 2)]);

  expect(mockFetchTemplate.mock.calls.map(([link]) => link)).toEqual(["oas/vertical/3/latest.json"]);
});

it("falls back to latest for a member whose older version can't be fetched", async () => {
  mockFetchTemplate.mockImplementation(async (link: string) => (link === "oas/vertical/3/latest.json" ? V2 : undefined));

  const idsFor = await rowsFor([achievement("old", 1)]);

  expect(idsFor("old")).toEqual(["activities", "climbed"]);
});
