import { TerrainState } from "@/helpers";

export default async function saveLogbookData(text: string): Promise<void> {
  try {
    if (!TerrainState.getToken()) return undefined;
    console.debug("Sending logbook to terrain");
    await fetch("https://achievements.terrain.scouts.com.au/members/" + TerrainState.getMemberID() + "/logbook", {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        authorization: TerrainState.getToken(),
        "content-type": "application/json;charset=UTF-8",
        "sec-ch-ua": "'Chromium';v='94', 'Microsoft Edge';v='94', ';Not A Brand';v='99'",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
      referrer: "https://terrain.scouts.com.au/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: text,
      method: "POST",
      mode: "cors",
    });
  } catch (e) {
    console.log("Error saving logbook: " + e);
    return undefined;
  }
}
