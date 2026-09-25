# Stage 2 — Interactive cells and saving

**Goal:** the Vue page can tick awards as presented, adjust the presentation date, and write back
to the storage event. Feature parity with the React page, minus filters/export.

This is the stage with genuinely new ground: both prior Vue pages (`OasProgressionVue`,
`IStatements`) are **read-only**. Nothing in the codebase yet shows an editable `v-data-table`.

## The state-ownership problem

The React page mutates `SummitAchievement` instances **in place**
(`currentItem.updatePresented(...)` inside a `setItems(map)` that returns the same objects) and
leans on a separate `selectedIds: Set<string>` to drive the checkboxes. That works in React only
because `setSelectedIds` forces the re-render; the mutation itself is invisible to React.

Vue 2's reactivity **does** track those property writes, provided the objects were made reactive
when assigned to `data`/props. Don't fight it — but don't rely on in-place mutation of a prop
either, since the `items` array is pushed down from `PresentAwardsVue.ts`.

**The rule for this page:** the table component is presentational and emits; the content component
owns all edit state.

`PresentAwardsVueContent` holds:

```ts
selectedIds: Set<string>          // seeded from items where presented !== "No"
presentedDates: Record<string, string>   // achievement id -> "DD/MM/YYYY", edits only
```

Both are keyed by achievement id, so neither depends on array position and both survive a data
reload. The table receives them as props and emits `toggle-present` / `update-date`; the content
component applies the change. `SummitAchievement` instances are **not** mutated until save time,
where the existing `updatePresented()` is used to build the payload — so the model class and its
test stay untouched.

> Vue 2 gotcha: a bare `Set` prop must be declared
> `type: null as unknown as PropType<Set<string>>`, or Vue 2's constructor check logs a spurious
> invalid-prop warning (see `OasProgressionVueContent.ts:71`). Also, Vue 2 does **not** make `Set`
> contents reactive — reassign a new `Set` on every change rather than calling `.add()`/`.delete()`
> on the existing one, or the table will not re-render.
>
> Same trap for `presentedDates`: Vue 2 cannot detect new keys on a plain object. Use
> `this.presentedDates = { ...this.presentedDates, [id]: value }`, not `this.$set` scattered around.

## The Present column

```html
<template #item.present="{ item }">
  <v-simple-checkbox :value="selectedIds.has(item.id)" :ripple="false" @input="onTogglePresent(item, $event)" />
</template>
```

`v-simple-checkbox` rather than `v-checkbox` — it is the variant Vuetify ships specifically for
data-table cells: no label, no validation slot, no `min-height: 40px` wrapper forcing the row
taller. `:ripple="false"` because the ripple overflows a `dense` row.

Toggle semantics must match the React page exactly (`PresentAwards.tsx:40-68`):

- ticking a row whose `presented` is `"No"` seeds its date from `dateAwarded`
- unticking clears it back to `"No"`

## The Presented column

```html
<template #item.presented="{ item }">
  <span v-if="!presentedValue(item)">No</span>
  <v-menu v-else v-model="dateMenus[item.id]" :close-on-content-click="false" offset-y min-width="auto">
    <template #activator="{ on, attrs }">
      <span class="present-awards-date-activator" v-bind="attrs" v-on="on">{{ presentedValue(item) }}</span>
    </template>
    <v-date-picker :value="toIsoDate(presentedValue(item))" no-title @input="onDateInput(item, $event)" />
  </v-menu>
</template>
```

Three things to get right:

1. **`:close-on-content-click="false"`** — without it the menu closes on the first click inside the
   picker, before a date is chosen.
2. **Date format boundary.** `v-date-picker` only speaks ISO `YYYY-MM-DD`. Everything else on this
   page speaks `DD/MM/YYYY`. Convert at exactly these two points (`toIsoDate` in, moment format
   out) and nowhere else.
3. **Fix the existing 2-digit-year bug rather than porting it.** React's `dateUpdated`
   (`PresentAwards.tsx:27`) formats with `"DD/MM/YY"` while the model and the save path both use
   `"DD/MM/YYYY"`; `moment("05/03/26", "DD/MM/YYYY")` only survives because moment is lenient. The
   new page uses `"DD/MM/YYYY"` throughout. Note this in the commit message — it is a real
   divergence from the React page, chosen deliberately.

The activator needs to look clickable. Style it in the SFC's scoped block with a dotted underline
and `cursor: pointer`, sized from `--oas-vue-font-size-body`.

## Save

Header row in `PresentAwardsVueContent.vue`, matching the OAS button order (actions left to right,
rightmost is Refresh — Refresh itself arrives in Stage 4):

```html
<v-btn outlined color="primary" class="oas-vue-pill-btn" :loading="isSaving" :disabled="isSaving" @click="onSaveClick">Save Changes</v-btn>
```

`onSaveClick` emits up to `PresentAwardsVue.ts`, which:

1. builds the item list the same way React's `saveChanges` does — every item that is either
   already presented or newly selected, with `updatePresented()` applied from `presentedDates`
2. if nothing is selected, shows the warning and returns (React uses a toast; see below)
3. `await savePresentedAwards(this.storeEvent, filteredItems)` — the Stage 1a service
4. reports the outcome

## Save feedback

The React page uses `ToastComponent` (a React component — unusable here) and only ever warns about
an empty selection; a failed save says nothing at all.

Use the **same mechanism the OAS Vue page already uses for export feedback** rather than
introducing a Vuetify snackbar: a `role="status"` div with class `data-grid-export-feedback`,
driven by a `saveFeedback` string that clears on a timer. This keeps one feedback idiom across all
the Vue pages and reuses a class already in `index.css`.

Three messages: `"No new awards were selected as presented."` (unchanged wording from React),
`"Saved."`, and `"Save failed: <message>"` — the third being new capability that only exists
because Stage 1a made the save awaitable.

After a successful save, re-run the load so `previouslyPresented` reflects what is now stored.
This closes the gap left by the commented-out block at `PresentAwards.ts:177-182`.

> **Do not** attempt to fix the concurrent-save clobbering here. The save is still a full replace
> of `schedule_items`; two leaders saving at once still means last-write-wins. That is a known,
> documented limitation (`DEV_NOTES.md`) and is explicitly out of scope.

## Verification

- Standing baseline.
- Tick a row → date appears, defaulted to the awarded date. Untick → back to "No".
- Click a date → picker opens, stays open until a date is picked, cell updates.
- Save with nothing selected → warning, no network call (check DevTools Network).
- Save with a selection → `PATCH`/`POST` to `events.terrain.scouts.com.au` returns 2xx, "Saved."
  appears, rows reload with the new presented dates.
- Reload the page → presented state persisted.
- Open the **React** page afterwards → it shows the same presented state, proving both pages read
  and write one compatible format.
