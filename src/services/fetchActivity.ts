import { TerrainState, createLogger } from "@/helpers";
import { type TerrainEvent } from "../types/terrainTypes";

const logger = createLogger("fetchActivity");

export default async function fetchActivity(activityId: string | undefined): Promise<TerrainEvent | undefined> {
  try {
    if (!TerrainState.getToken() || !activityId) return undefined;
    const response = await fetch(`https://events.terrain.scouts.com.au/events/${activityId}`, {
      method: "GET",
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
    return await response.json();
  } catch (e) {
    logger.error(e);
    return undefined;
  }
}
