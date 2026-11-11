# Terrain bundle refresh

Planned 2026-11-07. Done 2026-11-11 (commit `dc20b90`, tag `terrain-bundle-2026-11-11`), offered upstream as
`pr/terrain-bundle`. The steps for each refresh now live in CLAUDE.md › Terrain bundle snapshot.

## Why

`docs/terrain.scouts.com.au/` is our reference copy of the code Terrain sends to the browser. We search it
for real award ids, see DESIGN.md, and use it to answer questions like "can a concluded activity be
edited?". Upstream added it in its first commit (`c8179aa`, 2024-03-29) and has never updated it. It's
also partial: 57 JS files, just the pages someone happened to open.

On 2026-11-07 a full download of live Terrain gave 692 files: 268 JS, 179 CSS, 211 images, 9 fonts. It
showed real behaviour changes since 2024. For example, Group Leaders can now edit concluded activities
(see OUTSTANDING.md › Summit Calendar). That download is at
`P:\Dev\personal\terrain_summit\reference\terrain-bundle\2026-11-07\`, outside git, with its script
`mirror-terrain.js` beside it.

## Goal

- `docs/terrain.scouts.com.au/` on `main` always holds the latest full copy.
- Every earlier copy stays recoverable and dated.
- A refresh is one command plus a tag and a commit, the same steps every time.
- Tags and `.claude/` never reach GitHub. The refresh itself is offered upstream as its own PR (changed
  2026-11-11, see below).

## Decisions

| Question | Decision | Reason |
| --- | --- | --- |
| How to archive old copies | Git history plus a tag per snapshot (`terrain-bundle-<date>`) | Backed up to Bitbucket, no duplicate folders, `git diff` between tags shows what Terrain changed |
| Where the script lives | `docs/mirror-terrain.js` (changed 2026-11-11 from `.claude/tools/`) | It goes upstream in the bundle PR, so the maintainer can refresh too |
| PR branches | Feature PRs keep upstream's copy; the refresh goes in its own PR, `pr/terrain-bundle` (only `docs/`, cut from `upstream/main`, no `git merge main`) | About 800 changed files would swamp an unrelated PR. Decided 2026-11-11: open the PR directly, without asking the maintainer first |
| Refreshes in docs | Steps in CLAUDE.md, not DEVENV.md | DEVENV.md is a template shared across projects |
| Old dated folders in `reference/terrain-bundle/` | Delete once the first refresh is committed | Git then holds the same content |

**Cost:** Terrain renames nearly every file each time it deploys (the names include content hashes), so
each refresh adds about 30 MB to the repo's history. A refresh every few months is fine. Don't run it on
a schedule.

## One-off steps (first refresh)

### 1. Make the script a reusable tool

Move `reference/terrain-bundle/mirror-terrain.js` to `.claude/tools/mirror-terrain.js` and change it to:

- Default its output to `docs/terrain.scouts.com.au/` (resolved from the repo root, not the current folder).
- Download into a staging folder (`docs/terrain.scouts.com.au.tmp/`). Swap it into place only if the
  run had **zero failures** and at least **150 JS files**. Otherwise leave the current copy untouched and
  exit with an error. The image extractor (`src/images/extract-terrain-images.js`) uses the same guard so
  a broken run can't wipe good data.
- Write `MIRROR_INFO.txt` (source, capture time, runtime file, counts) inside the folder, so each
  snapshot says when it was taken.
- Print the tag name to use next (`terrain-bundle-YYYY-MM-DD`).

Test it into a scratch folder first, then for real.

### 2. Archive the 2024 copy

```
git tag terrain-bundle-2024-03-29 HEAD
```

Tag the commit just before the refresh. The date is upstream's commit date; the real capture date
isn't known.

### 3. Refresh and commit

```
node .claude/tools/mirror-terrain.js
git add -A docs/terrain.scouts.com.au .claude/tools
git commit -m "docs: refresh Terrain bundle snapshot (YYYY-MM-DD)"
git tag terrain-bundle-YYYY-MM-DD
```

Before committing, run `git status --short docs/terrain.scouts.com.au | head` and confirm the old hashed
files show as deleted and the new ones as added. Line endings: git may warn "LF will be replaced by
CRLF" for the JS files. That only affects your checked-out copy and is harmless for searching.

### 4. Push to Bitbucket only

```
git push origin main
git push origin terrain-bundle-2024-03-29 terrain-bundle-YYYY-MM-DD
```

**Gotcha:** never push these tags to `github`, and never run `git push github --tags`. The tags point at
`main` commits, which contain `.claude/`, so pushing them would publish `.claude/` on GitHub.

### 5. Keep it off the PR branch

Add one step to "Updating the PR branch" in CLAUDE.md, after the `.claude` step:

```
git rm -r -q docs/terrain.scouts.com.au
git checkout upstream/main -- docs/terrain.scouts.com.au
```

This restores upstream's copy exactly, including removing files that only exist in our refresh. Also
extend the step-5 check so it fails if the folder differs from upstream:
`git diff --quiet upstream/main HEAD -- docs/terrain.scouts.com.au`.

Do this the next time the PR branch is updated. Nothing needs to happen on `summit-dev` until then.

### 6. Update docs and notes

- **DEVENV.md:** add a short "Refreshing the Terrain bundle" section with steps 3–4 and the tag gotcha.
- **DESIGN.md (around line 278)** and **BadgeManifest/PLAN.md (line 21):** the path stays the same, so
  the links still work. Their findings ("33 JS chunks", "extracted 2026-09-30") were made on the 2024
  copy. Add "(2024 snapshot, tag `terrain-bundle-2024-03-29`)" rather than rewriting them, then
  re-check that the facts they rely on still hold in the new copy. Award ids and Vuetify 2 were already
  confirmed on 2026-11-07.
- **Claude's memory** (`terrain_award_ids_source`): point back at `docs/terrain.scouts.com.au/` and
  mention the tags and the tool.
- **OUTSTANDING.md:** remove the Terrain bundle item.

### 7. Clean up

Delete `P:\Dev\personal\terrain_summit\reference\terrain-bundle\` once steps 1–4 are done and the
commit is on Bitbucket.

## Every later refresh

1. `node .claude/tools/mirror-terrain.js`
2. Optionally see what Terrain changed: `git diff --stat` (for real code changes, compare the files in
   `pages/` and `components/`).
3. Commit, tag with the date, then `git push origin main` and `git push origin <tag>`.
4. Nothing to do on `summit-dev`: the step from step 5 handles it at the next PR update.

Good times to refresh: when Terrain visibly changes, when a Summit page breaks for no obvious reason,
or before starting work that depends on Terrain behaviour.

## Done when

- [x] `docs/mirror-terrain.js` exists, stages its download, and refuses partial runs (tested with a simulated failure)
- [x] Tags `terrain-bundle-2024-03-29` and `terrain-bundle-2026-11-11` exist and are on `origin` only
- [x] `docs/terrain.scouts.com.au/` on `main` holds the full new copy with `MIRROR_INFO.txt` (692 files, 268 JS)
- [x] CLAUDE.md PR-branch steps restore upstream's copy while `pr/terrain-bundle` is unmerged
- [x] CLAUDE.md, DESIGN.md, BadgeManifest/PLAN.md, memory and OUTSTANDING.md updated
- [x] `reference/terrain-bundle/` deleted
- [ ] `pr/terrain-bundle` merged upstream; then drop the restore step from CLAUDE.md step 5

The one-off steps below are kept as a record. Where they say `.claude/tools/` or `summit-dev`, read
`docs/` and "feature PR branches".
