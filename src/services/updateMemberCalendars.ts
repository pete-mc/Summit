import { TerrainState, createLogger } from "@/helpers";

const logger = createLogger("updateMemberCalendars");

export default async function updateMemberCalendars(body: string): Promise<boolean> {
  try {
    if (!TerrainState.getToken()) return false;
    const response = await fetch(`https://events.terrain.scouts.com.au/members/${TerrainState.getMemberID()}/calendars`, {
      method: "PUT",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: TerrainState.getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      body,
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
