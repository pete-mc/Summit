# Investigation: total i-statement count in the Stage X.yy display — REVERTED

## Outcome

Implemented and shipped as `X yy/nn` (e.g. `3 05/06`), then reverted on user feedback
("looks awful") back to the original `X.yy` display. See git history for the
implement-then-revert commits.

**What was kept from this investigation**: the same-stage sort tiebreaker (`sortMembers`,
`"stageProgress"` case, in `filterHeatMapSections.ts`) was changed from raw ticked-count to
ticked/total **proportion**, and that change was kept even after the display reverted — it's a
real correctness improvement independent of whether `nn` is shown: a member with 5 of 6
i-statements ticked in the next stage ranks above one with 6 of 20 ticked, even though 6 > 5,
because 5/6 (83%) is closer to finishing that stage than 6/20 (30%). See
`stageProgressProportion()` and its doc comment for the current logic.

## Original background (for future reference if this is revisited)

The Stage column shows `X` or `X.yy`:
- `X` = the member's highest fully-AWARDED stage (or, for a gated stream section, the trunk
  floor once unlocked).
- `.yy` = zero-padded count of i-statements answered-or-awarded in the stage immediately above
  `X`, within the same section. Omitted entirely when that count is 0.

There is no visible denominator today — `.05` could mean 5 of 6, or 5 of 20 — which was the
motivation for this investigation. The `X yy/nn` display was tried and rejected on visual
grounds. If revisited, consider a more compact denominator treatment (e.g. a tooltip on hover
showing "5 of 6 i-statements started in stage 4", rather than inline text) instead of widening
the cell's plain-text content.
