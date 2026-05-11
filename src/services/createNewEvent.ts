import { TerrainState } from "@/helpers";
import { normalizeSaveEventFailure, SaveEventResult } from "./saveEventResult";

export default async function createNewEvent(body: string): Promise<SaveEventResult> {
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

    const response = await fetch("https://events.terrain.scouts.com.au/units/" + TerrainState.getUnitID() + "/events", {
      method: "POST",
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
    console.log("Error creating event: " + e);

    return {
      ok: false,
      status: 0,
      topLevelMessages: [e instanceof Error ? e.message : "Unknown error creating event."],
      fieldErrors: {},
      rawMessage: e instanceof Error ? e.message : String(e),
    };
  }
}
