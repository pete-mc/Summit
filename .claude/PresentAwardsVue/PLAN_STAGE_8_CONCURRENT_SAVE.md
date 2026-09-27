# Stage 8 — Concurrent saves

**Status:** **complete** (2026-09-27). Empty-save guard, content-hash detection and the merge are
all built. Two things changed during implementation — see "Deviations from this plan" at the foot.

Addresses the long-standing note in `.claude/DEV_NOTES.md`:

> Consider adding checksum in calendar to avoid "if two Leaders have the Present Awards page open
> at the same time, whichever one saves last wins and silently discards the other's changes".

## The problem

`buildStorageEventPayload` rebuilds the entire `schedule_items` list from whatever the saving
user currently has ticked, and PATCHes it over the top. There is no merge.

```
09:00  Alice loads    → sees 40 presented awards
09:01  Bob loads      → sees the same 40
09:05  Alice ticks 3  → saves 43
09:07  Bob ticks 2    → saves 42, built from the 40 he loaded
                         Alice's 3 are gone
```

Three things make this worse than a typical race: it is **silent** (Bob sees success, Alice is
never told), the loss is **unrecoverable** (the previous list is simply gone), and the window is
**minutes wide**, because leaders leave the page open during a meeting. The likeliest time for it
to happen is two leaders working the same pile of badges at the same meeting — exactly the
intended use.

## What Terrain gives us — nothing

Confirmed 2026-09-27 by reading a live `GET /events/{id}` response in DevTools. The event carries
no `version`, `last_updated`, `updated_at` or `revision`, and no `ETag` header. `TerrainAchievements`
has `version`/`last_updated` fields, but `TerrainEvent` does not — an easy thing to misread.

So there is **no conditional write available**. Everything below is detect-and-recover, not
prevent. Be honest about that in any UI copy.

## Detection: hash the stored content

Compute a hash of the packed `description` strings across all `schedule_items`, at load and again
immediately before writing. Same hash ⇒ nobody wrote in between; different hash ⇒ someone did.

**Not stored anywhere** — derived from the data on each read. So no schema change, no
`equipment_notes` bump, no migration, and the legacy React page keeps working untouched.

**Deliberately not a counter.** A counter only records writes that went through our code; an older
build, the legacy page mid-rollout, or a manual edit would leave it stale — and it would fail
*while still appearing to work*. A content hash is derived from the data itself, so it is correct
by construction regardless of who wrote.

FNV-1a is sufficient (~10 lines, no dependency). This detects accidental concurrent edits, not
tampering, and the merge is conservative anyway.

### A useful side observation

`buildStorageEventPayload` stamps every schedule item's `start_datetime` with `moment()` at save
time, so **every save rewrites every item's timestamp to "now"**. The latest `start_datetime`
across all items is therefore a de-facto "last written at" clock.

Not used for detection — the hash is more robust, catching changes even within the same second —
but it lets the conflict message say *when*: "Someone else saved at 9:41am" reads far better than
"someone else saved."

## Merging: compare each save against its own base

The naive merge is a union of presented awards. That is wrong in one case, and the reasoning
matters because it changed during design.

From a **shared** base, two people can only move an award the same direction — both tick an
unpresented award, or both untick a presented one. Same-direction changes merge trivially. There
is no conflict. (Credit to the user for catching that an earlier "presented wins" proposal was
answering a scenario that could not occur.)

Divergence needs **different** bases, which needs a save in between:

```
09:00  Alice loads          → award X is "not presented"
09:05  Carol ticks X, saves → X is now presented
09:06  Bob loads            → X is "presented"
09:10  Alice ticks X        → acting on stale data; X was already presented
09:11  Bob unticks X        → sees it presented, judges it wrong, corrects it
```

So: **diff each save against the base that user loaded**, and apply only what they actually
changed.

- Alice's set contains X and X was in her base → carried along, not a decision. No intent.
- Bob's set omits X and X **was** in his base → deliberately removed. Real intent.

Bob's untick wins, because it is the only actual decision in play. This needs no precedence rule —
it just separates deliberate changes from inherited state, and the divergent case stops being a
conflict at all.

The base is already available: `PresentAwardsVue.ts` holds `storeEvent` from load
(`PresentAwardsVue.ts:64`), so the merge needs no new plumbing.

### Merge algorithm

```
base     = presented GUIDs from the storeEvent this user loaded
mine     = presented GUIDs this user is saving
current  = presented GUIDs re-read from the server just now

added    = mine − base          (this user deliberately ticked)
removed  = base − mine          (this user deliberately unticked)

result   = (current ∪ added) − removed
```

Everything else in `current` — other people's work, untouched by this user — passes through
unchanged.

## The irreducible case

Two people change the **same** award in **opposite** directions, from **different** bases, within
the same second.

Both intents are real and simultaneous; there is no principled basis to prefer either. **Last
write wins**, and we accept it.

This is rare on three counts at once: it needs a third party's save to create the diverging bases,
it needs the two users to disagree about that specific award, and it needs both saves inside the
few hundred milliseconds between our re-read and our PATCH. Building machinery for it would cost
more than it saves — and no client-side design can close it without a server-side conditional
write.

**Do not describe this work as making concurrent saves safe.** It shrinks the loss window from
minutes to milliseconds and recovers everything outside it. That is a large improvement, not a
guarantee.

## Guard: never silently save an empty list — BUILT 2026-09-27

Separately from concurrency, and independently worth having.

`checkNotAnAccidentalWipe(storeEvent, newItems)` in `awardStorageEvent.ts` refuses a save that
would write an empty list over an event that currently holds awards, returning a `SaveEventResult`
failure naming how many records were at risk. `savePresentedAwards` calls it before building any
payload, so both pages are covered.

The save is a whole-event replace, so an empty write erases every presentation record for the
unit, irreversibly. That is legitimate when a leader genuinely unticks everything and catastrophic
when it happens because the page loaded without its data. The guard takes the conservative reading
and asks the user to untick individually or reload.

The Vue page already refuses to save with nothing ticked (`PresentAwardsVueContent.ts:254`), so
this is a second line of defence there — but it is the **only** protection the legacy React page
has, since that page calls the service directly.

Reads both storage schema versions, so a v1 event is protected too. Six tests in
`tests/unit/pages/PresentAwards/services/awardStorageEvent.spec.ts`.

### A false alarm, recorded so it is not re-investigated

This guard was originally motivated by apparently-empty GET responses seen in DevTools — first
call empty, second populated, across two endpoints. That was diagnosed at the time as possible
auth-timing on page load, and a `waitForTerrainAuth()` helper was proposed.

**That diagnosis was wrong.** A later screenshot of the full Network panel showed the doubled rows
were CORS **preflight** pairs: an `OPTIONS` returning 204 No Content, followed by the real `GET`
returning the event. Every request succeeded. There is no empty-response bug and no auth-timing
problem; `getToken()` works correctly.

The lesson worth keeping: a 204 and a failed guard both render as "empty" in the response pane,
and the status code distinguishes them. Ask for it before theorising.

The guard remains valuable on its own merits — the failure it prevents is severe and the check is
nearly free — but it is defensive work, not a fix for anything currently broken.

## Shape of the work

**`awardStorageEvent.ts`**

- `hashScheduleItems(storeEvent): string` — FNV-1a over the packed descriptions
- `lastWrittenAt(storeEvent): Date | null` — latest schedule-item `start_datetime`, for messaging
- `mergePresentedGuids({ base, mine, current })` — the set algebra above
- `savePresentedAwards(...)` gains the re-read → compare → merge → write path, with **one** retry
  if the hash moves again mid-save, then a loud failure

**`PresentAwardsVue.ts`**

- Keep the load-time hash alongside `storeEvent`
- Surface the merge outcome so the user is told what happened

**UI copy** — after a merged save, say so plainly rather than a bare "Saved.":
*"Saved. Someone else had also made changes at 9:41am; both sets have been kept."*
The user needs to know a merge happened, because it means the screen they were looking at was not
the whole picture.

## Tests

- Hash: stable across identical content, changes when any description changes, handles an event
  with no schedule items
- Merge: no-conflict union; a deliberate untick surviving another user's carried-along tick
  (the Alice/Bob/Carol case above); other members' awards passing through untouched; an empty
  `current` not erasing `added`
- Empty guard: refuses an empty write against a non-empty base; **allows** it when the user
  genuinely unticked everything
- Retry: one retry on a moved hash, then failure — not an infinite loop

Merge logic is pure set algebra over GUID arrays, so it tests directly with no DOM and no mocking.

## Scope

**The legacy React page shares this service**, so it inherits the protection. It still cannot
*report* a merge, because it never holds the save promise (see `awardStorageEvent.ts`) — its saves
will silently do the right thing, which is a strict improvement on silently doing the wrong one.

## Deviations from this plan, as built

**1. The merge works in award records, not GUIDs.**

The plan's algebra is over GUID sets, but `buildStorageEventPayload` needs `memberid` and
`membername` per award to group schedule items — and an award merged in from *another* user's
save exists only as packed data in their schedule item, with no `SummitAchievement` for it in this
user's session.

Recoverable from the stored item: the packed description carries guid and date, `leader_notes` the
member id, `assistant_notes` the name. So `PresentedAwardRecord` carries all four,
`readPresentedRecords()` reads them (where `readPresentedGuids()` flattens that away), and
`buildStorageEventPayloadFromRecords()` writes them back. `buildStorageEventPayload()` keeps its
old signature and delegates, so the React page and existing tests are untouched.

Without this the merge compiles fine and silently loses other users' member attribution.

**2. No retry.**

The plan called for one retry when the hash moves again mid-save. Built and then removed: it added
a confirm-read, a second merge and a loop guard, to cover a window the re-read has already
narrowed to a single round trip — and the honest answer in that window is last-write-wins anyway,
which is what the plan's "irreducible case" section already accepts. The retry was complexity
buying almost nothing.

A failed *re-read* is still handled explicitly, and is the more important case: it must not be
read as "the event is now empty", since merging into that would produce a wipe. It fails loudly
instead.

**3. The merge prefers this user's own dates.**

Not in the plan. If both the server copy and this user's save hold the same award, this user's
record wins, so a presentation date they edited is not silently reverted to the stored one.

## What shipped

`awardStorageEvent.ts`: `PresentedAwardRecord`, `readPresentedRecords`, `lastWrittenAt`,
`hashStorageEvent`, `mergePresentedAwards`, `toPresentedAwardRecord`,
`buildStorageEventPayloadFromRecords`, and the re-read/compare/merge path in
`savePresentedAwards`.

`saveEventResult.ts`: `mergedWith?: Date | null` on the success case.

`PresentAwardsVue.ts`: `saveAwards` returns `PresentAwardsSaveOutcome` (`{ error?, mergeNotice? }`)
rather than `string | null`, so a merge can be reported distinctly from an ordinary save.

`PresentAwardsVueContent.ts`: a merge notice replaces "Saved." and stays up for 10s rather than 4s,
since it reports something the user did not already know.

**Tests:** 12 in `mergePresentedAwards.spec.ts` (both sides of the Alice/Bob/Carol case, member
attribution surviving, date preference, no duplicates), plus hash/records/`lastWrittenAt` coverage
in `awardStorageEvent.spec.ts`, and a merge-notice test on the content component. 610 total,
609 passing — the one failure is the pre-existing UNC-path smoke test.
