import { TerrainState } from "@/helpers";
import { type TerrainUnitMemberMetric } from "../types/terrainTypes";

export default async function fetchUnitMembersMetrics(): Promise<TerrainUnitMemberMetric[] | undefined> {
  try {
    const response = await fetch("https://metrics.terrain.scouts.com.au/units/" + TerrainState.getUnitID() + "/members?limit=999", {
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
    return data.results as TerrainUnitMemberMetric[];
  } catch (e) {
    console.log("Error fetching unit members: " + e);
    return undefined;
  }
}
