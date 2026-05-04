import { TerrainState } from "@/helpers";

export default async function createMemberAchievement(body: string): Promise<void | string | Record<string, unknown>> {
  try {
    if (!TerrainState.getToken()) return undefined;
    const response = await fetch("https://achievements.terrain.scouts.com.au/members/" + TerrainState.getMemberID() + "/achievements", {
      method: "POST",
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
      const responseText = await response.text();
      if (!responseText) {
        return "Could not create SIA project";
      }

      try {
        return JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        return responseText;
      }
    }
  } catch (e) {
    console.log("Error creating member achievement: " + e);
    throw e;
  }
}
