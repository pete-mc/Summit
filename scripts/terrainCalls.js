/*
| Action Description                    | Endpoint URL                                                                                
| Retrieve Profiles                     | https://members.terrain.scouts.com.au/profiles 
| Retrieve Members of a Unit            | https://members.terrain.scouts.com.au/units/[selectedUnitId]/members 
| Revoke Assumed Profiles               | https://members.terrain.scouts.com.au/revoke-assumed-profiles 
| Assume Profile for a Member           | https://members.terrain.scouts.com.au/members/[memberId]/assume-profiles 
| Retrieve Events for a Member          | https://events.terrain.scouts.com.au/members/[userId]/events?start_datetime=[fromDateString]&end_datetime=[toDateString]
| Retrieve Specific Event               | https://events.terrain.scouts.com.au/events/[eventId]
| Retrieve Calendar for a Member        | https://events.terrain.scouts.com.au/members/[userId]/calendars 
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

const UserId = localStorage.getItem('CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c.LastAuthUser');

//function to initiate a local store for caching data with an array of items containing Type, Data & TTL
function initCache() {
  if (localStorage.getItem('SummitTerrainCache') === null) {
    localStorage.setItem('SummitTerrainCache', JSON.stringify([]));
  }
}

//function to add an item to the cache
function addToCache(type, data, ttl) {
  let cache = JSON.parse(localStorage.getItem('SummitTerrainCache'));
  cache.push({type: type, data: data, ttl: ttl});
  localStorage.setItem('SummitTerrainCache', JSON.stringify(cache));
  //trigger to clear this item from cache when ttl expires
  setTimeout(() => { clearCacheItem(type); }, ttl * 1000);
}

//function to clear an item from the cache
function clearCacheItem(type) {
  let cache = JSON.parse(localStorage.getItem('SummitTerrainCache'));
  cache = cache.filter(item => item.type !== type);
  localStorage.setItem('SummitTerrainCache', JSON.stringify(cache));
}

//function to clear the cache
function clearCache() {
  localStorage.removeItem('SummitTerrainCache');
}

async function fetchUnitMembers() {
    // check cache first
    initCache();
    const cache = JSON.parse(localStorage.getItem('SummitTerrainCache'));
    const cacheItem = cache.find(item => item.type === 'unitMembers');
    if (cacheItem) {
      return cacheItem.data;
    }

    const response = await fetch("https://metrics.terrain.scouts.com.au/units/"+currentProfile.profiles[0].unit.id+"/members?limit=999", {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken")
        },
        redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
      });
    const data = await response.json();

    // cache the data for 5 mins
    addToCache('unitMembers', data.results, 300);
    return data.results;
  }

  //function to create an event
  async function createNewEvent(body) {
    const response = await fetch("https://events.terrain.scouts.com.au/units/"+currentProfile.profiles[0].unit.id+"/events", {
        method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken")
        },
        redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
        body: body
      });
    const data = await response.json();
    return data;
  }
  


  
