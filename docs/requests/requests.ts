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