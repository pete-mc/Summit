import { type TerrainUnitMember } from "../types/terrainTypes";
import { TerrainState, createLogger } from "@/helpers";

const logger = createLogger("fetchUnitMembers");

export default async function fetchUnitMembers(): Promise<TerrainUnitMember[]> {
  try {
    if (!TerrainState.getToken()) return [];
    const response = await fetch("https://members.terrain.scouts.com.au/units/" + TerrainState.getUnitID() + "/members", {
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
    const jsonData = await response.json();
    return jsonData.results;
  } catch (e) {
    logger.error(e);
    return [];
  }
}
