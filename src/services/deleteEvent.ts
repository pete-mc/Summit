import { TerrainState, createLogger } from "@/helpers";

const logger = createLogger("deleteEvent");

export default async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    if (!TerrainState.getToken()) return false;
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
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}
