# Stage 3: Footer fallback for older browsers, and repeating only the Member column

Parent plan: [PLAN.md](PLAN.md). Builds on Stage 2 (`e38bf1c`).

## 1. The problem

Footers are drawn with CSS page-margin boxes (`@page { @bottom-left { … } }`). Only Chromium 131+ supports these. Older Edge/Chrome, Firefox and Safari **silently print no footer at all**: no error, it's just missing.

## 2. The approach

- **Detection (`src/print/printSupport.ts`):**
  - Use `navigator.userAgentData.brands` (Chromium's own brand list) when present. Otherwise read the `Chrome/NNN` version from the user-agent string. Edge's UA includes `Chrome/NNN` too.
  - Chromium 131+ gets margin-box footers. Anything else, including an unrecognisable browser, gets the fallback. Assuming support could print silently footer-less pages, whereas the fallback always prints something.
- **Test switch:** the user's own Edge is current, so the fallback can be forced. In DevTools on Terrain, run:
  - to force it: `localStorage.setItem("summit.print.footerFallback", "force")`
  - to switch it off: `localStorage.removeItem("summit.print.footerFallback")`
- **The fallback footer:**
  - It goes in a `<tfoot>` row on the printed table. Browsers repeat `display: table-footer-group` at the foot of the table on every page.
  - It has left, centre and right slots, like the real footer. Any slot containing `{page}`/`{pages}` is dropped, because page counters only work in margin boxes, so "Page X of Y" can't be shown.
  - It sits at the bottom of the table on each page, not at the very bottom of the sheet. On a page the table fills, those are nearly the same.
  - **Split printouts:** each part's table carries its own footer, with "Part n of m" in the centre.
  - The margin-box `@bottom-*` rules are left out in fallback mode, so a forced fallback in a modern browser doesn't show both footers.
- **Dialog note:** in fallback mode the dialog adds one line: "This browser can't print page numbers — update Edge to version 131 or later for full footers." It's left out when the fallback was forced for testing, so the note only appears for real.

## 3. Tweak (user, 2026-10-11): repeat only the Member column

- Split printouts repeat only the first column (Member) on every part. The Heatmap's Stage column no longer repeats; it prints on part 1 only.
- This applies to the Heatmap (`repeatColumns` 2 → 1) and the Summary (already 1, now stated explicitly) "at this time". It's a profile setting, so it's easy to change back.

## Status (2026-10-11): built, awaiting live check

- `npm test`: 981/982 passing (the 1 failure is the known UNC smoke test). Lint is clean, and the build succeeds.
- Splitting is now unit-tested by stubbing element widths, because jsdom has no layout engine. The tests confirm:
  - each part repeats only Member;
  - Stage prints once;
  - in fallback mode each part's own footer says "Part n of m", with no named-page rules.
- **Not provable here:** whether a real older browser repeats the `<tfoot>` on every page. Chromium and Firefox both do, but the forced-fallback check in Edge is the practical test.

### Live check results (user, 2026-10-11)
1. Only Member repeats on split parts.
2. The forced fallback footer works, and "Part n of m" works. The user saw a **second footer line** (the page URL and "2/5"). That is Edge's own "Headers and footers" print option, not Summit:
   - Summit never prints the URL or an "n/m" count.
   - In fallback mode Summit leaves the page margins empty, so Edge's own header and footer show through.
   - The dialog already tells users to untick it. **Re-check with it unticked** to confirm.
3. Switched off again.

### Round 2 change (user feedback)
- **No zebra striping:** every row prints on white. The alternating grey obscured the patrol rows when "Break by patrol" was on.
  - Removed from the shared base CSS, which only the two OAS tables used.
  - Title and patrol bands keep their tint (they're more specific).
  - Present Awards (Stage 4) starts unstriped; ask the user before adding any.

## 4. Live checks for the user

1. **Normal (no flag), Heatmap, split:**
   - Only Member repeats on parts 2 and up.
   - Footers and "Page X of Y" are unchanged.
2. **Forced fallback** (set the flag, reload, print the Heatmap with fit, then split):
   - A footer line appears at the foot of the table on every page, with no "Page X of Y".
   - On split, each part's footer says "Part n of m".
   - There is no second, duplicate footer.
3. Remove the flag, reload, and confirm normal footers come back.
