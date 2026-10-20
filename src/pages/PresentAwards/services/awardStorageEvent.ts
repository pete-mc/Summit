import moment from "moment";
import { TerrainEvent, TerrainEventScheduleItem, TerrainUnitMember, TerrrainPostEvent } from "@/types/terrainTypes";
import { fetchMemberEvents, fetchUnitAchievementsFilterd, fetchActivity, updateEvent, createNewEvent, fetchUnitMembers } from "@/services";
import type { SaveEventResult } from "@/services/saveEventResult";
import { TerrainState, createLogger, processGuidsAndDates, reconstructGuids, reconstructGuidsAndDates } from "@/helpers";
import { TerrainAchievementsType } from "@/shared";
import SummitAchievement from "../models/SummitAchievement";

const logger = createLogger("awardStorageEvent");

/**
 * Learning: Terrain can't record that an award was physically presented, so Summit stores that in a
 * disguised calendar event dated in 2100. GUIDs + dates are base-300 packed into schedule_items[].description
 * (see CompressGuids.ts).
 * Gotcha: this module is the ONLY owner of that format, shared by the React and Vue pages. A second copy
 * could drift and silently corrupt a unit's history.
 */

export const STORAGE_EVENT_TITLE = "Summit Award Storage - Please Ignore";

/**
 * equipment_notes holds the schema version: "1"/absent = 16-char chunks, GUIDs only; "2" = 19-char chunks, GUID + DDMMYY.
 * Reads must handle both; writes always use the current version.
 */
export const STORAGE_EVENT_DATA_VERSION = "2";

const STORAGE_EVENT_WINDOW_START = "2100-01-01T00:00:00";
const STORAGE_EVENT_WINDOW_END = "2100-01-30T00:00:00";

const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

export interface PresentedAwardsLoad {
  /** Undefined if this unit has never presented anything. */
  storeEvent: TerrainEvent | undefined;
  items: SummitAchievement[];
}

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

export function readPresentedGuids(storeEvent: TerrainEvent | undefined): { guid: string; date: Date | null }[] {
  const existingAwards = storeEvent && storeEvent.schedule_items ? storeEvent.schedule_items.flatMap((item) => item.description) : [];
  return storeEvent?.equipment_notes === STORAGE_EVENT_DATA_VERSION ? reconstructGuidsAndDates(existingAwards) : reconstructGuids(existingAwards).map((guid) => ({ guid, date: null }));
}

/** Gotcha: the merge can't use SummitAchievement, because awards from another user's save only exist as packed data. leader_notes = member id, assistant_notes = name. */
export interface PresentedAwardRecord {
  guid: string;
  date: Date;
  memberid: string;
  membername: string;
}

/** Unlike readPresentedGuids, keeps member attribution so other users' awards survive a merge. v1 awards (no date) use the last-written time. */
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

/** Every save stamps all items with "now", so the latest is the last-written time. Used for messages only; the hash detects changes. */
export function lastWrittenAt(storeEvent: TerrainEvent | undefined): Date | null {
  const times = (storeEvent?.schedule_items ?? []).map((item) => new Date(item.start_datetime).getTime()).filter((time) => !Number.isNaN(time));

  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

/**
 * Learning: a content hash (FNV-1a), not a stored counter, because a counter misses writes from older builds,
 * the legacy page or manual edits. It catches accidental concurrent edits, not tampering.
 */
export function hashStorageEvent(storeEvent: TerrainEvent | undefined): string {
  // Sorted so a reordering alone isn't a change.
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
 * Learning: diff the user's save against the base THEY loaded, and apply only their changes on top of the
 * current server state. That separates a decision from inherited state, so no precedence rule is needed:
 *   Alice loads (X not presented); Carol ticks X; Bob loads (X presented);
 *   Alice ticks X (harmless, already true); Bob unticks X (deliberate removal, wins).
 * Accepted gap: opposite changes from different bases within the ms between re-read and write. Last write wins;
 * Terrain has no conditional write.
 */
export function mergePresentedAwards(base: PresentedAwardRecord[], mine: PresentedAwardRecord[], current: PresentedAwardRecord[]): PresentedAwardRecord[] {
  const baseGuids = new Set(base.map((record) => record.guid));
  const mineGuids = new Set(mine.map((record) => record.guid));

  const added = mine.filter((record) => !baseGuids.has(record.guid));
  const removedGuids = new Set(base.filter((record) => !mineGuids.has(record.guid)).map((record) => record.guid));

  const result = new Map<string, PresentedAwardRecord>();
  current.forEach((record) => result.set(record.guid, record));
  // The user's own edits win, so a date they changed isn't reverted.
  mine.filter((record) => !removedGuids.has(record.guid) && result.has(record.guid)).forEach((record) => result.set(record.guid, record));
  added.forEach((record) => result.set(record.guid, record));
  removedGuids.forEach((guid) => result.delete(guid));

  return Array.from(result.values());
}

/** Gotcha: a whole-event replacement, not a merge. Pass EVERY award that should stay presented. */
export function buildStorageEventPayload(newItems: SummitAchievement[]): TerrrainPostEvent {
  return buildStorageEventPayloadFromRecords(newItems.map(toPresentedAwardRecord));
}

export function toPresentedAwardRecord(item: SummitAchievement): PresentedAwardRecord {
  return {
    guid: item.id,
    date: moment(item.presented, DISPLAY_DATE_FORMAT).toDate(),
    memberid: item.memberid,
    membername: item.member,
  };
}

export function buildStorageEventPayloadFromRecords(records: PresentedAwardRecord[]): TerrrainPostEvent {
  const presentedRecordsByMember = [] as { memberid: string; membername: string; awards: { guid: string; date: Date }[] }[];
  records.forEach((item) => {
    const existing = presentedRecordsByMember.find((i) => i.memberid === item.memberid);
    if (existing) {
      existing.awards.push({ guid: item.guid, date: item.date });
    } else {
      presentedRecordsByMember.push({ memberid: item.memberid, membername: item.membername, awards: [{ guid: item.guid, date: item.date }] });
    }
  });

  const compressedRecordsByMember = presentedRecordsByMember.map((idArray) => {
    return { memberid: idArray.memberid, membername: idArray.membername, awards: processGuidsAndDates(idArray.awards) };
  });

  // One schedule item per member, or more when a member exceeds the batch limit.
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

/** Creates the event on first use. Awaits and returns the result, so a failed save is reported. */
export async function savePresentedAwards(storeEvent: TerrainEvent | undefined, newItems: SummitAchievement[]): Promise<SaveEventResult> {
  const guardFailure = checkNotAnAccidentalWipe(storeEvent, newItems);
  if (guardFailure) {
    return saveFailure(`refused to save: ${guardFailure}`, guardFailure);
  }

  if (!storeEvent?.id) {
    return await createNewEvent(JSON.stringify(buildStorageEventPayload(newItems)));
  }

  const base = readPresentedRecords(storeEvent);
  const mine = newItems.map(toPresentedAwardRecord);
  const baseHash = hashStorageEvent(storeEvent);

  // Re-read just before writing, so the race window is one round trip, not however long the page was open.
  const latest = await fetchActivity(storeEvent.id);

  // Gotcha: a failed re-read must not look like an empty event. Merging into that would wipe everything.
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

function saveFailure(logMessage: string, userMessage = logMessage): SaveEventResult {
  logger.error(logMessage);
  return { ok: false, status: 0, topLevelMessages: [userMessage], fieldErrors: {}, rawMessage: userMessage };
}

/**
 * Gotcha: saving an empty list over a populated event irreversibly erases the unit's history. A failed load
 * looks the same as "nothing presented", so refuse and ask for a reload. Returns the refusal message, or null.
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
