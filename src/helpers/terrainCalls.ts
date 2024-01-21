/*
| Action Description                    | Endpoint URL                                                                                
|---------------------------------------|---------------------------------------------------------------------------------------------
| Retrieve Profiles                     | https://members.terrain.scouts.com.au/profiles 
| Retrieve Members of a Unit            | https://members.terrain.scouts.com.au/units/[selectedUnitId]/members 
| Revoke Assumed Profiles               | https://members.terrain.scouts.com.au/revoke-assumed-profiles 
| Assume Profile for a Member           | https://members.terrain.scouts.com.au/members/[memberId]/assume-profiles 
| Retrieve Events for a Member          | https://events.terrain.scouts.com.au/members/[userId]/events?start_datetime=[fromDateString]&end_datetime=[toDateString]
| Retrieve Specific Event               | https://events.terrain.scouts.com.au/events/[eventId]
| Retrieve Calendar for a Member        | https://events.terrain.scouts.com.au/members/[userId]/calendars 
| Post Calendar Entry for unit          | https://events.terrain.scouts.com.au/units/[unitId]/events
| Retrieve Group Life for Unit          | https://metrics.terrain.scouts.com.au/units/[unitId]/members?limit=999 
| Retrieve Member Logbook Metrics       | https://achievements.terrain.scouts.com.au/members/[memberId]/logbook-metrics 
| Retrieve Member Logbook Summary       | https://achievements.terrain.scouts.com.au/members/[memberId]/logbook 
| Retrieve Member Logbook Detail        | https://achievements.terrain.scouts.com.au/members/[memberId]/logbook/[logbookId]
| Retrieve Full list of Unit's Awards   | https://achievements.terrain.scouts.com.au/units/[unitId]/achievements
| Retrieve Unit's Additional Awards     | https://achievements.terrain.scouts.com.au/units/[unitId]/achievements?type=additional_award 
| Retrieve Unit Approvals               | https://achievements.terrain.scouts.com.au/units/[unitId]/submissions?status=[status]
| Retrieve Member's Achievement Result  | https://achievements.terrain.scouts.com.au/members/[member_id]/achievements/[achievement_id]?type=[achievement_type]
| Retrieve Unit's OAS Achievements      | https://achievements.terrain.scouts.com.au/units/[unit]/achievements?type=outdoor_adventure_skill&stream=[stream]&branch=[branch]&stage=[stage]
| Retrieve SIA Results for Member       | https://achievements.terrain.scouts.com.au/members/[memberId]/achievements?type=special_interest_area 
| Retrieve Specific SIA Result          | https://achievements.terrain.scouts.com.au/members/[memberId]/achievements/[achievementId]?type=special_interest_area 
| Retrieve Latest OAS Template          | https://templates.terrain.scouts.com.au/[stream]/latest.json 
| Retrieve Additional Awards Specs      | https://templates.terrain.scouts.com.au/additional-awards/specifications.json 
| Retrieve OAS Tree for Stream          | https://templates.terrain.scouts.com.au/oas/[stream]/tree.json 
/ Retrieve SIA Template                 | https://templates.terrain.scouts.com.au/sia/[achievementTemplate].json
*/

import { TerrainRootState } from "@/types/terrainState";
import { TerrainAchievements, TerrainEvent, TerrainEventSummary, TerrainLogbook, TerrainProfile, TerrainUnitMember, TerrainUnitMemberMetric } from "../types/terrainTypes";

function getUnitID(): string {
  return (window.$nuxt.$store.state as TerrainRootState).me.currentUnit.id;
}

function getToken(): string {
  return (window.$nuxt.$store.state as TerrainRootState).auth.idToken;
}

function getMemberID(): string {
  return (window.$nuxt.$store.state as TerrainRootState).user.profiles[(window.$nuxt.$store.state as TerrainRootState).user.profileIndex].member.id;
}

//function to retrieve unit members profiles from the Terrain API or cache
export async function fetchUnitMembersMetrics(): Promise<TerrainUnitMemberMetric[] | undefined> {
  try {
    const response = await fetch("https://metrics.terrain.scouts.com.au/units/" + getUnitID() + "/members?limit=999", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
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

//function to create an event
export async function createNewEvent(body: string): Promise<void | string> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://events.terrain.scouts.com.au/units/" + getUnitID() + "/events", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: body,
    });
    if (!response.ok) {
      return JSON.parse(await response.text());
    }
  } catch (e) {
    console.log("Error creating event: " + e);
    throw e;
  }
}

//function to update an event
export async function updateEvent(eventId: string, body: string): Promise<void> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://events.terrain.scouts.com.au/events/" + eventId, {
      method: "PATCH",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (e) {
    console.log("Error updating event: " + e);
    throw e;
  }
}

//get event for member
export async function fetchMemberEvents(fromDateString: string, toDateString: string): Promise<TerrainEventSummary[] | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://events.terrain.scouts.com.au/members/" + getMemberID() + "/events?start_datetime=" + fromDateString + "&end_datetime=" + toDateString, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (e) {
    console.log("Error fetching member events: " + e);
    return undefined;
  }
}

//get sia template
export async function fetchSIATemplate(templateId: string): Promise<unknown | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://templates.terrain.scouts.com.au/sia/" + templateId + ".json", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Authorization: getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  } catch (e) {
    console.log("Error fetching sia template: " + e);
    return undefined;
  }
}

export async function getCurrentProfile(): Promise<TerrainProfile[] | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://members.terrain.scouts.com.au/profiles", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
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

// find activity by date

export async function fetchActivity(activityId: string): Promise<TerrainEvent | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch(`https://events.terrain.scouts.com.au/events/${activityId}`, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.log("Error fetching activity: " + e);
    return undefined;
  }
}

export async function saveLogbookData(text: string): Promise<void> {
  try {
    if (!getToken()) return undefined;
    console.debug("Sending logbook to terrain");
    await fetch("https://achievements.terrain.scouts.com.au/members/" + getMemberID() + "/logbook", {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        authorization: getToken(),
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

export async function getLogbookData(logbookId: string): Promise<TerrainLogbook | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://achievements.terrain.scouts.com.au/members/" + getMemberID() + "/logbook/" + logbookId, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.log("Error fetching logbook: " + e);
    return undefined;
  }
}

//Retrieve Full list of Unit's Awards
export async function fetchUnitAchievements(): Promise<TerrainAchievements[] | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://achievements.terrain.scouts.com.au/units/" + getUnitID() + "/achievements", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
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
    console.log("Error fetching unit achievements: " + e);
    return undefined;
  }
}

export async function fetchUnitAchievementsFilterd(filterString: string): Promise<TerrainAchievements[] | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://achievements.terrain.scouts.com.au/units/" + getUnitID() + "/achievements?" + filterString, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
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
    console.log("Error fetching unit achievements: " + e);
    return undefined;
  }
}

export async function fetchAchievements(type: string): Promise<TerrainAchievements[] | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://achievements.terrain.scouts.com.au/members/" + getMemberID() + "/achievements?type=" + type, {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
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
    console.log("Error fetching unit achievements: " + e);
    return undefined;
  }
}

//Retrieve Members of a Unit
export async function fetchUnitMembers(): Promise<TerrainUnitMember[] | undefined> {
  try {
    if (!getToken()) return undefined;
    const response = await fetch("https://members.terrain.scouts.com.au/units/" + getUnitID() + "/members", {
      method: "GET",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
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
    console.log("Error fetching unit members: " + e);
    return undefined;
  }
}
