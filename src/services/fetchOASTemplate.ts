import { type OASTemplate } from "../types/terrainTypes";
import { TerrainState, createLogger } from "@/helpers";

const logger = createLogger("fetchOASTemplate");

// Real values look like "oas/bushcraft/pioneering/4/latest.json" — a bare relative path
// segment, always sourced from Terrain's own OASTree response. This guards the fetch URL
// in case a future caller ever passes through something less trusted.
function isValidTemplateLink(templateLink: string): boolean {
  return templateLink.length > 0 && !templateLink.includes("://") && !templateLink.startsWith("/") && !templateLink.split("/").includes("..");
}

export default async function fetchOASTemplate(templateLink: string): Promise<OASTemplate | undefined> {
  try {
    if (!TerrainState.getToken()) return undefined;
    if (!isValidTemplateLink(templateLink)) {
      logger.error("rejected invalid templateLink", templateLink);
      return undefined;
    }
    const response = await fetch("https://templates.terrain.scouts.com.au/" + templateLink, {
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
      logger.error("non-OK response for", templateLink, ":", response.status);
      return undefined;
    }
    return await response.json();
  } catch (e) {
    logger.error("threw for", templateLink, ":", e);
    return undefined;
  }
}
