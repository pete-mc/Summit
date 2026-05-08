import { fetchActivity } from "@/services";
import { downloadBlob } from "@/helpers";
import $ from "jquery";
import jquery from "jquery";

export async function ExportiCal(event?: Event | JQuery.ClickEvent<HTMLElement>): Promise<void> {
  const initiatingElement = (event?.currentTarget as HTMLElement | null | undefined) ?? null;
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

  downloadBlob(icsMSG, eventData.title + ".ics", "text/calendar;charset=utf-8", initiatingElement?.parentElement ?? undefined);
}

export function InitProgrammingExportBtn() {
  if (jquery(".exportiCalBtn").length > 0) return;
  const printBtn = jquery('button[data-cy="PRINT"]').first();
  printBtn.before(
    jquery("<button>", {
      click: ExportiCal,
      id: "exportiCalBtn",
      text: "Save to Calendar (iCal)",
      class: "exportiCalBtn",
    }),
  );
  // copy data-v-* attributes from print button to export button
  const exportBtn = jquery(".exportiCalBtn");
  Array.from(printBtn.get(0)?.attributes ?? []).forEach((attr) => {
    if (attr.name.startsWith("data-v-")) {
      exportBtn.attr(attr.name, "");
    }
  });
  setClasses();
  const targetNode = jquery(".exportiCalBtn").siblings('button[data-cy="PRINT"]').first().get(0);
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
  const classes = jquery(".exportiCalBtn").siblings('button[data-cy="PRINT"]').first().attr("class");
  button.addClass(classes ? classes : "");
  button.addClass("summit-menu-outline");
}
