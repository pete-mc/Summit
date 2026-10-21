# Images

| Folder | What | Source |
| --- | --- | --- |
| `Icon*.png` | Summit's own extension icons | Summit |
| `sections/` | Section logos used in print headers | Scouts Australia brand files |
| `terrain/` | Badge artwork (OAS, additional awards, milestones, Peak Awards, SIAs) | **Generated** from the live Terrain site; do not edit by hand |
| `manual/` | Badges Terrain's bundle doesn't contain (Introduction to Section, Adventurous Journey, LS/PD Course, Introduction to Scouting) | **Downloaded by hand**; the script never touches this folder |

## `manual/` badges

Terrain shows no badge art for these achievement types, so they were downloaded by hand and renamed
`<type>-<section>.<ext>`, with the section in singular lower case (`joey`, `cub`, `scout`, `venturer`, `rover`):

| Files | Manifest keys | Notes |
| --- | --- | --- |
| `intro-section-<section>.webp` | `intro_section_<section>` | Originally `Introduction_to_<Section>s.webp` |
| `adventurous-journey-<section>.webp` | `adventurous_journey_<section>` | Originally `Adventurous_Journey_<Section>s.webp` |
| `personal-development-<section>.webp` | `course_reflection_<section>` | Originally `Personal_Development_<Section>s.webp`; Joeys have no course |
| `scouts-australia-logo.jpg` | `intro_scouting` | Scouts Australia national full-colour vertical logo |

To replace or add one: download it, save it here under the name above, and set or update that row's `file` in
`badgeManifest.ts`.

The Adventurous Journey and Personal Development downloads come on a large light-grey canvas. They were trimmed to the
badge's white border with ImageMagick, and marked `wide` in the manifest because the result is landscape:

```
magick <file>.webp -fuzz 2% -trim +repage -resize "580x>" -quality 90 <file>.webp
```

Keep the fuzz at 2%. The badge's white border is only about 5% away from the grey, so a higher value trims it off too. These files are not refreshed automatically, so check them by eye if Scouts Australia updates a design.

Badges are mapped to files in `src/shared/badgeManifest.ts`. Paths there are relative to this folder.

## Refreshing `terrain/`

```
npm run images:terrain
```

This runs `extract-terrain-images.js`, which:

1. Downloads `https://terrain.scouts.com.au/` and the `/_nuxt/*.js` bundles it loads. These are public; no login needed.
2. Reads webpack's image map in those bundles, e.g. `"./additional-award-badges/landcare.svg": 602`, and resolves
   each entry to either a `/_nuxt/img/<name>.--<hash>.svg` URL or an inline `data:` URI (Terrain inlines small images).
3. Writes the badge images to `terrain/` under **Terrain's own source paths**, replacing the folder.
   It aborts without touching anything if it finds fewer than 20 additional awards.

The `--<hash>` in Terrain's live filenames changes on every Terrain deploy, so never link to or hard-code those URLs.
The source paths (`additional-award-badges/<award id>.svg`, `milestones/<section>/milestone-N.svg`, …) are stable.

After a refresh:

1. `git diff --stat src/images/terrain` shows which artwork Terrain changed, added or removed.
2. `npm test -- badgeManifest`. It fails if a manifest row points at a file that no longer exists.
3. Rebuild, reload the unpacked extension and check Present Awards and OAS Progression.

### Adding a new Terrain award

`badgeManifest.spec.ts` compares the additional-award ids with the captured bundle in `docs/terrain.scouts.com.au/`.
When Terrain adds an award: re-capture that bundle, run `npm run images:terrain`, then add a row to
`badgeManifest.ts` pointing at `terrain/additional-award-badges/<award id>.svg`.

### Browsing everything Terrain bundles

```
npm run images:terrain -- --all <output folder>
```

This saves all of Terrain's images (around 390: UI icons, illustrations, SDG and SPICES icons) to a folder of your
choice, without changing `src/`. Use a folder outside the repo. To ship another image, add its path pattern to
`BADGE_PATTERNS` in the script and re-run.

The script and this README are excluded from the extension build (`webpack.config.js`, CopyPlugin `ignore`).
