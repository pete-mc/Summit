# OAS Progression — group by Skill or Member

**Status:** planned, not built. Agreed 2026-09-28.

Addresses the `.claude/DEV_NOTES.md` entry:

> Add ability to switch between Group by Skill or Member
>   - Group by Skill keeps skill icon.
>   - Group by Name has no icon. Sort by still works.

## What it is

A toggle changing how the heat map is organised, and matching grouping on the table view.

**Group by Skill** (today's layout, stays the default): a section per skill, listing every member.
Answers *"how is the unit doing at Bushwalking?"*

**Group by Member** (new): a section per member, listing their skills. Answers *"what has Alba
done across everything?"* — which is the question asked when talking to one member.

```
Alba Sayer                         1  2  3  4  5
  🥾 Bushwalking      ▓▓▓░░  ░░░  ░
  ⛺ Camping          ▓▓▓▓▓  ▓▓░  ░
  🛶 Paddling         ░░░░░  ░░░  ░

Juanita Richardson                 1  2  3  4  5
  🥾 Bushwalking      ▓▓░░░  ░░░  ░
```

## Where the skill icon goes

Per the note: grouping by skill keeps the icon on the **section heading** (as now). Grouping by
member moves it onto each **skill row**, since the section heading is a person.

The row label also changes: by skill the first column is the member's name; by member it is the
skill name. That is one `v-if` in the template, not a second table.

## The data already supports this

`groupRowsForHeatMap()` returns `Record<skill, { sections, maxStage }>`, and every
`HeatMapSection` already carries `members: SectionMemberRow[]` with each member's own `stages`.

Inverting is a **regroup of data already in memory** — no new fetching, no change to
`buildOASProgressionRows`, no change to the API layer. A new pure function alongside the existing
ones:

```ts
// src/pages/OasProgression/services/groupSectionsByMember.ts
export function groupSectionsByMember(sectionsBySkill, options): MemberSectionView[]
```

Each `MemberSectionView` is `{ memberId, displayName, patrolName, skillRows[] }`, where a
`skillRow` is the existing per-section member data relabelled with its skill and icon.

## What carries over unchanged

- **Sorting** — `sortMembers()` orders the member sections instead of members within a skill.
  The note says "Sort by still works", and it does, at the level that now makes sense.
- **Stage range, hide-empty, hide-answered, codenames, hide-last-name** — all operate per member
  per skill and are unaffected by which level does the grouping.
- **The cell rendering** — `buildStageCellView()` is per (member, skill, stage) either way.

## What needs thought

**Patrol grouping.** `breakByPatrol` inserts patrol heading rows inside a skill section. Grouped
by member, a member belongs to exactly one patrol, so patrol becomes an attribute of the section
heading rather than a divider within it. Suggest: show the patrol name beside the member name and
sort members by patrol — no separate heading rows. Confirm before building.

**Hide empty skills.** Today this hides a whole skill section. Grouped by member it should hide
that member's **row** for a skill with no progress, leaving other members' rows for that skill
intact. Same filter, different granularity.

**A member with no progress at all.** Grouped by skill they simply do not appear in any section.
Grouped by member they would be an empty section. Suggest hiding them entirely, consistent with
"hide empty skills".

## Table view

Uses `v-data-table` grouping, the same mechanism already built for Present Awards
(`PresentAwardsTableVue`), with a three-way choice: **None / Member / Skill**.

Group headers should carry a count, as Present Awards' do. The wording needs deciding — Present
Awards uses "(N not presented)" because that is what a leader is counting there. For OAS the
useful count is less obvious; "(N i-statements outstanding)" is one option, plain "(N rows)"
another.

Reuses `renderedHeaders` — the computed added for Present Awards that mirrors Vuetify dropping
the grouped column from its own header row. That bug applies here too.

## Where the toggle lives

The `Display` fieldset in `OASProgressionFiltersVue`, alongside the existing checkboxes — but as a
**radio pair or select**, not a checkbox, since Skill and Member are exclusive.

Persisted in `summit.oasProgressionVue.filters` as a new `groupBy: "skill" | "member"` key,
defaulting to `"skill"` so existing users see no change. Merged over `DEFAULT_FILTERS` like every
other key, so a saved state predating this still loads.

## Staging

1. `groupSectionsByMember()` + unit tests — pure function, no UI
2. Heat map renders either grouping; toggle in the Display fieldset; persistence
3. Table view grouping (None/Member/Skill), reusing the Present Awards pattern
4. Live verification, and the PDF export re-checked — it paginates on
   `.oas-heatmap-skill-title-row`, and grouped by member those become member rows, so the export's
   section selector needs to match whichever heading is in play

## Open questions

- Patrol handling when grouped by member (suggestion above)
- Group header count wording on the table view
- Whether "Group by Member" should also be offered on the **I Statements** page, which shares this
  page's visual language
