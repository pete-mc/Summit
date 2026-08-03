# Summit Terrain Control Flows

<!-- markdownlint-disable MD024 -->

Phase 2 reference for end-to-end runtime control flows showing how Summit user actions trigger Terrain API calls.

## Initialization flow

### Flow intent

Boot Summit into an already-authenticated Terrain page, register the Vuex module, finalize routing/menu hooks, and trigger initial data hydration.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (authenticated in Terrain)
    participant Loader as src/summitloader.js
    participant Entry as src/index.ts
    participant Store as Vuex Summit module (src/modules/summitModule.ts)
    participant Router as src/router/SummitRouter.ts
    participant EventsAPI as events.terrain.scouts.com.au
    participant AchievementsAPI as achievements.terrain.scouts.com.au

    User->>Loader: Open Terrain page with extension
    Loader->>Entry: Inject summit bundle
    Entry->>Store: registerModule("Summit") + dispatch("Summit/initialize")
    Entry->>Router: getInstance().finaliseSetup()
    Store->>EventsAPI: fetchMemberEvents() /events
    Store->>EventsAPI: fetchActivity() /events/{id}
    Store->>AchievementsAPI: fetchUnitAchievements() /units/{unitId}/achievements
    Router->>Router: pageChecks() timers and route hooks initialized
```

### Runtime symbol map

1. Script injection starts in `src/summitloader.js`.
2. Runtime bootstrap executes in `src/index.ts` (`registerModule`, `dispatch("Summit/initialize")`, `finaliseSetup`).
3. Module initialization and refresh hooks are in `src/modules/summitModule.ts` (`initialize`, `getPresentedAwards`, `getAchievements`).
4. Route lifecycle and deferred checks are in `src/router/SummitRouter.ts` (`beforeEach`, `afterEach`, `pageChecks`).
5. Initialization-triggered service calls include:
   - `src/services/fetchMemberEvents.ts`
   - `src/services/fetchActivity.ts`
   - `src/services/fetchUnitAchievements.ts`

## Awards checks flow

### Flow intent

On award-related Terrain routes, Summit augments the UI by checking awarded entries and cross-referencing achievements for the active profile.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant TerrainUI as Terrain awarded page DOM
    participant Router as src/router/SummitRouter.ts
    participant AwardsComp as src/components/presentedAwards.ts
    participant AchievementsSvc as src/services/fetchAchievements.ts
    participant AchievementsAPI as achievements.terrain.scouts.com.au

    User->>TerrainUI: Navigate to milestones/OAS/SIA/intro routes
    TerrainUI->>Router: afterEach() => pageChecks(to)
    Router->>Router: detect awarded chips/list containers
    Router->>AchievementsSvc: fetchAchievements(type)
    AchievementsSvc->>AchievementsAPI: GET /members/{profileMemberId}/achievements?type={type}
    AchievementsAPI-->>AchievementsSvc: results[]
    AchievementsSvc-->>AwardsComp: awards payload
    AwardsComp-->>TerrainUI: inject presented-award markers
```

### Runtime symbol map

1. Route-triggered orchestration is in `src/router/SummitRouter.ts` (`pageChecks`, route-to-type mapping, `fetchAchievements(type)`).
2. Award decoration utilities are in `src/components/presentedAwards.ts` (`CheckAward`, `AwardObserverRouter`).
3. Achievement retrieval is implemented by `src/services/fetchAchievements.ts`.
4. Auth context/token source is `src/helpers/TerrainState.ts`.

## Calendar CRUD flow

### Flow intent

Load member calendars and events, allow create/update/delete from Summit’s calendar editor, and persist calendar visibility changes.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant CalendarUI as src/pages/SummitCalendar/components/SummitCalendar.tsx
    participant MembersSvc as src/services/fetchUnitMembers.ts
    participant CalendarReadSvc as src/services/fetchMemberCalendars.ts
    participant EventListSvc as src/services/fetchMemberEvents.ts
    participant CreateSvc as src/services/createNewEvent.ts
    participant UpdateSvc as src/services/updateEvent.ts
    participant DeleteSvc as src/services/deleteEvent.ts
    participant CalendarWriteSvc as src/services/updateMemberCalendars.ts
    participant MembersAPI as members.terrain.scouts.com.au
    participant EventsAPI as events.terrain.scouts.com.au

    User->>CalendarUI: Open Summit Calendar
    CalendarUI->>MembersSvc: fetchUnitMembers()
    MembersSvc->>MembersAPI: GET /units/{unitId}/members
    CalendarUI->>CalendarReadSvc: fetchMemberCalendars()
    CalendarReadSvc->>EventsAPI: GET /members/{memberId}/calendars
    CalendarUI->>EventListSvc: fetchMemberEvents(start,end)
    EventListSvc->>EventsAPI: GET /members/{memberId}/events
    alt Create event
      User->>CalendarUI: Save new event
      CalendarUI->>CreateSvc: createNewEvent(body)
      CreateSvc->>EventsAPI: POST /units/{unitId}/events
    else Update event
      User->>CalendarUI: Save existing event
      CalendarUI->>UpdateSvc: updateEvent(eventId, body)
      UpdateSvc->>EventsAPI: PATCH /events/{eventId}
    else Delete event
      User->>CalendarUI: Confirm delete
      CalendarUI->>DeleteSvc: deleteEvent(eventId)
      DeleteSvc->>EventsAPI: DELETE /events/{eventId}
    end
    User->>CalendarUI: Change selected calendars
    CalendarUI->>CalendarWriteSvc: updateMemberCalendars(body)
    CalendarWriteSvc->>EventsAPI: PUT /members/{memberId}/calendars
```

### Runtime symbol map

1. Calendar UI and control handlers:
   - `src/pages/SummitCalendar/components/SummitCalendar.tsx`
   - `fetchData`, `fetchCalendars`, `saveActivity`, `handleCalendarChange`, `openTerrainDialog`
2. Calendar/event service calls:
   - `src/services/fetchMemberEvents.ts`
   - `src/services/fetchMemberCalendars.ts`
   - `src/services/updateMemberCalendars.ts`
   - `src/services/createNewEvent.ts`
   - `src/services/updateEvent.ts`
   - `src/services/deleteEvent.ts`
   - `src/services/fetchActivity.ts`
3. Member lookup for editors/attendees:
   - `src/services/fetchUnitMembers.ts`

## Logbook copy/paste flow

### Flow intent

Inject copy/export/paste controls into Terrain logbook pages and bridge clipboard/download/import behaviors through Terrain logbook APIs.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Router as src/router/SummitRouter.ts
    participant LogbookComp as src/components/copyLogbook.ts
    participant ReadSvc as src/services/getLogbookData.ts
    participant WriteSvc as src/services/saveLogbookData.ts
    participant AchievementsAPI as achievements.terrain.scouts.com.au
    participant Clipboard as Browser Clipboard/File APIs

    User->>Router: Navigate to /logbook or /logbook/view-record
    Router->>LogbookComp: InitLogbookWrite() / InitLogbookRead()
    User->>LogbookComp: Click Copy to Clipboard or Export
    LogbookComp->>ReadSvc: getLogbookData(recordId)
    ReadSvc->>AchievementsAPI: GET /members/{profileMemberId}/logbook/{logbookId}
    ReadSvc-->>LogbookComp: logbook payload
    alt Copy
      LogbookComp->>Clipboard: navigator.clipboard.writeText(JSON)
    else Export
      LogbookComp->>Clipboard: download JSON file
    end
    User->>LogbookComp: Click Paste from clipboard / upload file
    LogbookComp->>WriteSvc: saveLogbookData(text)
    WriteSvc->>AchievementsAPI: POST /members/{memberId}/logbook
    WriteSvc-->>LogbookComp: completion
    LogbookComp-->>User: location.reload()
```

### Runtime symbol map

1. Route checks that inject logbook controls are in `src/router/SummitRouter.ts` (`/logbook`, `/logbook/view-record`).
2. Logbook UI augmentation and action handlers are in `src/components/copyLogbook.ts`:
   - `InitLogbookRead`
   - `InitLogbookWrite`
   - `LoadLogbookData`
   - `WriteLogbook`
3. Logbook API wrappers:
   - `src/services/getLogbookData.ts`
   - `src/services/saveLogbookData.ts`

## iCal export flow

### Flow intent

Inject “Save to Calendar (iCal)” into Terrain programming activity pages, fetch event details, and generate/download an `.ics` file.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Router as src/router/SummitRouter.ts
    participant ExportComp as src/components/exportiCal.ts
    participant ActivitySvc as src/services/fetchActivity.ts
    participant EventsAPI as events.terrain.scouts.com.au
    participant Browser as Browser download APIs

    User->>Router: Navigate to /programming/view-activity
    Router->>ExportComp: InitProgrammingExportBtn()
    User->>ExportComp: Click Save to Calendar (iCal)
    ExportComp->>ActivitySvc: fetchActivity(activityId)
    ActivitySvc->>EventsAPI: GET /events/{activityId}
    EventsAPI-->>ActivitySvc: Terrain event payload
    ActivitySvc-->>ExportComp: event data
    ExportComp->>Browser: Build VCALENDAR text and download .ics
```

### Runtime symbol map

1. Route-level trigger is in `src/router/SummitRouter.ts` (`/programming/view-activity` branch in `pageChecks`).
2. iCal UI injection and export logic are in `src/components/exportiCal.ts`:
   - `InitProgrammingExportBtn`
   - `ExportiCal`
3. Event retrieval is in `src/services/fetchActivity.ts`.
