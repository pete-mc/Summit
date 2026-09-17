# Issues to investigate

> Important These are notes for the developer only. They should not be considered by an AI Agent until explicitly resolved by the developer.

## GUI

- Filter box:
  - Sort by:
    - Change drop down text to: First Name, Last Name, Progression
    - Does Terrain use surname, or last name?
  - Display:
    - Last display checkbox is truncated by partial line.
    - Make 'Show Empty Streams' a display option.
    - Make 'Hide top columns if they are empty' a display option.
    - Add feature to ONLY show in progress items.
  - Member:
    - Make search icon a simple one colour like placeholder text.
    - Placeholder text = "Name"
- Grid:
  - Add darker right border to Stage column, to math left border.
  - Why is Stage 1 column thinner? Is it connected with content not started or complete?
  - How do we give the Member names more right padding/margin?
  - Lets make progress boxes 2 pixels bigger, with only one pixel gap between them.
  - Make Skill icons bigger, say 30px to 35px, without making Skill row too much bigger.

## Code review summary 20260917

I read through the codebase directly — manifest, auth/token handling, all 19 API service files, the Vue↔React bridge pattern, the largest component (SummitCalendar.tsx, 1200+ lines), shared components, and type definitions — rather than relying only on a scripted diff review, since you asked for a broad standards/security/layout pass.

### What's solid:

-No dangerouslySetInnerHTML, eval, or innerHTML anywhere — no obvious XSS injection vector in the React layer.
-No hardcoded secrets; auth token is read live from the host page's own Nuxt store, never stored by the extension.
-Manifest permissions are minimal (activeTab, scripting only, no broad host permissions).
-The Vue-mounts-React bridge pattern (data()/mounted()/renderReactComponent()) is consistent and clean across every page.
-Custom DialogComponent/DropDownListComponent are legitimate lightweight replacements for a removed Syncfusion dependency, backed by tests that guard against regressions — not vestigial cruft.

### Real findings (highest to lowest severity):

1. PII logged to console — PeakAward.ts, PresentAwards.ts, and SummitCalendar.tsx all have leftover debug console.logs that dump full member names, IDs, and award/activity data on normal user actions (page load, save). Given this is a Scouts app, that's children's data landing in devtools on every use — worth cleaning up given SECURITY.md's stated "no data collection" posture.
2. Committed test-output artifact — .jest-components-results.json (47KB, absolute paths from a different machine) is tracked in git, not gitignored, accidentally swept in by commit bacd52a.
3. Inconsistent error handling across services — deleteEvent/updateMemberCalendars re-throw on failure while every sibling service swallows and returns a fallback; deleteEvent's only caller has no .catch, so a network failure there becomes an unhandled rejection instead of a UI error like everywhere else.
4. Spoofed/stale browser fingerprint header in saveLogbookData.ts (sec-ch-ua claiming Edge v94) — the only service that does this, and it's outdated.
5. SummitCalendar.tsx is a 1200+ line single class mixing calendar rendering, form validation, draft persistence, and a raw-jQuery iframe-styling hack — by far the largest, most multi-responsibility file in the codebase, including a dead-code duplication (two identical if/else branches in saveActivity).
6. No shared logger — 32 console.\* calls across 25 files with three different formatting conventions, no level gating.
7. Two lower-confidence/minor notes: fetchOASTemplate's URL building has no defensive validation on its input (low risk today, upstream-sourced only), and the services barrel export doesn't match actual import usage across the codebase.
