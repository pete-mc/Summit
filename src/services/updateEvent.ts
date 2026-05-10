import { TerrainState } from "@/helpers";
import { normalizeSaveEventFailure, SaveEventResult } from "./saveEventResult";

export default async function updateEvent(eventId: string, body: string): Promise<SaveEventResult> {
  try {
    if (!TerrainState.getToken()) {
      return {
        ok: false,
        status: 401,
        topLevelMessages: ["Authentication is required to save this event."],
        fieldErrors: {},
        rawMessage: "Authentication is required to save this event.",
      };
    }

    const response = await fetch("https://events.terrain.scouts.com.au/events/" + eventId, {
      method: "PATCH",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: TerrainState.getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      body,
    });

    if (response.ok) {
      return { ok: true };
    }

    const responseText = await response.text();
    return normalizeSaveEventFailure(response.status, responseText);
  } catch (e) {
    console.log("Error updating event: " + e);

    return {
      ok: false,
      status: 0,
      topLevelMessages: [e instanceof Error ? e.message : "Unknown error updating event."],
      fieldErrors: {},
      rawMessage: e instanceof Error ? e.message : String(e),
    };
  }
}
