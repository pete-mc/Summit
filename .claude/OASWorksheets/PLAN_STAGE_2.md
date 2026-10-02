<!-- @format -->

# PLAN_STAGE_2.md — The view switcher (`v-tabs`)

Replaces the current "Show Table" / "Show Heatmap" toggle **button** with Terrain's own
tab control. Self-contained: it can ship before the worksheet exists, with two tabs,
and gain a third in Stage 3.

DEV_NOTES asks for this directly:

> We should split the heatmap/table/Worksheet visual areas using the same control as
> terrain, instead of a button.

## 1. What Terrain's control actually is

From the captured reference
`P:\Dev\personal\terrain_summit\resources\terrain_planning_menu-control_example.html`
— Terrain's Programming page tab strip (Upcoming / Proposed / Concluded activities):

```html
<section class="Programming__nav">
  <div class="Programming__tabs">
    <div class="v-tabs v-tabs--grow theme--light">
      <div role="tablist" class="v-item-group theme--light v-slide-group v-tabs-bar
                                primary--text grey lighten-5" style="height: 40px;">
        ...
        <div role="tab" class="v-tab">Upcoming activities</div>
        <div role="tab" class="v-tab v-tab--active">Proposed activities</div>
        <div role="tab" class="v-tab">Concluded activities</div>
```

It is a **plain Vuetify 2 `v-tabs`** — no Terrain-custom component underneath. The
classes in that markup are Vuetify's own render output, which means the props that
produce it are readable straight off it:

| Rendered class | Prop |
| -------------- | ---- |
| `v-tabs--grow` | `grow` — tabs share the full width equally |
| `grey lighten-5` | `background-color="grey lighten-5"` |
| `primary--text` | `color="primary"` |
| `style="height: 40px"` | `height="40"` |

`v-tabs-slider-wrapper` / `v-tabs-slider` is the moving underline — Vuetify renders it
itself, nothing to add.

So:

```vue
<v-tabs v-model="activeTab" grow height="40" color="primary" background-color="grey lighten-5">
  <v-tab>Heatmap</v-tab>
  <v-tab>Table</v-tab>
  <!-- Stage 3 adds: <v-tab>Worksheets</v-tab> -->
</v-tabs>
```

⚠️ **CAUGHT LIVE DURING IMPLEMENTATION — `v-tab`'s identity prop is `tab-value`, not `value`.**
`value` on `v-tab` is a read-only *computed* (falls back to `to`/`href`, else undefined — see
`VTab.js`), not a declared prop. A plain `<v-tab value="heatmap">` is silently dropped as a
non-prop attribute, so every tab's effective identity falls back to its index
(`VItemGroup.getValue()`: `item.value === undefined ? i : item.value`). The visible symptom was
exactly what you'd expect from that: clicking either tab never matched `filters.viewMode`'s string,
so the view always landed on whichever tab Vuetify's mandatory-selection fallback happened to pick.
**Use `tab-value`:**

```vue
<v-tabs :value="filters.viewMode" grow height="40" color="primary" background-color="grey lighten-5" @change="onViewModeTabChange">
  <v-tab tab-value="heatmap">Heatmap</v-tab>
  <v-tab tab-value="table">Table</v-tab>
</v-tabs>
```

**Do not hand-write the `Programming__nav` / `Programming__tabs` wrapper classes.**
Those are Terrain's own scoped classes (note the `data-v-67c469f3` attributes in the
capture — they are scoped to Terrain's component and will not match anything of ours).
Copying them would be cargo-culting dead selectors. The `v-tabs` props above are what
actually produce the look.

⚠️ **Verify the rendered result live before declaring it done.** DESIGN.md is explicit
that no static source reliably predicts what a Vuetify component renders at on Terrain —
Terrain's page CSS overrides a great deal. Check the tab strip's height, text size and
active-underline colour against Terrain's own Programming page in DevTools, side by
side. Expect to need a small `::v-deep` override on `.v-tab` text (Vuetify uppercases
and letter-spaces tab labels by default; Terrain's do not look uppercased in the
capture — the labels are sentence case there, so confirm whether `text-transform: none`
is needed).

## 2. Where it goes

[`OasProgressionVueContent.vue`](../../src/pages/OasProgressionVue/components/OasProgressionVueContent.vue).
Currently line 14 holds the toggle button:

```vue
<v-btn ... @click="onToggleViewModeClick">{{ filters.viewMode === "heatmap" ? "Show Table" : "Show Heatmap" }}</v-btn>
```

Replace it. The tab strip is a **full-width row of its own, below the export/refresh
row**, not another item inside `.oas-progression-view-row` — a 40px grow tab bar does
not belong in a right-aligned button row.

Layout after this stage:

```
[ loading text ]              [ PDF Export ] [ Excel Export ] [ ⟳ ]   <- existing row
[   Heatmap   |   Table   |   Worksheets   ]                          <- new tab strip
[ filter panel ]
[ content ]
```

Delete `onToggleViewModeClick`. The export buttons stay where they are and keep their
existing per-view switching (`v-if="filters.viewMode === 'heatmap'"`), which Stage 3
extends for the worksheet.

## 3. State — reuse `viewMode`, don't add a parallel index

`filters.viewMode` already exists and is already persisted (see
[`OASProgressionVueFilterPersistence.ts`](../../src/pages/OasProgressionVue/services/OASProgressionVueFilterPersistence.ts)),
typed `"heatmap" | "table"`. Stage 3 widens it to include `"worksheets"`.

`v-tabs`'s `v-model` is a **numeric index** by default, which would mean a second source
of truth for the same thing. Avoid that: give each `v-tab` an explicit string identity via
`<v-tabs :value="filters.viewMode" @change="...">` with `<v-tab tab-value="heatmap">` etc.
(`tab-value`, not `value` — see the warning in §1). Bind `:value` + `@change` rather than
`v-model`, matching how every other control on this page talks to `filters` (the page
patches an immutable filter object — see `onFiltersUpdate`), instead of mutating a prop.

That also means **persistence keeps working for free**, and a user who had the Table
view selected still lands on Table after this change.

⚠️ `viewMode` is deliberately **not** reset by "Reset filters" — see the comment on
`onResetFilters` (line 141–145): it is a page-level display choice, not a filter. Keep
that behaviour; the tab must not jump back to Heatmap when filters are reset.

## 4. Accessibility

`v-tabs` renders `role="tablist"` / `role="tab"` and manages `aria-selected` itself (both
visible in the capture), so there is nothing to add by hand. Do not add `role`/`aria-*`
attributes on top of it — duplicating what Vuetify already emits is how those go wrong.

## 5. Tests

Extend `tests/unit/pages/OasProgressionVue/` with a spec on the content component, or
add to its existing one if present. Jest cannot parse an SFC, so a `.vue` import in a
component under test needs a `jest.mock(..., { virtual: true })` stub — see the top of
`tests/unit/pages/PresentAwardsVue/PresentAwardsVueContent.spec.ts` (noted in
DESIGN.md).

Cover the logic, not Vuetify's rendering:

- Selecting a tab emits/stores the matching `viewMode` string, not an index.
- A persisted `viewMode` of `"table"` selects the Table tab on load.
- "Reset filters" leaves `viewMode` untouched.
- An unrecognised persisted `viewMode` falls back to `"heatmap"` rather than selecting
  nothing — the persistence layer already tolerates junk (it returns a `Partial`), and
  `DEFAULT_FILTERS` spread covers a missing key but **not** a present-but-invalid one.
  Worth an explicit guard now that a third valid value exists.

## Verification

`npm test` and `npm run build` pass. Then, in Edge with `dist/` loaded:

- The strip looks like Terrain's Programming tabs. Compare live, side by side, in
  DevTools — see the warning in §1.
- Switching tabs still switches the view; the correct export buttons show per view.
- Reload the page: the selected tab persists.
- **Hard-refresh directly onto `/summit/reports/oasprogression`.** Summit's CSS is
  injected as a content-script stylesheet and loses cascade ties, so a control can
  render correctly when navigated to and wrongly on a cold load (DESIGN.md). A 40px
  tab bar whose height depends on an inherited rule is exactly the shape of thing this
  bites.
