import { type OASTree } from "../types/terrainTypes";
import { TerrainState, createLogger } from "@/helpers";

const logger = createLogger("fetchOASTree");

export default async function fetchOASTree(stream: string): Promise<OASTree | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch("https://templates.terrain.scouts.com.au/oas/" + stream + "/tree.json", {
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
      logger.error("non-OK response for stream", stream, ":", response.status);
      return undefined;
    }
    return await response.json();
  } catch (e) {
    logger.error("threw for stream", stream, ":", e);
    return undefined;
  }
}
