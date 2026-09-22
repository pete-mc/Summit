import * as fs from "fs";
import * as path from "path";
import OasProgressionVueContent from "@/pages/OasProgressionVue/components/OasProgressionVueContent";
import type { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import type { TerrainUnitMember } from "@/types/terrainTypes";

const REPO_ROOT = path.resolve(__dirname, "../../..");

function makeRow(overrides: Partial<OASProgressionRow> = {}): OASProgressionRow {
  return {
    unitId: "unit-1",
    stream: "bushwalking",
    branch: "navigation",
    stage: 3,
    inputGroup: "Plan",
    inputId: "abc123",
    iStatement: "I can pack appropriate gear for an overnight hike",
    memberId: "member-1",
    memberName: "Alex Scout",
    patrolName: null,
    answered: true,
    awarded: false,
    date: "2020-11-18",
    ...overrides,
  };
}

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: { id: "unit-1", section: "scout", duty: "member" as TerrainUnitMember["unit"]["duty"], unit_council: false, group_id: "group-1" },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

describe("OasProgressionVueContent render contract", () => {
  it("declares the props the mount pattern relies on (items, trunkStageCounts, members, loadingStreams, reload callbacks)", () => {
    const props = (OasProgressionVueContent as unknown as { props: Record<string, unknown> }).props;
    expect(Object.keys(props).sort()).toEqual(["items", "loadingStreams", "members", "onReloadAll", "onReloadStream", "trunkStageCounts"].sort());
  });

  it("accepts real fixture data shaped like the existing React page's own props", () => {
    const rows = [makeRow(), makeRow({ memberId: "member-2", memberName: "Sam Ranger", inputId: "def456", iStatement: "I can navigate using a map and compass", answered: false, date: null })];
    const members = [makeMember({ id: "member-1", first_name: "Alex", last_name: "Scout" }), makeMember({ id: "member-2", first_name: "Sam", last_name: "Ranger" })];

    const props = {
      items: rows,
      trunkStageCounts: { bushwalking: 3 },
      members,
      loadingStreams: new Set<string>(),
      onReloadAll: jest.fn(),
      onReloadStream: jest.fn(),
    };

    expect(props.items).toHaveLength(2);
    expect(props.items.map((r) => r.memberName)).toEqual(["Alex Scout", "Sam Ranger"]);
  });

  it("OasProgressionVue.ts mounts the content component via a second, independent Vue instance (not registered on the outer SFC's own component tree)", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/OasProgressionVue.ts"), "utf8");
    expect(source).toContain("Vue.extend(OasProgressionVueContent)");
    expect(source).toContain("window.summitVuetify");
    expect(source).toContain("$mount(this.$refs.vuetifyRoot");
  });

  it("the outer OasProgressionVue.vue template has no Vuetify tags of its own — only the mount-point div", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressionVue/OasProgressionVue.vue"), "utf8");
    expect(source).toContain('ref="vuetifyRoot"');
    expect(source).not.toMatch(/<v-[a-z]/);
  });
});
