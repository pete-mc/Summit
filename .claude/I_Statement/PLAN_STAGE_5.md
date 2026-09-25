<!-- @format -->

# PLAN_STAGE_5.md — Verification and documentation

## 1. Correctness audit against real data

The risk with this page is that it looks plausible while being subtly wrong —
a normalisation that over-merges, or a square in the wrong column, is invisible
unless checked deliberately.

Do these by hand, against raw `latest.json` responses read in DevTools:

- **Spot-check three statements** across different Skills: confirm every square
  is real, and — equally important — that there are no *missing* squares.
- **Audit the merges.** Produce a temporary console dump of rows where
  `variants.size > 1`, and read through them. Every merge must be a genuine
  same-statement match. If normalisation has merged two genuinely different
  statements, tighten it and re-run. This is the single most likely defect.
- **Check the long tail**: rows with exactly one cell should be genuinely unique
  statements, not merge failures caused by a stray character.
- Confirm no row is `logbook_up_to_date` or a file-uploader artefact.

## 2. Cross-check against Topo-Blazor

`reference/Topo-Blazor` already produces i-statement worksheets and is the
closest existing implementation. If it exposes anything equivalent to a
cross-Skill statement view, compare a sample. Treat divergence as a question to
investigate, not automatically a bug in either tool.

## 3. Regression check on OAS Progression

Stage 1 may have added `export` keywords to
`buildOASProgressionRows.ts`, and both pages share the template cache.

- Open OAS Progression and confirm it is unchanged in behaviour.
- Open I Statements first, then OAS Progression, and confirm the shared cache
  causes no cross-contamination (they cache different things under different key
  prefixes, but confirm rather than assume).

## 4. Full test and lint pass

- `npm test` — all passing except the one known pre-existing UNC-path smoke-test
  failure documented in `.claude/DEVENV.local.md`.
- `npx tsc --noEmit` — no new errors beyond the 4 known pre-existing ones.
- `npm run lint` — no *new* errors. The repo has ~40 pre-existing upstream lint
  errors (mostly CRLF/Prettier); don't fix those here, but don't add to them.

## 5. Documentation

- **`.claude/DESIGN.md`** — add the I Statements page to the "OasProgressionVue's
  type scale" section, noting it deliberately shares the `--oas-vue-*` scale.
  If a new colour token was added for the square, document it with the others.
- **`.claude/I_Statement/PLAN.md`** — mark stages complete as they land, matching
  how the OAS plans track status.
- **`.claude/DEV_NOTES.md`** — record anything surprising found along the way,
  particularly the final normalisation rule and why it ended up where it did.

## 6. Commit

One commit per stage rather than a single large one, following the repo's
existing message style (`feat:` / `fix:` / `refactor:` / `docs:`, lower-case
summary). The PLAN-file reorganisation into `OASProgression/` and `I_Statement/`
should be its own `docs:` commit, separate from feature work, since it touches
unrelated files.

Do not push or open a PR without asking.
