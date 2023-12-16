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
| Retrieve Unit's Additional Awards     | https://achievements.terrain.scouts.com.au/units/[unitId]/achievements?type=additional_award 
| Retrieve Unit Approvals               | https://achievements.terrain.scouts.com.au/units/[unitId]/submissions?status=[status]
| Retrieve Member's Achievement Result  | https://achievements.terrain.scouts.com.au/members/[member_id]/achievements/[achievement_id]?type=[achievement_type]
| Retrieve Unit's OAS Achievements      | https://achievements.terrain.scouts.com.au/units/[unit]/achievements?type=outdoor_adventure_skill&stream=[stream]&branch=[branch]&stage=[stage]
| Retrieve SIA Results for Member       | https://achievements.terrain.scouts.com.au/members/[memberId]/achievements?type=special_interest_area 
| Retrieve Specific SIA Result          | https://achievements.terrain.scouts.com.au/members/[memberId]/achievements/[achievementId]?type=special_interest_area 
| Retrieve Latest OAS Template          | https://templates.terrain.scouts.com.au/[stream]/latest.json 
| Retrieve Additional Awards Specs      | https://templates.terrain.scouts.com.au/additional-awards/specifications.json 
| Retrieve OAS Tree for Stream          | https://templates.terrain.scouts.com.au/oas/[stream]/tree.json 
*/

import { TerrainEvent, TerrainLogbook, TerrainProfile, TerrainUnitMember } from "../typings/terrainTypes";
import { addToCache, getCacheItem } from "./helpers";
import { SummitContext } from "./summitContext";

//function to retrieve unit members profiles from the Terrain API or cache
export async function fetchUnitMembers(context: SummitContext): Promise<TerrainUnitMember[] | undefined> {
  try{
    const cacheItem = getCacheItem('unitMembers');
    if (cacheItem) return cacheItem.data;
    if (!context.currentProfile || !context.token) return undefined;
    const response = await fetch("https://metrics.terrain.scouts.com.au/units/"+context.currentProfile.profiles[0].unit.id+"/members?limit=999", {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': context.token
        },
        redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return addToCache('unitMembers', data.results, 300);;
  } catch (e) {
    context.log("Error fetching unit members: " + e);
    return undefined;
  }
}

//function to create an event
export async function createNewEvent(body: string, context: SummitContext): Promise<void> {
  try{
    if (!context.currentProfile || !context.token) return undefined;
    const response = await fetch("https://events.terrain.scouts.com.au/units/"+context.currentProfile.profiles[0].unit.id+"/events", {
        method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': context.token
        },
        redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
        body: body
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (e) {
    context.log("Error creating event: " + e);
    throw e;
  }
}

// convert above to async function with fetch and return profile rather than setting
export async function getCurrentProfile(context: SummitContext): Promise<TerrainProfile | undefined> {
  try {
    const cacheItem = getCacheItem('currentProfile');
    if (cacheItem) return cacheItem.data;
    if (!context.token) return undefined;
    const response = await fetch("https://members.terrain.scouts.com.au/profiles", {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': context.token
        },
        redirect: 'error',
        referrerPolicy: 'strict-origin-when-cross-origin'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // cache the data for 5 mins
    return addToCache('currentProfile', data, 300);;
  } catch (e) {
    context.log("Error fetching current profile: " + e);
    return undefined;
  }
}

export async function fetchActivity(context: SummitContext, activityId: string): Promise<TerrainEvent | undefined> {
  try{
    if (!context.currentProfile || !context.token) return undefined;
    const response = await fetch(`https://events.terrain.scouts.com.au/events/${activityId}`, {
      method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': context.token
      },
      redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin',
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e)
  {
    context.log("Error fetching activity: " + e);
    return undefined;
  }
}

export async function saveLogbookData(text: string, context: SummitContext) : Promise<void>{
  try {
    if (!context.currentProfile || !context.token) return undefined;
    console.debug("Sending logbook to terrain");
    await fetch('https://achievements.terrain.scouts.com.au/members/' + context.currentProfile.profiles[0].member.id + '/logbook', {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": context.token,
        "content-type": "application/json;charset=UTF-8",
        "sec-ch-ua": "'Chromium';v='94', 'Microsoft Edge';v='94', ';Not A Brand';v='99'",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      "referrer": "https://terrain.scouts.com.au/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": text,
      "method": "POST",
      "mode": "cors"
    });
  } catch (e) {
    context.log("Error saving logbook: " + e);
    return undefined;
  }
  }

export async function getLogbookData(context: SummitContext, logbookId: string): Promise<TerrainLogbook | undefined> {
  try {
    if (!context.currentProfile || !context.token) return undefined;
    const response = await fetch("https://achievements.terrain.scouts.com.au/members/"+context.currentProfile.profiles[0].member.id+"/logbook/"+logbookId, {
      method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': context.token
      },
      redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    context.log("Error fetching logbook: " + e);
    return undefined;
  }
}