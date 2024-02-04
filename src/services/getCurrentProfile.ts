import { type TerrainProfile } from "../types/terrainTypes";
import { TerrainState } from "@/helpers";

export default async function getCurrentProfile(): Promise<TerrainProfile[] | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch("https://members.terrain.scouts.com.au/profiles", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
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
    // cache the data for 5 mins
    return data.profiles as TerrainProfile[];
  } catch (e) {
    console.log("Error fetching current profile: " + e);
    return undefined;
  }
}
