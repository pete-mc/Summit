import moment from "moment";
import { TerrainEvent, TerrainEventScheduleItem, TerrainUnitMember, TerrrainPostEvent } from "@/types/terrainTypes";
import { fetchMemberEvents, fetchUnitAchievementsFilterd, fetchActivity, updateEvent, createNewEvent, fetchUnitMembers } from "@/services";
import type { SaveEventResult } from "@/services/saveEventResult";
import { TerrainState, processGuidsAndDates, reconstructGuids, reconstructGuidsAndDates } from "@/helpers";
import { TerrainAchievementsType } from "@/shared";
import SummitAchievement from "../models/SummitAchievement";

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
 * Builds the full storage-event payload from the complete list of presented awards.
 *
 * Note this is a whole-event replacement, not a merge: the caller must pass EVERY award that
 * should remain presented, not just newly-ticked ones. Two leaders with the page open at once
 * will therefore have the later save win and silently discard the earlier one — a known,
 * pre-existing limitation carried over as-is from the React page (see .claude/DEV_NOTES.md).
 */
export function buildStorageEventPayload(newItems: SummitAchievement[]): TerrrainPostEvent {
  // Group the presented awards by member.
  const presentedRecordsByMember = [] as { memberid: string; membername: string; awards: { guid: string; date: Date }[] }[];
  newItems.forEach((item) => {
    const existing = presentedRecordsByMember.find((i) => i.memberid === item.memberid);
    if (existing) {
      existing.awards.push({ guid: item.id, date: moment(item.presented, "DD/MM/YYYY").toDate() });
    } else {
      presentedRecordsByMember.push({ memberid: item.memberid, membername: item.member, awards: [{ guid: item.id, date: moment(item.presented, "DD/MM/YYYY").toDate() }] });
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
  const body = JSON.stringify(buildStorageEventPayload(newItems));
  return storeEvent?.id ? await updateEvent(storeEvent.id, body) : await createNewEvent(body);
}
