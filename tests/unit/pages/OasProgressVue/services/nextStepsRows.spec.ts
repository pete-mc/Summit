import { buildNextStepsRows, listOutstandingRows, listStageOptions } from "@/pages/OasProgressVue/services/nextStepsRows";
import { skillStreamKey } from "@/pages/OasProgressVue/services/skillStreams";
import type { OASProgressRow } from "@/pages/OasProgress/services/buildOASProgressRows";

function makeRow(overrides: Partial<OASProgressRow> = {}): OASProgressRow {
  return {
    unitId: "unit-1",
    stream: "camping",
    branch: "camping",
    stage: 1,
    inputGroup: "Plan",
    inputId: "i1",
    iStatement: "I can pack",
    memberId: "m1",
    memberName: "Alex Scout",
    firstName: "Alex",
    lastName: "Scout",
    patrolName: null,
    answered: false,
    approved: false,
    date: null,
    section: null,
    ...overrides,
  };
}

const CAMPING = skillStreamKey("camping", "camping");
const LIGHTWEIGHT = skillStreamKey("camping", "lightweight-camping");

describe("listOutstandingRows", () => {
  it("keeps only the member's rows that are not approved", () => {
    const rows = [makeRow({ inputId: "a" }), makeRow({ inputId: "b", approved: true }), makeRow({ inputId: "c", memberId: "m2" })];
    expect(listOutstandingRows(rows, "m1").map((r) => r.inputId)).toEqual(["a"]);
  });
});

describe("listStageOptions", () => {
  it("lists each stage of the skill stream once, lowest first, ignoring the skill's other streams", () => {
    const rows = [makeRow({ stage: 3 }), makeRow({ stage: 2 }), makeRow({ stage: 3, inputId: "i2" }), makeRow({ stage: 1, branch: "lightweight-camping" })];
    expect(listStageOptions(rows, CAMPING)).toEqual([2, 3]);
    expect(listStageOptions(rows, LIGHTWEIGHT)).toEqual([1]);
  });
});

describe("buildNextStepsRows", () => {
  it("keeps one skill stream and stage, in template order, labelled with the skill stream", () => {
    const rows = [makeRow({ inputId: "a", stage: 2 }), makeRow({ inputId: "b", stage: 1 }), makeRow({ inputId: "c", stage: 2, branch: "lightweight-camping" }), makeRow({ inputId: "d", stage: 2 })];
    const table = buildNextStepsRows(rows, CAMPING, 2);
    expect(table.map((r) => r.inputId)).toEqual(["a", "d"]);
    expect(table[0].skillStream).toBe("Camping");
  });

  it("is empty when no stage is chosen", () => {
    expect(buildNextStepsRows([makeRow()], CAMPING, null)).toEqual([]);
  });
});
