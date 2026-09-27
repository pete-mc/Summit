import moment from "moment";
import { TerrainEvent, TerrainEventScheduleItem, TerrainUnitMember, TerrrainPostEvent } from "@/types/terrainTypes";
import { fetchMemberEvents, fetchUnitAchievementsFilterd, fetchActivity, updateEvent, createNewEvent, fetchUnitMembers } from "@/services";
import type { SaveEventResult } from "@/services/saveEventResult";
import { TerrainState, createLogger, processGuidsAndDates, reconstructGuids, reconstructGuidsAndDates } from "@/helpers";
import { TerrainAchievementsType } from "@/shared";
import SummitAchievement from "../models/SummitAchievement";

const logger = createLogger("awardStorageEvent");

/**
 * Terrain has no API for "this award has been physically handed to the member", so Summit stores
 * that state inside a disguised calendar event dated in the year 2100 — presented achievement
 * GUIDs (plus the date they were presented) are base-300 compressed into the event's
 * schedule_items[].description strings. See CompressGuids.ts for the encoding.
 *
 * This module is the single owner of that storage format. It was extracted verbatim from
 * PresentAwards.ts so the React page and the Vue replica (src/pages/PresentAwardsVue/) share one
 * copy — two independent implementations of a bespoke binary-ish format would drift, and drift
 * here means silently corrupting a unit's presentation history rather than just looking wrong.
 */

export const STORAGE_EVENT_TITLE = "Summit Award Storage - Please Ignore";

/**
 * equipment_notes doubles as the schema version of the packed data:
 *   "1" (or absent) — 16-char chunks, GUIDs only, no presentation dates
 *   "2"             — 19-char chunks, GUID + DDMMYY presentation date
 * Reads must honour both; writes always emit the current version.
 */
export const STORAGE_EVENT_DATA_VERSION = "2";

const STORAGE_EVENT_WINDOW_START = "2100-01-01T00:00:00";
const STORAGE_EVENT_WINDOW_END = "2100-01-30T00:00:00";

/** The format SummitAchievement.presented carries. Declared here so this service does not depend
 *  on a page component for it. */
const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

export interface PresentedAwardsLoad {
  /** The storage event, or undefined if this unit has never presented anything. */
  storeEvent: TerrainEvent | undefined;
  items: SummitAchievement[];
}

/**
 * Locates the storage event, fetches every awarded achievement in the unit, and builds the row
 * view-models with their presentation state already resolved.
 */
export async function loadPresentedAwards(): Promise<PresentedAwardsLoad> {
  const storeEvent = await fetchActivity((await fetchMemberEvents(STORAGE_EVENT_WINDOW_START, STORAGE_EVENT_WINDOW_END)).find((event) => event.title === STORAGE_EVENT_TITLE && event.invitee_id === TerrainState.getUnitID())?.id);

  const fetchPromises = Object.values(TerrainAchievementsType).map((type) => fetchUnitAchievementsFilterd(`type=${type}`));
  const membersMap = (await fetchUnitMembers()).reduce(
    (map, member) => {
      map[member.id] = member;
      return map;
    },
    {} as { [id: string]: TerrainUnitMember },
  );

  const existingGuids = readPresentedGuids(storeEvent);

  const items = (await Promise.all(fetchPromises)).flat().reduce((result, item) => {
    if (item.status === "awarded") {
      result.push(new SummitAchievement(item, membersMap[item.member_id], existingGuids));
    }
    return result;
  }, [] as SummitAchievement[]);

  return { storeEvent, items };
}

/** Unpacks the presented-award GUIDs from a storage event, honouring both schema versions. */
export function readPresentedGuids(storeEvent: TerrainEvent | undefined): { guid: string; date: Date | null }[] {
  const existingAwards = storeEvent && storeEvent.schedule_items ? storeEvent.schedule_items.flatMap((item) => item.description) : [];
  return storeEvent?.equipment_notes === STORAGE_EVENT_DATA_VERSION ? reconstructGuidsAndDates(existingAwards) : reconstructGuids(existingAwards).map((guid) => ({ guid, date: null }));
}

/**
 * One presented award, in the minimal form the storage event needs.
 *
 * The merge works in these rather than in SummitAchievement, because an award merged in from
 * ANOTHER user's save exists only as packed data in their schedule item — there is no
 * SummitAchievement for it in this user's session unless they happen to have loaded the same row.
 * Everything the payload builder needs is recoverable from the stored item: the packed
 * description carries the guid and date, `leader_notes` the member id, `assistant_notes` the name.
 */
export interface PresentedAwardRecord {
  guid: string;
  date: Date;
  memberid: string;
  membername: string;
}

/**
 * Reads a storage event as full award records, preserving which member each award belongs to.
 *
 * readPresentedGuids() deliberately flattens that away, because its callers only ask "is this
 * guid presented?". The merge needs more: it has to write back other users' awards untouched, and
 * that requires their member attribution to survive the round trip.
 *
 * Falls back to the event's own last-written time for a v1 award, which stored no date.
 */
export function readPresentedRecords(storeEvent: TerrainEvent | undefined): PresentedAwardRecord[] {
  if (!storeEvent?.schedule_items) return [];

  const isCurrentVersion = storeEvent.equipment_notes === STORAGE_EVENT_DATA_VERSION;
  const fallbackDate = lastWrittenAt(storeEvent) ?? new Date();

  return storeEvent.schedule_items.flatMap((item) => {
    const unpacked = isCurrentVersion ? reconstructGuidsAndDates([item.description]) : reconstructGuids([item.description]).map((guid) => ({ guid, date: null as Date | null }));

    return unpacked.map((entry) => ({
      guid: entry.guid,
      date: entry.date ?? fallbackDate,
      memberid: item.leader_notes ?? "",
      membername: item.assistant_notes ?? "",
    }));
  });
}

/**
 * When this storage event was last written, or null if it has never been.
 *
 * buildStorageEventPayload stamps every schedule item's start_datetime with moment() at save
 * time, so every save rewrites them all to "now" — which makes the latest one a de-facto
 * "last written at" clock. Not used to DETECT a concurrent save (the content hash does that, and
 * catches changes within the same second), but it lets the user be told when the other save
 * happened.
 */
export function lastWrittenAt(storeEvent: TerrainEvent | undefined): Date | null {
  const times = (storeEvent?.schedule_items ?? []).map((item) => new Date(item.start_datetime).getTime()).filter((time) => !Number.isNaN(time));

  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

/**
 * Fingerprint of a storage event's contents, for detecting that someone else has written since we
 * read it.
 *
 * Deliberately derived from the data rather than stored as a counter: a counter only records
 * writes that went through this code, so an older Summit build, the legacy page, or a manual edit
 * would leave it stale — and it would fail while still appearing to work. A content hash is
 * correct by construction, whoever wrote and however.
 *
 * FNV-1a. This detects accidental concurrent edits, not tampering; the merge is conservative
 * anyway, and two genuinely different award sets colliding is vanishingly unlikely.
 */
export function hashStorageEvent(storeEvent: TerrainEvent | undefined): string {
  // Sorted so an insertion order change alone doesn't read as a content change — the packed
  // descriptions are what matter, not which schedule item they landed in.
  const content = (storeEvent?.schedule_items ?? [])
    .map((item) => item.description)
    .sort()
    .join("|");

  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Reconciles this user's save against what is on the server now, keeping both sets of work.
 *
 * Compares what the user is saving against THE BASE THEY LOADED, so only their deliberate
 * changes are applied on top of the current server state. Everything they merely carried along
 * unchanged has no effect, and other users' awards pass through untouched.
 *
 * That distinction is what resolves the one genuinely divergent case. Two users working from the
 * same base can only move an award the same direction — both ticking, or both unticking — which
 * merges trivially. Divergence needs different bases, i.e. a third save in between:
 *
 *   09:00  Alice loads          → award X is "not presented"
 *   09:05  Carol ticks X, saves → X is now presented
 *   09:06  Bob loads            → X is "presented"
 *   09:10  Alice ticks X        → acting on stale data; X was already presented
 *   09:11  Bob unticks X        → sees it presented, judges it wrong, corrects it
 *
 * Alice's set contains X but so did nothing she changed — X was not in her base, yet she "added"
 * something already true, so the union absorbs it harmlessly. Bob's base HAD X and his save omits
 * it, so he deliberately removed it, and that removal wins. No precedence rule is needed; the
 * diff distinguishes a decision from inherited state.
 *
 * Irreducible case, accepted: two users changing the same award in opposite directions, from
 * different bases, within the few hundred milliseconds between the re-read and the write. Both
 * intents are real and simultaneous with no basis to choose, so last write wins. Closing that
 * would need a server-side conditional write, which Terrain does not offer.
 */
export function mergePresentedAwards(base: PresentedAwardRecord[], mine: PresentedAwardRecord[], current: PresentedAwardRecord[]): PresentedAwardRecord[] {
  const baseGuids = new Set(base.map((record) => record.guid));
  const mineGuids = new Set(mine.map((record) => record.guid));

  // What this user actually decided, as opposed to carried along unchanged.
  const added = mine.filter((record) => !baseGuids.has(record.guid));
  const removedGuids = new Set(base.filter((record) => !mineGuids.has(record.guid)).map((record) => record.guid));

  const result = new Map<string, PresentedAwardRecord>();
  current.forEach((record) => result.set(record.guid, record));
  // This user's own edits win over the server's copy of the same award, so a date they changed
  // is not silently reverted to whatever was already stored.
  mine.filter((record) => !removedGuids.has(record.guid) && result.has(record.guid)).forEach((record) => result.set(record.guid, record));
  added.forEach((record) => result.set(record.guid, record));
  removedGuids.forEach((guid) => result.delete(guid));

  return Array.from(result.values());
}

/**
 * Builds the full storage-event payload from the complete list of presented awards.
 *
 * Note this is a whole-event replacement, not a merge: the caller must pass EVERY award that
 * should remain presented. savePresentedAwards() handles the merging before calling this.
 */
export function buildStorageEventPayload(newItems: SummitAchievement[]): TerrrainPostEvent {
  return buildStorageEventPayloadFromRecords(newItems.map(toPresentedAwardRecord));
}

/** The storage-event form of a row the user has ticked. */
export function toPresentedAwardRecord(item: SummitAchievement): PresentedAwardRecord {
  return {
    guid: item.id,
    date: moment(item.presented, DISPLAY_DATE_FORMAT).toDate(),
    memberid: item.memberid,
    membername: item.member,
  };
}

/** As buildStorageEventPayload, but over the merge's own record form. */
export function buildStorageEventPayloadFromRecords(records: PresentedAwardRecord[]): TerrrainPostEvent {
  // Group the presented awards by member.
  const presentedRecordsByMember = [] as { memberid: string; membername: string; awards: { guid: string; date: Date }[] }[];
  records.forEach((item) => {
    const existing = presentedRecordsByMember.find((i) => i.memberid === item.memberid);
    if (existing) {
      existing.awards.push({ guid: item.guid, date: item.date });
    } else {
      presentedRecordsByMember.push({ memberid: item.memberid, membername: item.membername, awards: [{ guid: item.guid, date: item.date }] });
    }
  });

  // Compress the award guids to base 300.
  const compressedRecordsByMember = presentedRecordsByMember.map((idArray) => {
    return { memberid: idArray.memberid, membername: idArray.membername, awards: processGuidsAndDates(idArray.awards) };
  });

  // Unbatch the awards: one schedule item per member, or more for members who exceed the batch limit.
  const scheduleItems = [] as TerrainEventScheduleItem[];
  compressedRecordsByMember.forEach((idArray) => {
    idArray.awards.forEach((award) => {
      scheduleItems.push({
        start_datetime: moment().format(),
        end_datetime: moment().format(),
        description: award,
        leader_notes: idArray.memberid,
        assistant_notes: idArray.membername,
      });
    });
  });

  return {
    schedule_items: scheduleItems,
    title: STORAGE_EVENT_TITLE,
    achievement_pathway_logbook_data: {
      achievement_meta: {
        stream: "",
        branch: "",
      },
    },
    achievement_pathway_oas_data: {
      award_rule: "individual",
      verifier: {
        name: "Not Applicable",
        contact: "",
        type: "member",
      },
      groups: [],
    },
    attendance: {
      leader_member_ids: [],
      assistant_member_ids: [],
      attendee_member_ids: [],
      participant_member_ids: [],
    },
    challenge_area: "creative",
    description: "This is for keeping track of badges that have been presented, please do not modify this event or delete it.",
    end_datetime: "2100-01-10T03:00:00.000+00:00",
    equipment_notes: STORAGE_EVENT_DATA_VERSION,
    event_type: { type: "unit", id: TerrainState.getUnitID() },
    type: "unit",
    iana_timezone: "Australia/Brisbane",
    justification: "",
    location: "Summit Award Storage ",
    organisers: [TerrainState.getMemberID()],
    review: { general_tags: [], scout_method_elements: ["symbolic_framework"], scout_spices_elements: [] },
    start_datetime: "2100-01-10T02:00:00.000+00:00",
    status: "planned",
    uploads: [],
  } as TerrrainPostEvent;
}

/**
 * Writes the presented awards back to the storage event, creating it if this unit has never
 * presented anything before.
 *
 * Unlike the original inline implementation in PresentAwards.ts, this awaits the network call and
 * returns its result. That call was previously fire-and-forget with the SaveEventResult discarded,
 * so a failed save was completely invisible to the user — there was no way to report an outcome
 * from a promise nobody held.
 */
export async function savePresentedAwards(storeEvent: TerrainEvent | undefined, newItems: SummitAchievement[]): Promise<SaveEventResult> {
  const guardFailure = checkNotAnAccidentalWipe(storeEvent, newItems);
  if (guardFailure) {
    logger.error("refused to save:", guardFailure);
    return {
      ok: false,
      status: 0,
      topLevelMessages: [guardFailure],
      fieldErrors: {},
      rawMessage: guardFailure,
    };
  }

  if (!storeEvent?.id) {
    // Nothing stored yet, so there is nothing to merge against.
    return await createNewEvent(JSON.stringify(buildStorageEventPayload(newItems)));
  }

  const base = readPresentedRecords(storeEvent);
  const mine = newItems.map(toPresentedAwardRecord);
  const baseHash = hashStorageEvent(storeEvent);

  // Re-read immediately before writing, so the window in which a concurrent save can slip through
  // is the round trip below rather than the minutes a leader leaves the page open.
  const latest = await fetchActivity(storeEvent.id);

  // A failed re-read must not be read as "the event is now empty" — merging into that would
  // produce a wipe. Fail loudly instead.
  if (!latest) {
    return saveFailure("Could not check for other changes before saving. Nothing was saved — please try again.");
  }

  const someoneElseSaved = hashStorageEvent(latest) !== baseHash;
  const toWrite = someoneElseSaved ? mergePresentedAwards(base, mine, readPresentedRecords(latest)) : mine;

  if (someoneElseSaved) {
    logger.info("merging with a concurrent save", { at: lastWrittenAt(latest)?.toISOString() });
  }

  const result = await updateEvent(storeEvent.id, JSON.stringify(buildStorageEventPayloadFromRecords(toWrite)));
  if (!result.ok || !someoneElseSaved) {
    return result;
  }

  return { ok: true, mergedWith: lastWrittenAt(latest) };
}

function saveFailure(message: string): SaveEventResult {
  logger.error(message);
  return { ok: false, status: 0, topLevelMessages: [message], fieldErrors: {}, rawMessage: message };
}

/**
 * Refuses a save that would wipe an existing presentation history.
 *
 * The save is a whole-event replace, so writing an empty list over a populated event erases every
 * presentation record for the unit — irreversibly, since the previous list is simply gone. That
 * is a legitimate action when a leader genuinely unticks everything, and a catastrophe when it
 * happens because the page loaded without its data (a failed or partial fetch leaves
 * `loadPresentedAwards` unable to distinguish "nothing has ever been presented" from "we could
 * not read it").
 *
 * Callers pass the items they intend to store, so the two cases are told apart by whether the UI
 * had the stored awards in hand at all: a deliberate clear-out comes from a page that loaded the
 * history and then removed it, which means `items` was non-empty at some point. This function can
 * only see the outgoing list, so it takes the conservative reading and asks the user to confirm
 * via a reload rather than guessing.
 *
 * Returns a message describing the refusal, or null to proceed.
 */
export function checkNotAnAccidentalWipe(storeEvent: TerrainEvent | undefined, newItems: SummitAchievement[]): string | null {
  if (newItems.length > 0) {
    return null;
  }

  const storedCount = readPresentedGuids(storeEvent).length;
  if (storedCount === 0) {
    return null;
  }

  return `This would clear all ${storedCount} previously presented award${storedCount === 1 ? "" : "s"} for the unit. If that is what you want, untick them individually; otherwise reload the page and try again.`;
}
