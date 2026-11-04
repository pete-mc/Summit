import { TerrainState, createLogger } from "@/helpers";

const logger = createLogger("fetchSIATemplate");

export default async function fetchSIATemplate(templateId: string): Promise<unknown | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch("https://templates.terrain.scouts.com.au/sia/" + templateId + ".json", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Authorization: TerrainState.getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  } catch (e) {
    logger.error(e);
    return undefined;
  }
}
