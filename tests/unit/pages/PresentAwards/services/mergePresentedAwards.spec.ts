import { mergePresentedAwards, type PresentedAwardRecord } from "@/pages/PresentAwards/services/awardStorageEvent";

function record(guid: string, member = "member-1", date = "2026-03-05T00:00:00.000Z"): PresentedAwardRecord {
  return { guid, date: new Date(date), memberid: member, membername: `Name ${member}` };
}

const guids = (records: PresentedAwardRecord[]) => records.map((r) => r.guid).sort();

describe("mergePresentedAwards", () => {
  it("passes this user's set straight through when nobody else has written", () => {
    const base = [record("a")];
    const mine = [record("a"), record("b")];

    expect(guids(mergePresentedAwards(base, mine, base))).toEqual(["a", "b"]);
  });

  it("keeps both users' additions", () => {
    // Alice and Bob both loaded [a]; Alice ticks b, Bob ticks c. Bob saves second.
    const base = [record("a")];
    const mine = [record("a"), record("c")];
    const current = [record("a"), record("b")];

    expect(guids(mergePresentedAwards(base, mine, current))).toEqual(["a", "b", "c"]);
  });

  it("keeps another user's award this user never saw", () => {
    const base = [record("a")];
    const mine = [record("a")];
    const current = [record("a"), record("b")];

    expect(guids(mergePresentedAwards(base, mine, current))).toEqual(["a", "b"]);
  });

  it("applies this user's deliberate untick", () => {
    const base = [record("a"), record("b")];
    const mine = [record("a")];
    const current = [record("a"), record("b")];

    expect(guids(mergePresentedAwards(base, mine, current))).toEqual(["a"]);
  });

  it("does not resurrect an award another user unticked", () => {
    // This user carried `b` along unchanged; the other user deliberately removed it.
    const base = [record("a"), record("b")];
    const mine = [record("a"), record("b")];
    const current = [record("a")];

    expect(guids(mergePresentedAwards(base, mine, current))).toEqual(["a"]);
  });

  it("lets a deliberate untick beat another user's carried-along tick", () => {
    // The Alice/Bob/Carol case from PLAN_STAGE_8. Bob's base HAD x and his save omits it, so he
    // decided to remove it. Alice merely carried it along. Bob's removal is the only real intent.
    const bobBase = [record("x")];
    const bobSave: PresentedAwardRecord[] = [];
    const serverAfterAlice = [record("x")];

    expect(guids(mergePresentedAwards(bobBase, bobSave, serverAfterAlice))).toEqual([]);
  });

  it("absorbs a tick of something already true without side effects", () => {
    // Alice ticks x while acting on stale data — it was already presented. Harmless.
    const aliceBase: PresentedAwardRecord[] = [];
    const aliceSave = [record("x")];
    const serverAfterCarol = [record("x")];

    expect(guids(mergePresentedAwards(aliceBase, aliceSave, serverAfterCarol))).toEqual(["x"]);
  });

  it("preserves the member attribution of another user's award", () => {
    // Without this the merged award loses its member and cannot be written back correctly.
    const merged = mergePresentedAwards([], [record("a", "member-1")], [record("b", "member-2")]);
    const theirs = merged.find((r) => r.guid === "b");

    expect(theirs?.memberid).toBe("member-2");
    expect(theirs?.membername).toBe("Name member-2");
  });

  it("prefers this user's own date over the stored one for the same award", () => {
    // The user edited the presentation date; merging must not revert it.
    const base = [record("a", "member-1", "2026-01-01T00:00:00.000Z")];
    const mine = [record("a", "member-1", "2026-09-09T00:00:00.000Z")];
    const current = [record("a", "member-1", "2026-01-01T00:00:00.000Z")];

    const merged = mergePresentedAwards(base, mine, current);

    expect(merged[0].date.toISOString()).toBe("2026-09-09T00:00:00.000Z");
  });

  it("never emits the same award twice", () => {
    const base = [record("a")];
    const mine = [record("a"), record("b")];
    const current = [record("a"), record("b")];

    const merged = mergePresentedAwards(base, mine, current);

    expect(merged).toHaveLength(new Set(merged.map((r) => r.guid)).size);
  });

  it("handles a first save against an empty server state", () => {
    expect(guids(mergePresentedAwards([], [record("a")], []))).toEqual(["a"]);
  });

  it("clears everything when the user unticks all of it and nobody else wrote", () => {
    const base = [record("a"), record("b")];

    expect(mergePresentedAwards(base, [], base)).toEqual([]);
  });
});
