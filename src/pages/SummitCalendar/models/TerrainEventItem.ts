import { TerrainState } from "@/helpers";
import { TerrainEvent } from "@/types/terrainTypes";
import moment from "moment";

export default class TerrainEventItem {
  id?: string;
  title: string;
  description: string;
  justification: string;
  organisers: string[];
  challenge_area: string;
  start_datetime: string;
  end_datetime: string;
  event_type: { type: string; id: string };
  attendance: { leader_member_ids: string[]; assistant_member_ids: string[]; attendee_member_ids: string[] };
  schedule_items: { start_datetime: string; end_datetime: string; description: string; leader_notes: string; assistant_notes: string }[];
  achievement_pathway_oas_data: { award_rule: string; verifier: { name: string; contact: string; type: string }; groups: unknown[] };
  achievement_pathway_logbook_data: {
    distance_travelled?: number;
    distance_walkabout?: number;
    achievement_meta: { stream: string; branch: string };
    categories?: string[];
    details?: { activity_time_length: string; activity_grade: string };
    verifier: { name: string; contact: string; type: string };
  };
  review: { general_tags: never[]; scout_method_elements: string[]; scout_spices_elements: never[] };
  uploads: never[];
  equipment_notes: string;
  additional_notes: string;
  location: string;
  iana_timezone: string;
  status: string;
  constructor(terrainEvent: TerrainEvent | undefined) {
    this.id = terrainEvent?.id;
    this.title = terrainEvent?.title ?? "";
    this.description = terrainEvent?.description ?? "";
    this.justification = terrainEvent?.justification ?? "";
    this.organisers = terrainEvent?.organisers?.map((o) => o.id) ?? [];
    this.challenge_area = terrainEvent?.challenge_area ?? "";
    this.start_datetime = moment(terrainEvent?.start_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.end_datetime = moment(terrainEvent?.end_datetime).utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    this.event_type = {
      type: terrainEvent?.owner_type ?? "unit",
      id: terrainEvent?.owner_id ?? TerrainState.getUnitID(),
    };
    this.attendance = {
      leader_member_ids: terrainEvent?.attendance?.leader_members?.map((a) => a.id) ?? [],
      assistant_member_ids: terrainEvent?.attendance?.assistant_members?.map((a) => a.id) ?? [],
      attendee_member_ids: terrainEvent?.attendance?.attendee_members?.map((a) => a.id) ?? [],
    };
    this.schedule_items = [];
    this.achievement_pathway_oas_data = terrainEvent?.achievement_pathway_oas_data ?? {
      award_rule: "individual",
      verifier: {
        name: TerrainState.getMemberName(),
        contact: "",
        type: "member",
      },
      groups: [],
    };
    if (terrainEvent?.achievement_pathway_logbook_data) {
      this.achievement_pathway_logbook_data = {
        verifier: {
          name: TerrainState.getMemberName(),
          contact: "",
          type: "member",
        },
        ...terrainEvent?.achievement_pathway_logbook_data,
      };
    } else {
      this.achievement_pathway_logbook_data = {
        distance_travelled: 0,
        distance_walkabout: 0,
        achievement_meta: {
          stream: "",
          branch: "",
        },
        categories: [],
        details: {
          activity_time_length: "",
          activity_grade: "",
        },
        verifier: {
          name: TerrainState.getMemberName(),
          contact: "",
          type: "member",
        },
      };
    }

    this.review = {
      general_tags: [],
      scout_method_elements: terrainEvent?.review?.scout_method_elements ?? [],
      scout_spices_elements: [],
    };
    this.uploads = [];
    this.equipment_notes = "";
    this.additional_notes = "";
    this.location = terrainEvent?.location ?? "";
    this.iana_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.status = "planned";
  }
}
