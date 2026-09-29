<!-- @format -->

# PLAN.md — "I Statements" Page (Overview)

## Purpose

A new Summit page showing **every Skill+Stream combination that relates to each
I-statement**. Where the OAS Progression page answers *"how far has each member
got?"*, this page answers *"where does this I-statement appear across the whole
OAS framework?"* — it is **member-independent**: no unit, member, patrol or
achievement data is involved at all.

The practical value: many I-statements are reused verbatim across different
Skills and Stages. A leader planning an activity can see that one activity
satisfying "I can explain the 'buddy' system" ticks that box in several places
at once.

## Terminology (important — UI names invert Terrain's)

Terrain's API and Summit's existing code use one set of names; the Summit UI
uses another. This plan always writes the **UI** name first.

| UI name (this page) | Terrain / API field | Example                      |
| ------------------- | ------------------- | ---------------------------- |
| **Skill**           | `stream` / `stream_id` | Paddling, Bushcraft, Camping |
| **Stream**          | `branch` / `branch_id` | Canoeing, Kayaking, Sea Kayaking |
| **Stage**           | `stage`             | 1 – 9                        |
| **I-statement**     | `input.label`       | "I can explain the 'buddy' system." |

Nine Skills exist, already listed in
[`buildOASProgressionRows.ts`](../../src/pages/OasProgression/services/buildOASProgressionRows.ts):
`bushcraft, bushwalking, camping, aquatics, boating, paddling, alpine, cycling,
vertical`.

Note that a Skill's tree has a *trunk* (stages where `branch_id` equals the
stream, e.g. Paddling stages 1–3) and then *branches* that diverge (Paddling
stages 4–9 split into Canoeing / Kayaking / Sea Kayaking). Trunk stages are
still modelled as a Skill+Stream pair where Stream == Skill.

## Table shape (agreed)

- **Rows** — one per unique I-statement, de-duplicated by **normalised label
  text** (see Stage 1). Row label shows the **most common** raw variant.
- **Columns** — a fixed `I-Statement` label column, then one **column group per
  Skill+Stream combination** (e.g. `Paddling · Canoeing`, `Paddling · Kayaking`,
  `Bushcraft · Bushcraft`), each containing **stage columns 1–9**, blank where
  that stage doesn't exist for that combination.
- **Cell** — a **purple square** if that I-statement appears in that
  Skill+Stream at that Stage; empty otherwise.
- Heat-map visual style matches the OAS Progression page.

## Filters (agreed)

1. **Skills** — multi-select, which Skills to include.
2. **Stage from** / **Stage to** — numeric range, 1–9.
3. **Display → Hide empty**, three independent toggles, all applied *after* the
   above filters:
   - hide empty **stage columns**
   - hide empty **Skill+Stream groups**
   - hide empty **I-statement rows**

All filters **persist** across visits, mirroring
[`OASProgressionVueFilterPersistence.ts`](../../src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts).

## Data sourcing (agreed)

Fetch **all 9 Skills' trees and every template they reference**, cached. This is
the complete-picture option. Templates are shared with the OAS Progression page
via the existing `template.<templateLink>` cache keys in
[`OASTemplateCache.ts`](../../src/helpers/OASTemplateCache.ts) (1-day TTL), so a
warm cache from either page benefits the other.

First load shows a **determinate progress bar with a running count**
("Loading templates 47/180…").

## Technology

Vue + Vuetify 2, following `src/pages/OasProgressionVue/` exactly — the
`.vue` + separate `.ts` file pairing, the `--oas-vue-*` type scale, the second
Vue instance pattern. See `.claude/OASProgression/PLAN_VUE.md` for why that
architecture exists, and `.claude/DESIGN.md` for the styling rules.

## Stages

| Stage | File | Scope | Status |
| ----- | ---- | ----- | ------ |
| 1 | [PLAN_STAGE_1.md](PLAN_STAGE_1.md) | Data layer — tree/template crawl, normalisation, matrix build. Pure functions + unit tests, no UI. | Complete |
| 2 | [PLAN_STAGE_2.md](PLAN_STAGE_2.md) | Page shell, route, nav entry, loading/progress UX. | Complete |
| 3 | [PLAN_STAGE_3.md](PLAN_STAGE_3.md) | The heat-map table itself — grouped headers, purple squares. | Complete |
| 4 | [PLAN_STAGE_4.md](PLAN_STAGE_4.md) | Filters + persistence + hide-empty logic. | Complete |
| 5 | [PLAN_STAGE_5.md](PLAN_STAGE_5.md) | Verification in the live browser, and docs. | Docs done; merge audit outstanding |
| 6 | [PLAN_STAGE_6_MATCH_OAS.md](PLAN_STAGE_6_MATCH_OAS.md) | Match OAS Progression's layout, spacing and table elements — `v-data-table`, green header dropped, shared filter-panel class. | Built; live verification outstanding |

## Decisions that changed during implementation

Recorded here because they contradict what the stage plans originally said:

- **Administrative inputs are excluded by id, not by `type`.** Stage 1 proposed
  filtering to `type === "verifiable_checkbox"`. Real data killed that:
  `logbook_up_to_date` appears as `"checkbox"` in live templates but `"text"` in the
  OAS page's own test fixture, so `type` is not a reliable discriminator. The page
  now excludes the ids `logbook_up_to_date` and `file_uploader`, matching how
  `applyAnswersToMemberRows` in the OAS service already special-cases that id.
- **De-duplication within a template.** A statement repeated across input groups in
  one template yields one square, not several — not anticipated in the plan.
- **Defaults narrowed to stages 1–5 with empty statements hidden.** The full 1–9 grid
  across all skills is ~180 columns × ~500 rows; usable, but slow to render and hard
  to read as an opening view.
- **Render shape changed for performance.** Rows carry a `boolean[]` aligned to a
  shared column list, frozen so Vue 2 skips installing reactive getters on ~90k cells
  rebuilt wholesale on every filter change. The original per-cell-object approach was
  measurably slow (3–8s per filter change).
- **Merged rows are badged in the UI.** Stage 5 called for a throwaway console dump to
  audit normalisation. Instead the row label carries a small count badge whose tooltip
  lists every raw wording merged into it — same audit value, but permanent, so an
  over-merge stays visible rather than being a one-off check.

Each stage is independently buildable and verifiable. Stage 1 has no UI; stages
2–4 each end with something visible in the browser.

## Out of scope (explicitly)

- Member/unit/achievement data, progress, or per-member anything.
- PDF/Excel export — the OAS Progression page has these; **not** requested here.
  Left out deliberately rather than forgotten; easy to add later since the
  table is a plain `<table>` like the existing one.
- Rendering `dialog_text` (the unused verifier-guidance field — see the separate
  note in memory). Not part of this feature.
