import { fetchActivity } from "../terrainCalls";
import $ from "jquery";
import jquery from "jquery";

export async function exportiCal(): Promise<void> {
  const activityIdElement = $("p.ActivityPlan__activity-id");
  if (activityIdElement.length === 0) {
    console.error("Activity ID element not found.");
    return;
  }
  const activityId = activityIdElement.text().split(": ")[1];

  const eventData = await fetchActivity(activityId);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (jquery(".exportiCalBtn").length > 0) return;
  const printBtn = jquery('button[data-cy="PRINT"]').first();
  printBtn.before(
    jquery("<button>", {
      click: exportiCal,
      id: "exportiCalBtn",
      text: "Save to Calendar (iCal)",
      class: "exportiCalBtn",
    }),
  );
  // add property data-v-718788cc to button
  jquery(".exportiCalBtn").attr("data-v-718788cc", "");
  setClasses();
  const targetNode = jquery(".exportiCalBtn").siblings(".v-btn--is-elevated").first().get(0);
  const config = { attributes: true, childList: false, subtree: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callback = function (mutationsList: any) {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes") {
        if (mutation.attributeName === "class") {
          setClasses();
        }
      }
    }
  };
  const observer = new MutationObserver(callback);
  if (targetNode) observer.observe(targetNode, config);
}

function setClasses() {
  const button = jquery(".exportiCalBtn");
  button.removeClass().addClass("exportiCalBtn");
  //set all classes from target to button
  const classes = jquery(".exportiCalBtn").siblings(".v-btn--is-elevated").first().attr("class");
  button.addClass(classes ? classes : "");
  button.addClass("summit-btn");
}
