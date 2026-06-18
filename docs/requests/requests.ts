/*
# Summit request examples index (Phase 5 baseline)

Contract anchors:
- docs/API/summit-integration-api-v0.md
- docs/API/terrain.json

Runtime request examples:
- docs/requests/profiles.rest
- docs/requests/events.rest
- docs/requests/calendars.rest
- docs/requests/logbook.rest
- docs/requests/achievements.rest
- docs/requests/templates.rest

| Action Description                            | Endpoint URL
|-----------------------------------------------|---------------------------------------------------------------------------------------------
| Retrieve Profiles                             | https://members.terrain.scouts.com.au/profiles
| Retrieve Events for a Member                  | https://events.terrain.scouts.com.au/members/[memberId]/events?start_datetime=[from]&end_datetime=[to]
| Retrieve Specific Event                       | https://events.terrain.scouts.com.au/events/[eventId]
| Create Event for Unit                         | https://events.terrain.scouts.com.au/units/[unitId]/events
| Update Event                                  | https://events.terrain.scouts.com.au/events/[eventId]
| Delete Event                                  | https://events.terrain.scouts.com.au/events/[eventId]
| Retrieve Calendar for a Member                | https://events.terrain.scouts.com.au/members/[memberId]/calendars
| Update Calendar selection for a Member        | https://events.terrain.scouts.com.au/members/[memberId]/calendars
| Retrieve Member Logbook Detail                | https://achievements.terrain.scouts.com.au/members/[memberId]/logbook/[logbookId]
| Create/Update Member Logbook Entry            | https://achievements.terrain.scouts.com.au/members/[memberId]/logbook
| Retrieve Unit Achievements with Filters       | https://achievements.terrain.scouts.com.au/units/[unitId]/achievements?type=[type]
| Retrieve Member Achievements with Filters     | https://achievements.terrain.scouts.com.au/members/[memberId]/achievements?type=[type]
| Retrieve SIA Template                         | https://templates.terrain.scouts.com.au/sia/[templateId].json
*/