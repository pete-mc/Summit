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

## Decided 2026-09-28

**Patrol grouping applies to Skill grouping only.** Grouped by Skill/Stream the existing
`breakByPatrol` behaviour stays exactly as it is — members, optionally sub-grouped by patrol where
patrols exist. Grouped by Member there is **no secondary grouping at all**: the section heading is
already a person, so patrol has nowhere meaningful to sit. The `breakByPatrol` checkbox is
therefore irrelevant while grouped by member — hide it rather than leave a control that does
nothing.

**No count on the heat map's group headings.** Present Awards counts outstanding awards because
that is what a leader is handing out; OAS Progression has no equivalent single number worth
showing, and the heat map's whole point is that the squares convey progress visually. Section
headings stay as the skill name or member name alone.

**A member with no progress shows, with blank cells.** Grouped by member they appear as a section
with their skill rows rendered empty, rather than being hidden. This is a deliberate reversal of
the "hide empty" instinct: absence of progress is itself the useful signal here — a member who has
started nothing is exactly who a leader is looking for, and hiding them would make them invisible
in the view most likely to be used for that.

Note this differs from `hideEmptyStreams`, which remains an explicit opt-in filter. The default is
show; the filter still hides when asked.

## What needs thought

**Hide empty skills.** Today this hides a whole skill section. Grouped by member it should hide
that member's **row** for a skill with no progress, leaving other members' rows for that skill
intact. Same filter, different granularity.

## Table view

Uses `v-data-table` grouping, the same mechanism already built for Present Awards
(`PresentAwardsTableVue`), with a three-way choice: **None / Member / Skill**.

**No counts in the group headers** — same reasoning as the heat map. Present Awards counts
outstanding awards because that is the task; there is no equivalent number here worth the noise.

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

- Whether "Group by Member" should also be offered on the **I Statements** page, which shares this
  page's visual language. Not in scope here.
