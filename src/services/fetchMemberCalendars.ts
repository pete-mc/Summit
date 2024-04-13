import { TerrainState } from "@/helpers";
import { type TerrrainCalendarResult } from "../types/terrainTypes";

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
    // eslint-disable-next-line no-console
    console.log(`Error fetching calendars: ${e}`);
    return {};
  }
}
