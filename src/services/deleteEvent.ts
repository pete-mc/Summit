import { TerrainState } from "@/helpers";

export default async function deleteEvent(eventId: string): Promise<void> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch("https://events.terrain.scouts.com.au/events/" + eventId, {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: TerrainState.getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (e) {
    console.log("Error updating event: " + e);
    throw e;
  }
}
