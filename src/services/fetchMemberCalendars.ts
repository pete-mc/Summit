import { TerrainState, createLogger } from "@/helpers";
import { type TerrrainCalendarResult } from "../types/terrainTypes";

const logger = createLogger("fetchMemberCalendars");

export default async function fetchMemberCalendars(): Promise<TerrrainCalendarResult> {
  try {
    if (!TerrainState.getToken()) return {};
    const response = await fetch(`https://events.terrain.scouts.com.au/members/${TerrainState.getMemberID()}/calendars`, {
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
    const data = await response.json();
    return data;
  } catch (e) {
    logger.error(e);
    return {};
  }
}
