# PLAN.md — shared page loading indicator

Addresses:

> The Present Award page sometimes takes a moment to load.
>
> - It should have a loading bar or loading indicator.
> - The I Statements page has one we can reference.
> - This should actually be a function of all 3 pages we have created, and all should be the same style.
> - Think about a common location and display.

## What is actually there today

The three Vue pages do not differ by a little. They differ by a lot, and only one of
them is right.

| Page | Knows it is loading? | Shows a bar? | Error state? |
| ---- | -------------------- | ------------ | ------------ |
| **I Statements** | `loadState`: `loading-trees` / `loading-templates` / `ready` / `error` | ✅ indeterminate, then determinate with a running count | ✅ message + Retry |
| **Present Awards** | `loadState`: `loading` / `ready` / `error` — **tracked correctly, barely used** | ❌ | ❌ text only, no retry |
| **OAS Progression** | `loadingStreams: Set<string>` — a countdown, not a state | ❌ | ❌ **none at all** |

### The Present Awards bug is not "no spinner"

`PresentAwardsVue.ts:71-78` sets `loadState` properly and passes it to the content
component. But the only thing gated on it is a `<span>` of text in the header row
([PresentAwardsVueContent.vue:5](../../src/pages/PresentAwardsVue/components/PresentAwardsVueContent.vue#L5)).
The filter panel and table render **unconditionally**, so during the load you get a
complete-looking table with headers and no rows.

That reads as *"there are no awards"*, not *"still loading"* — which is why the page
"takes a moment" in a way worth reporting. The information was already in the
component; nothing displayed it.

### OAS Progression fails silently

`OasProgressionVue.ts:106` catches a failed load and only calls `logger.error`. There
is no error flag on the component, so a failure leaves a permanently empty heat map
with no message on screen. Fixing that is in scope here because "all should be the
same style" cannot be true while one page has no error state to style.

## Design — one component, normalised props

The three pages describe their progress in three different vocabularies. Rather than
teach a shared component all three, it takes **normalised** props and each page maps
its own state onto them:

```
<SummitLoadingState
  :state="'loading' | 'ready' | 'error'"
  :message="string"        // "Loading templates 47/180..."
  :done="number"           // omit for indeterminate
  :total="number"
  :error-message="string"
  :on-retry="() => void"   // omit to render no Retry button
/>
```

`done`/`total` absent ⇒ indeterminate bar. Present ⇒ determinate with percentage.
This is exactly I Statements' existing behaviour, generalised: its two loading phases
become "no counts yet" and "counts known".

### Where it lives

`src/components/SummitLoadingState.vue`, not under any one page's folder. A component
owned by `IStatements/` that the other two import would make I Statements load-bearing
for pages it has nothing to do with.

Styling goes in the **scoped block of the component itself**, not `index.css`. Per
`.claude/DESIGN.md`, a genuinely shared *class* belongs in the global sheet — but this
is a shared *component*, so its scoped styles travel with it and cannot drift. That is
strictly better than a shared class, which is what the `.oas-vue-filter-panel` episode
(three pages, two declarations, two different gaps) demonstrated the hard way.

### Display, decided with the user

- **Body hidden while loading.** The bar replaces filters and table until `ready`.
  Unambiguous: an empty table never masquerades as a loaded one. This is what
  I Statements already does.
- **OAS Progression gets a determinate bar and a real error state.** It already counts
  9 streams down, so the running count comes almost free.

## What must not regress

- **OAS Progression's per-stream reload.** `reloadStream` re-adds one stream to
  `loadingStreams` mid-session. That must keep working and must NOT blank the whole
  page — only a first load has nothing to show. Treat "first load" as
  `items.length === 0`.
- **Present Awards' unsaved-ticks warning.** `onReloadClick` warns before discarding
  edits; the loading state must not bypass it.
- **The refresh button's own spinner.** All three pages put `:loading` on their refresh
  `v-btn`. That stays — it marks the button as busy, which is separate from the page.

## Staging

| # | Scope | Status |
| - | ----- | ------ |
| 1 | `SummitLoadingState.vue` + unit tests | ✅ 22 tests |
| 2 | I Statements onto it (behaviour-neutral — proves the component covers the reference case) | ✅ |
| 3 | Present Awards: gate body, add bar + error/retry | ✅ |
| 4 | OAS Progression: `loadError` flag, determinate bar, error state | ✅ |
| 5 | Live verification | ⬜ **outstanding** |

## Found while building

**OAS Progression should NOT hide its body, unlike the other two.** The plan said all three
would. Building it showed that is wrong for this page: streams arrive one at a time and the
heat map renders each as it lands, so hiding everything until all nine finish makes the page
feel *slower*, and a per-stream reload would blank a full screen to refresh one skill. The bar
therefore sits alongside partial content there, gated on `hasContent` rather than replacing it.

The display is still consistent — same bar, same position, same error treatment. What differs
is whether content exists to show yet, which is a real difference between the pages rather than
drift.

**Present Awards' action buttons needed gating too.** Excel Export, PDF Export and Save were
clickable during the load, offering an empty spreadsheet and a save of nothing.

**Gating on `loadState` alone would have been a regression — caught in self-review.** Every save
calls `loadAwards()` (`PresentAwardsVue.ts:97`, so the edit state re-seeds from what is actually
stored), which sets `loadState` back to `"loading"`. A table gated on that would blank a full
screen of ticked checkboxes on every Save, and the "Saved." confirmation would have been hidden
inside the same gate. Both pages therefore gate on `hasContent` (`items.length > 0`) and keep
feedback outside it: only a genuine first load has nothing to show, and a background reload is
already reported by the Save and refresh buttons' own spinners.

That makes `hasContent` the shared idea across all three pages, arrived at twice for different
reasons — OAS Progression for incremental streams, Present Awards for the save round-trip.

**Jest cannot import `.vue`, and the alias made it worse.** The project convention is a
`jest.mock(..., { virtual: true })` stub per `.vue` import, documented in
`PresentAwardsVueContent.spec.ts`. I first tried a `moduleNameMapper` entry mapping
`@/**.vue` → the sibling `.ts`, on the theory that relative imports already resolved that way.
They do not — they need the same stub. The config change was solving a problem that already had
a convention, so it was reverted and the stub added instead.

## Live verification checklist

- [ ] Present Awards on a slow load shows a bar, not an empty table.
- [ ] Present Awards error state offers Retry and recovers on click.
- [ ] OAS Progression shows a running count as the 9 streams land.
- [ ] OAS Progression per-stream reload does **not** blank the page.
- [ ] I Statements looks unchanged — same two phases, same counts.
- [ ] All three bars are the same height, colour and position relative to the header row.
