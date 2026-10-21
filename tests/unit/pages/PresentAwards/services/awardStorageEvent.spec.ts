import moment from "moment";
import SummitAchievement from "@/pages/PresentAwards/models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import type { TerrainAchievements, TerrainEvent, TerrainEventScheduleItem, TerrainUnitMember } from "@/types/terrainTypes";
import { processGuids, reconstructGuids, reconstructGuidsAndDates } from "@/helpers";

jest.mock("@/helpers/TerrainState", () => ({
  __esModule: true,
  default: {
    getToken: () => "test-token",
    getUnitID: () => "unit-1",
    getMemberID: () => "member-self",
  },
}));

import {
  buildStorageEventPayload,
  buildStorageEventPayloadFromRecords,
  checkNotAnAccidentalWipe,
  hashStorageEvent,
  lastWrittenAt,
  readPresentedGuids,
  readPresentedRecords,
  STORAGE_EVENT_DATA_VERSION,
  STORAGE_EVENT_TITLE,
} from "@/pages/PresentAwards/services/awardStorageEvent";

const GUID_A = "11111111-2222-3333-4444-555555555555";
const GUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function makeMember(overrides: Partial<TerrainUnitMember> = {}): TerrainUnitMember {
  return {
    id: "member-1",
    member_number: "123",
    first_name: "Alex",
    last_name: "Scout",
    status: "active",
    date_of_birth: "2010-01-01",
    groups: [],
    unit: {
      id: "unit-1",
      section: "scout",
      duty: "member" as TerrainUnitMember["unit"]["duty"],
      unit_council: false,
      group_id: "group-1",
    },
    patrol: null,
    metadata: { "achievement-import": "" },
    ...overrides,
  };
}

function makeAchievement(overrides: Partial<TerrainAchievements> = {}): TerrainAchievements {
  return {
    id: GUID_A,
    member_id: "member-1",
    section: "scout" as TerrainAchievements["section"],
    type: TerrainAchievementsType.IntroScouting as TerrainAchievements["type"],
    status: "awarded" as TerrainAchievements["status"],
    status_updated: "2026-03-05T00:00:00.000Z",
    ...overrides,
  } as TerrainAchievements;
}

/** A row already marked as presented on the given date, ready to be written back out. */
function makePresentedItem(achievementId: string, memberId: string, memberName: string, presentedDate: string): SummitAchievement {
  const item = new SummitAchievement(makeAchievement({ id: achievementId, member_id: memberId }), makeMember({ id: memberId, first_name: memberName, last_name: "Scout" }), []);
  item.updatePresented(presentedDate);
  return item;
}

describe("awardStorageEvent — buildStorageEventPayload", () => {
  it("round-trips guids and presentation dates through the compressed schedule items", () => {
    const items = [makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")];

    const payload = buildStorageEventPayload(items);
    const restored = reconstructGuidsAndDates(payload.schedule_items.map((scheduleItem) => scheduleItem.description));

    expect(restored).toHaveLength(1);
    expect(restored[0].guid).toBe(GUID_A);
    expect(moment(restored[0].date).format("DD/MM/YYYY")).toBe("05/03/2026");
  });

  it("writes one schedule item per member, tagged with member id and name", () => {
    const items = [makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-2", "Sam", "06/03/2026")];

    const payload = buildStorageEventPayload(items);

    expect(payload.schedule_items).toHaveLength(2);
    expect(payload.schedule_items.map((scheduleItem) => scheduleItem.leader_notes).sort()).toEqual(["member-1", "member-2"]);
    expect(payload.schedule_items.map((scheduleItem) => scheduleItem.assistant_notes).sort()).toEqual(["Alex Scout", "Sam Scout"]);
  });

  it("packs multiple awards for the same member into a single schedule item", () => {
    const items = [makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-1", "Alex", "06/03/2026")];

    const payload = buildStorageEventPayload(items);

    expect(payload.schedule_items).toHaveLength(1);
    expect(reconstructGuidsAndDates([payload.schedule_items[0].description]).map((entry) => entry.guid)).toEqual([GUID_A, GUID_B]);
  });

  it("stamps the current data version so readers know which decoder to use", () => {
    const payload = buildStorageEventPayload([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")]);

    expect(payload.equipment_notes).toBe(STORAGE_EVENT_DATA_VERSION);
    expect(payload.title).toBe(STORAGE_EVENT_TITLE);
  });

  it("produces an empty schedule item list when nothing is presented", () => {
    expect(buildStorageEventPayload([]).schedule_items).toEqual([]);
  });
});

describe("awardStorageEvent — hashStorageEvent", () => {
  function eventWith(items: SummitAchievement[]): TerrainEvent {
    return { equipment_notes: STORAGE_EVENT_DATA_VERSION, schedule_items: buildStorageEventPayload(items).schedule_items } as TerrainEvent;
  }

  it("is stable for identical content", () => {
    const items = [makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")];

    expect(hashStorageEvent(eventWith(items))).toBe(hashStorageEvent(eventWith(items)));
  });

  it("changes when an award is added", () => {
    const before = eventWith([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")]);
    const after = eventWith([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-2", "Sam", "06/03/2026")]);

    expect(hashStorageEvent(after)).not.toBe(hashStorageEvent(before));
  });

  it("changes when a presentation date changes", () => {
    const before = eventWith([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")]);
    const after = eventWith([makePresentedItem(GUID_A, "member-1", "Alex", "09/09/2026")]);

    expect(hashStorageEvent(after)).not.toBe(hashStorageEvent(before));
  });

  it("ignores the order schedule items happen to arrive in", () => {
    // Two members produce one item each; which order the server returns them in is not a change.
    const forward = eventWith([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-2", "Sam", "06/03/2026")]);
    const reversed = { ...forward, schedule_items: [...(forward.schedule_items ?? [])].reverse() } as TerrainEvent;

    expect(hashStorageEvent(reversed)).toBe(hashStorageEvent(forward));
  });

  it("handles an event with no schedule items, and an absent event", () => {
    expect(hashStorageEvent({ schedule_items: [] } as unknown as TerrainEvent)).toBe(hashStorageEvent(undefined));
  });
});

describe("awardStorageEvent — readPresentedRecords", () => {
  it("keeps each award's member attribution", () => {
    const storeEvent = {
      equipment_notes: STORAGE_EVENT_DATA_VERSION,
      schedule_items: buildStorageEventPayload([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-2", "Sam", "06/03/2026")]).schedule_items,
    } as TerrainEvent;

    const records = readPresentedRecords(storeEvent);

    expect(records).toHaveLength(2);
    expect(records.find((r) => r.guid === GUID_A)?.membername).toBe("Alex Scout");
    expect(records.find((r) => r.guid === GUID_B)?.memberid).toBe("member-2");
  });

  it("round-trips through a rebuilt payload without losing anything", () => {
    const original = [makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-2", "Sam", "06/03/2026")];
    const storeEvent = { equipment_notes: STORAGE_EVENT_DATA_VERSION, schedule_items: buildStorageEventPayload(original).schedule_items } as TerrainEvent;

    const rebuilt = { equipment_notes: STORAGE_EVENT_DATA_VERSION, schedule_items: buildStorageEventPayloadFromRecords(readPresentedRecords(storeEvent)).schedule_items } as TerrainEvent;

    expect(hashStorageEvent(rebuilt)).toBe(hashStorageEvent(storeEvent));
  });

  it("gives a v1 award a fallback date rather than dropping it", () => {
    const legacyEvent = {
      equipment_notes: "1",
      schedule_items: [{ description: processGuids([GUID_A])[0], start_datetime: "2026-09-27T09:41:09+10:00", leader_notes: "member-1", assistant_notes: "Alex Scout" } as TerrainEventScheduleItem],
    } as TerrainEvent;

    const records = readPresentedRecords(legacyEvent);

    expect(records).toHaveLength(1);
    expect(records[0].guid).toBe(GUID_A);
    expect(records[0].date).toBeInstanceOf(Date);
  });

  it("returns nothing for an absent event", () => {
    expect(readPresentedRecords(undefined)).toEqual([]);
  });
});

describe("awardStorageEvent — lastWrittenAt", () => {
  it("reports the most recent schedule item timestamp", () => {
    const storeEvent = {
      schedule_items: [
        { description: "x", start_datetime: "2026-09-27T09:41:09+10:00" },
        { description: "y", start_datetime: "2026-09-27T11:15:00+10:00" },
      ] as TerrainEventScheduleItem[],
    } as TerrainEvent;

    expect(lastWrittenAt(storeEvent)?.toISOString()).toBe(new Date("2026-09-27T11:15:00+10:00").toISOString());
  });

  it("returns null when there is nothing to read", () => {
    expect(lastWrittenAt(undefined)).toBeNull();
    expect(lastWrittenAt({ schedule_items: [] } as unknown as TerrainEvent)).toBeNull();
  });

  it("ignores unparseable timestamps rather than returning an invalid date", () => {
    const storeEvent = { schedule_items: [{ description: "x", start_datetime: "not a date" }] as TerrainEventScheduleItem[] } as TerrainEvent;

    expect(lastWrittenAt(storeEvent)).toBeNull();
  });
});

describe("awardStorageEvent — checkNotAnAccidentalWipe", () => {
  /** A stored event holding one presented award, as a populated storage event would look. */
  function makePopulatedEvent(): TerrainEvent {
    return {
      equipment_notes: STORAGE_EVENT_DATA_VERSION,
      schedule_items: buildStorageEventPayload([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")]).schedule_items,
    } as TerrainEvent;
  }

  it("refuses an empty save against a populated event", () => {
    // The save is a whole-event replace, so this would erase the unit's entire history.
    const refusal = checkNotAnAccidentalWipe(makePopulatedEvent(), []);

    expect(refusal).not.toBeNull();
    expect(refusal).toContain("1 previously presented award");
  });

  it("counts the awards at risk in the message", () => {
    const storeEvent = {
      equipment_notes: STORAGE_EVENT_DATA_VERSION,
      schedule_items: buildStorageEventPayload([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026"), makePresentedItem(GUID_B, "member-2", "Sam", "06/03/2026")]).schedule_items,
    } as TerrainEvent;

    expect(checkNotAnAccidentalWipe(storeEvent, [])).toContain("2 previously presented awards");
  });

  it("allows a normal save that stores awards", () => {
    expect(checkNotAnAccidentalWipe(makePopulatedEvent(), [makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")])).toBeNull();
  });

  it("allows an empty save when nothing was stored", () => {
    // A unit that has never presented anything has nothing to lose.
    const emptyEvent = { equipment_notes: STORAGE_EVENT_DATA_VERSION, schedule_items: [] } as unknown as TerrainEvent;

    expect(checkNotAnAccidentalWipe(emptyEvent, [])).toBeNull();
  });

  it("allows an empty save when no storage event exists yet", () => {
    expect(checkNotAnAccidentalWipe(undefined, [])).toBeNull();
  });

  it("protects a legacy version 1 event too", () => {
    // Version 1 packed guids without dates; the guard must read both formats.
    const legacyEvent = {
      equipment_notes: "1",
      schedule_items: [{ description: processGuids([GUID_A])[0] } as TerrainEventScheduleItem],
    } as TerrainEvent;

    expect(checkNotAnAccidentalWipe(legacyEvent, [])).not.toBeNull();
  });
});

describe("awardStorageEvent — readPresentedGuids", () => {
  it("decodes version 2 data with presentation dates", () => {
    const payload = buildStorageEventPayload([makePresentedItem(GUID_A, "member-1", "Alex", "05/03/2026")]);
    const storeEvent = {
      equipment_notes: STORAGE_EVENT_DATA_VERSION,
      schedule_items: payload.schedule_items,
    } as TerrainEvent;

    const result = readPresentedGuids(storeEvent);

    expect(result).toHaveLength(1);
    expect(result[0].guid).toBe(GUID_A);
    expect(moment(result[0].date as Date).format("DD/MM/YYYY")).toBe("05/03/2026");
  });

  it("decodes legacy version 1 data as guids with no date", () => {
    // Version 1 packed guids only, in 16-char chunks — reconstructGuids is its decoder.
    const legacyDescription = processGuids([GUID_A])[0];
    const storeEvent = {
      equipment_notes: "1",
      schedule_items: [{ description: legacyDescription } as TerrainEventScheduleItem],
    } as TerrainEvent;

    const result = readPresentedGuids(storeEvent);

    expect(reconstructGuids([legacyDescription])).toEqual([GUID_A]);
    expect(result).toEqual([{ guid: GUID_A, date: null }]);
  });

  it("treats a missing version as legacy rather than failing", () => {
    const storeEvent = { schedule_items: [] } as unknown as TerrainEvent;

    expect(readPresentedGuids(storeEvent)).toEqual([]);
  });

  it("returns nothing when the unit has never presented an award", () => {
    expect(readPresentedGuids(undefined)).toEqual([]);
  });
});
