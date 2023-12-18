import { SummitContext } from "../summitContext";
import { fetchActivity } from "../terrainCalls";
import $ from "jquery";

export async function exportiCal(context: SummitContext): Promise<void> {
  const activityIdElement = $("p.ActivityPlan__activity-id");
  if (activityIdElement.length === 0) {
    console.error("Activity ID element not found.");
    return;
  }
  const activityId = activityIdElement.text().split(": ")[1];

  const eventData = await fetchActivity(context, activityId);
  if (!eventData) return;

  const startDateTime = new Date(eventData.start_datetime);
  const endDateTime = new Date(eventData.end_datetime);

  const icsMSG = `BEGIN:VCALENDAR
BEGIN:VEVENT
URL:
DTSTART:${startDateTime.toISOString().replace(/[.:-]/g, "").substring(0, 15) + "Z"}
DTEND:${endDateTime.toISOString().replace(/[.:-]/g, "").substring(0, 15) + "Z"}
SUMMARY:${eventData.title}
DESCRIPTION:
LOCATION:${eventData.location}
END:VEVENT
END:VCALENDAR`;

  const element = $("<a>", {
    href: "data:text/calendar;charset=utf8," + encodeURIComponent(icsMSG),
    download: eventData.title + ".ics",
    css: {
      display: "none",
    },
  }).appendTo("body");

  element[0].click();
  element.remove();
}

export function initProgrammingExportBtn() {
  const btn = $(document).xpath(`//button[@data-cy='PRINT']`)[0];
  const newButton = $("<button>", {
    class: "mb-2 mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small summit-btn",
    click: exportiCal,
    text: "Save to Calendar (iCal)",
    id: "exportiCalBtn",
  });

  $(btn).addClass("mr-4").parent().append(newButton);
}
