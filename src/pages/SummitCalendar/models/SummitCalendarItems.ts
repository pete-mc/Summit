import { TerrainEvent, TerrainEventSummary } from "@/types/terrainTypes";

export default class SummitCalendarItem {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  Description: string;
  Location?: string;
  color: string;
  event: TerrainEventSummary;
  activity: TerrainEvent | null = null;

  constructor(event: TerrainEventSummary) {
    this.Id = event.id;
    this.event = event;
    this.Subject = event.status === "concluded" ? "✅" + event.title : event.title;
    this.StartTime = new Date(event.start_datetime);
    this.EndTime = new Date(event.end_datetime);
    this.Description =
      event.invitee_type.charAt(0).toUpperCase() +
      event.invitee_type.slice(1).toLowerCase() +
      ": " +
      event.invitee_name +
      "\n" +
      "Status:" +
      event.status.replace(/(?:^|_)(.)/g, (match, group1) => " " + group1.toUpperCase()) +
      "\n" +
      "Area:" +
      event.challenge_area.replace(/(?:^|_)(.)/g, (match, group1) => " " + group1.toUpperCase());
    switch (event.section) {
      case "joey":
        this.color = "#b65518";
        break;
      case "cub":
        this.color = "#ffc82e";
        break;
      case "scout":
        this.color = "#00ae42";
        break;
      case "venturer":
        this.color = "#9e1b32";
        break;
      case "rover":
        this.color = "#dc291e";
        break;
      default:
        this.color = "#f89d69";
        break;
    }
  }
}
