# Global Filter Defaults — filter inventory

Every filter with a saved value and a "Reset filters" button, per tab/page, with its current default.
OAS Progress defaults: `DEFAULT_FILTERS` in `src/pages/OasProgressVue/components/OasProgressVueContent.ts`.
I Statements and Present Awards are `main`-only (unfinished) pages.

`—` = the tab doesn't have this filter.

## Possible filters vs. current tab defaults

| Filter | Summary | Peak Award | Heat Map | Next Steps | Stage Grid | *I Statements* | *Present Awards* | Global default (proposed) | Notes |
|---|---|---|---|---|---|---|---|---|---|
| **Member search** (text) | blank | blank | blank | — | — | — | blank (column filters) | blank | |
| **Patrol** (multi) | all | all | all | — | all | — | — | all | |
| **Sort by** | First Name *(First, Last + click a column heading)* | First Name *(First, Last, **Progress**)* | First Name *(First, Last, **Stage**)* | — | First name *(First, Last)* | — | — | First Name (First, Last, Progress, Stage) | Order of all possible elements even if some aren't used in a tab. |
| **Name format** | Full | Full | Full | — *(always full)* | Full | — | — | Full | Every tab/page should have this option. It allows personal details to be hidden.|
| **Break by patrol** | off | off | off *(hidden when grouped by member)* | — | off | — | — | off | |
| **Group by** | — | — | Skill *(Skill/Member)* | — | — | — | Group by member: **on** | | Tab specific.|
| **Skills** (multi) | — | — | all | — | — | all | — | All | |
| **Stages** (multi) | — | — | **1–9** *(any mix)* | — | — | **1–5** *(from/to range)* | — | All | I-Statememts TBD. |
| **Skill** (single pick) | — | — | — | first outstanding | **Camping** | — | — | | |
| **Stage** (single pick) | — | — | — | lowest not awarded | **1** | — | — | | |
| **Member** (single pick) | — | — | — | first member | — | — | — | | |
| **Layout** | — | — | — | — | Members as columns | — | — | | Tab specific  |
| **Expand streams** | on | — | — | — | — | — | — | | Tab specific|
| **Show "Not started"** | on *(skill columns nobody started)* | — | on ×2: skill rows **and** stages with no progress | — | — | **Hide** empty statements: **on** | — | | |
| **Show empty stages/groups** | — | — | Empty top stages: on | — | — | Hide empty stages/streams: off | — | | |
| **Show "Awarded"** | — | — | on *(I Statement squares)* | — | on *(members who finished)* | — | Previously presented: **off** | On | Present awards could have tab specific filter |
| **Show "Answered"** | — | — | on | — | — | — | — | On | |

## Clashes and things that don't make sense

1. **"Not started" means four different things.** The Heat Map even has two options labelled "Not Started" and "Not started" in the same menu (skill rows vs. stages). A global page has to give each one a clear name.
Decisions:
 - We need 3
   - 'Skills not started' : If no stage of a skill has been started by any member, the entire skill row/column is hidden.
   - 'Stages not started' : If a skill has been started by a member a stage has not, those stages boxes are hidden.
 - 'I-Statements' page can be ignored, as that page may be removed.

2. **Opposite defaults for "empty" content.** Summary and Heat Map *show* not-started by default, but I Statements *hides* empty statements by default. The wording is also flipped ("Show" vs. "Hide"). Pick one style and one default.
Decisions:
  - 'I-Statements' page can be ignored, as that page may be removed.

3. **Stages: Heat Map is 1–9, I Statements is 1–5,** and they use different controls (pick any mix vs. a from/to range). A shared "Stages" default works only if both use the same kind of control.
Decisions:
  - 'I-Statements' page can be ignored, as that page may be removed.
  - Lets make this a tab specific control on the Heat Map.

4. **"Awarded" means three things:** I Statement squares (Heat Map), members who finished a stage (Stage Grid), and awards already presented (Present Awards, default off). These should be separate settings, not one shared value.
Decisions:
 - 'I-Statements' page can be ignored, as that page may be removed.
 - In Heat Map, awarded means they have officially met criteria. ie: Not presented.
 - In Present Awards, it is 'Presented', not Awarded. Make this tab specific.

5. **Sort options differ between tabs.** All tabs share First/Last name, but Progress (Peak Award) and Stage (Heat Map) exist on one tab each. Labels are also inconsistent ("First Name" vs. "First name"). Clicking a Summary column heading is a one-off sort and shouldn't be a default.
Decisions:
  - Name format should be first letter upper case, as per majority.
  - Defaults can only contain items common to all.
  - Agree clicking column header overrides default in that page.

6. **Single picks depend on the data**, so they shouldn't be global defaults. These are Next Steps' member/skill/stage and Stage Grid's skill/stage. Stage Grid's Camping / Stage 1 was picked to keep the page fast, not as a preference. Proposal: leave these out and keep their "first available" fallback.
Decisions:
  - Agree

7. **Patrol names belong to one unit.** A default like "Possums only" could be saved, but a leader with two units would find no match in the other unit. The fallback would be "all patrols".
Decisions:
 - Default to 'All Patrols' which can be hard coded, or a single selection.

8. **Member search and Present Awards' column filters are typed-in searches,** not preferences. Proposal: leave them out.
Decisions:
  - Agree. Leave out.

## Decisions needed

- **A. Shared vs. per-tab.** Recommended: one **Common** section (Name format, Sort by name, Patrol, Break by patrol) that every tab uses, plus a section per page/tab for its own filters (e.g. Heat Map Group by, Stage Grid Layout). The alternative is listing all ~30 tab filters one by one.
  - Decision: A tab specific filter can stay with a default hard coded on the tab. We don't need a default page fort those.
   
- **B. First visit.** Recommended: a tab you've never opened (or a new page) also starts from your defaults, not only after Reset.
  - Decision: Agree.
- **C. Changing a default.** Recommended: it doesn't change tabs that already have filters set; it only takes effect on Reset.
  - Decision: User can click an "Apply defaults" to override all current filters.

- **D. Future pages.** Recommended: each page registers its own defaults with the Display Options page instead of the page hard-coding a list. That's how future pages get covered automatically, and the I Statements / Present Awards sections disappear from PR branches when those pages are stripped out.
  - Decision: Agree. Does this match with what I specified above?

## Resolved (2026-11-25)

The "Global default (proposed)" column above is superseded; the decisions under each point win.

- **Empty top stages is removed.** "Stages not started" takes over its job: when off, unstarted stage bars are hidden *and* stage columns that nobody has started (above the highest started stage) disappear. When on, both show.
- **Labels:** "First Name" / "Last Name" capitalisation everywhere. Sort by dropdowns list options in the order First Name, Last Name, Progress, Stage (skipping ones a tab doesn't have). The default can only be First Name or Last Name.
- **Common defaults (Display Options page):**

  | Common default | System default | Used on |
  |---|---|---|
  | Name format | Full Name | Summary, Peak Award, Heat Map, Stage Grid, Next Steps (new) |
  | Sort by | First Name | Summary, Peak Award, Heat Map, Stage Grid |
  | Patrol | All Patrols | Summary, Peak Award, Heat Map, Stage Grid |
  | Break by patrol | Off | Summary, Peak Award, Heat Map, Stage Grid |
  | Show approved | On | Heat Map, Stage Grid |
  | Show skills not started | On | Summary, Heat Map |
  | Show stages not started | On | Heat Map |

- **Tab-specific, hard-coded on the tab:** Heat Map Skills / Stages / Answered / Group by, Stage Grid Layout, Summary Expand streams, Present Awards Presented / Group by member, Next Steps and Stage Grid single picks. Member search is left out. I Statements is ignored.

### Resolved 2026-11-25 (was on hold)

- **#5:** "Show awarded" is now **Show approved** (criteria met in Terrain). Present Awards' "Presented" is a different
  question (badge physically handed over), so it stays tab-specific and doesn't share the default.

### Also resolved

- **Apply defaults** is a button on the Display Options page only. It overwrites every page's and tab's saved filters with the current defaults (asks to confirm first).
- **Patrol** default is locked to "All Patrols" for now; it isn't a setting on Display Options yet. A single-patrol choice is a possible later addition.
