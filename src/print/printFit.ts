/**
 * Page layout for the print document. Runs against the print document AFTER it has rendered in a
 * hidden iframe whose body is exactly the printable width of the chosen page, so what fits can be
 * measured directly. Dependency-free on purpose (see .claude/Print/PLAN.md).
 *
 * Two strategies:
 *   'fit'   – keep the table one page wide: let it reflow, then shrink with CSS zoom (down to
 *             minZoom). Only if it STILL doesn't fit do we fall back to splitting columns.
 *   'split' – keep things at (near) full size and split the columns across several page-wide
 *             "bands", repeating the first `repeatColumns` columns (e.g. Member, Stage) on every
 *             band. Each band runs down as many pages as it needs: an n × m page grid, printed
 *             "down, then across" like a spreadsheet.
 *
 * Browsers never paginate a table sideways — anything wider than the page is simply cut off —
 * which is why the banding is done here rather than left to the print engine.
 *
 * Note: Array.from() rather than spread throughout — see the ES5 Set-spread note in
 * .claude/Print/PLAN.md (I2).
 */

export type PrintLayout = "fit" | "split";

export interface LayoutOptions {
  layout?: PrintLayout;
  /** Smallest shrink allowed in 'fit'. */
  minZoom?: number;
  /** Zoom used for bands in 'split'. */
  splitZoom?: number;
  /** Leading columns repeated on every band. */
  repeatColumns?: number;
  step?: number;
  /** Label above each band, e.g. 'Stages {first} – {last}'. */
  bandLabel?: string;
  /** Centre footer on split parts; {part}, {parts}, {page}, {pages}. */
  partFooter?: string;
}

export interface LayoutResult {
  zoom: number;
  overflow: boolean;
  bands: number;
}

export const PRINT_TABLE_SELECTOR = "table.summit-print-table";
const FOOTER_FONT = '7.5pt "SummitPrintSans", arial, sans-serif';

export function layoutTable(doc: Document, options: LayoutOptions = {}): LayoutResult {
  const { layout = "fit", minZoom = 0.6, repeatColumns = 1, step = 0.025, bandLabel = "Columns {first} – {last}", partFooter = "Part {part} of {parts}" } = options;
  let splitZoom = options.splitZoom ?? 1;

  const table = doc.querySelector<HTMLTableElement>(PRINT_TABLE_SELECTOR);
  if (!table) return { zoom: 1, overflow: false, bands: 1 };
  const available = doc.body.clientWidth;

  if (layout === "fit") {
    const r = shrinkToFit(table, available, minZoom, step);
    if (!r.overflow) return { ...r, bands: 1 };
    // Too wide even at minZoom: fall through to splitting at minZoom.
    splitZoom = minZoom;
  }
  return splitIntoBands(doc, table, available, { zoom: splitZoom, repeatColumns, bandLabel, partFooter });
}

// ---------------------------------------------------------------------------

function setZoom(el: HTMLElement, zoom: number): void {
  // `zoom` (not transform: scale) — it reflows layout and pagination; Chromium-only, which is all
  // Summit targets.
  el.style.setProperty("zoom", String(zoom));
}

function overflows(table: HTMLTableElement, available: number): boolean {
  if (table.getBoundingClientRect().width > available + 1) return true;
  // Fixed-layout tables clip inside cells instead of growing, so the table-width check alone misses it.
  const cells = Array.from(table.querySelectorAll<HTMLElement>("th, td"));
  return cells.some((c) => c.scrollWidth > c.clientWidth + 1);
}

function shrinkToFit(table: HTMLTableElement, available: number, minZoom: number, step: number): { zoom: number; overflow: boolean } {
  let zoom = 1;
  setZoom(table, 1);
  const w = table.getBoundingClientRect().width;
  if (w > available) zoom = Math.max(minZoom, Math.floor((available / w) * 1000) / 1000);
  setZoom(table, zoom);
  while (overflows(table, available) && zoom > minZoom) {
    zoom = Math.max(minZoom, Math.round((zoom - step) * 1000) / 1000);
    setZoom(table, zoom);
  }
  return { zoom, overflow: overflows(table, available) };
}

// ---------------------------------------------------------------------------
// Column banding
// ---------------------------------------------------------------------------

interface BandOptions {
  zoom: number;
  repeatColumns: number;
  bandLabel: string;
  partFooter: string;
}

function splitIntoBands(doc: Document, original: HTMLTableElement, available: number, { zoom, repeatColumns, bandLabel, partFooter }: BandOptions): LayoutResult {
  // Fixed % widths suit one-page layouts; for bands let each column size to its content so wide
  // columns get the room and narrow ones don't waste it.
  original.querySelector("colgroup")?.remove();
  original.classList.remove("summit-print-fixed");

  const total = columnCount(original);
  const repeat = Math.min(repeatColumns, total - 1);
  const data = range(repeat, total); // columns that get split
  const fixed = range(0, repeat); // columns repeated on each band
  const host = original.parentElement as HTMLElement;
  const probe = doc.createElement("div");
  host.appendChild(probe);

  // Try 1, 2, 3 … bands (balanced sizes) until every band fits.
  let chosen: number[][] | null = null;
  for (let n = 1; n <= data.length && !chosen; n++) {
    const groups = balance(data, n);
    const ok = groups.every((g) => {
      const t = sliceColumns(original, fixed.concat(g));
      setZoom(t, zoom);
      probe.replaceChildren(t);
      return !overflows(t, available);
    });
    if (ok) chosen = groups;
  }
  probe.remove();
  const overflow = !chosen;
  if (!chosen) chosen = data.map((c) => [c]); // best effort: one column per band

  if (chosen.length === 1) {
    setZoom(original, zoom);
    return { zoom, overflow, bands: 1 };
  }

  const headers = headerLabels(original, total);
  const frag = doc.createDocumentFragment();
  const bandCount = chosen.length;
  chosen.forEach((g, i) => {
    const section = doc.createElement("section");
    section.className = "summit-print-band";
    section.style.setProperty("page", `summit-band-${i + 1}`);
    const label = doc.createElement("div");
    label.className = "summit-print-band-label";
    const first = headers[g[0]];
    const last = headers[g[g.length - 1]];
    const cols = first === last ? bandLabel.replace(/\{first\}.*\{last\}/, first) : bandLabel.replace("{first}", first).replace("{last}", last);
    label.textContent = `Part ${i + 1} of ${bandCount}  ·  ${cols}`;
    const t = sliceColumns(original, fixed.concat(g));
    setZoom(t, zoom);
    section.append(label, t);
    frag.appendChild(section);
  });
  original.replaceWith(frag);
  // Keep the first-page header on part 1's page (named pages force a break between
  // differently-named content, which would otherwise strand the header alone on page 1).
  const header = doc.querySelector(".summit-print-header");
  const firstBand = doc.querySelector(".summit-print-band");
  if (header && firstBand) firstBand.prepend(header);

  // Per-band footer ("Part 2 of 3") using named pages.
  const style = doc.createElement("style");
  style.textContent = !partFooter
    ? ""
    : chosen
        .map(
          (_, i) => `@page summit-band-${i + 1} {
  @bottom-center {
    content: ${cssContent(partFooter.replace(/\{part\}/g, String(i + 1)).replace(/\{parts\}/g, String(bandCount)))};
    font: ${FOOTER_FONT}; color: #555;
    vertical-align: middle;
  }
}`,
        )
        .join("\n");
  doc.head.appendChild(style);
  doc.documentElement.dataset.summitPrintBands = String(bandCount);
  return { zoom, overflow, bands: bandCount };
}

/** Copy of `table` containing only the given logical column indexes. */
export function sliceColumns(table: HTMLTableElement, keep: number[]): HTMLTableElement {
  const t = table.cloneNode(true) as HTMLTableElement;
  const sections = [t.tHead, t.tFoot].concat(Array.from(t.tBodies)).filter((s): s is HTMLTableSectionElement => !!s);
  for (const sec of sections) {
    for (const { cell, col, span } of cellGrid(sec)) {
      let n = 0;
      for (let c = col; c < col + span; c++) if (keep.indexOf(c) !== -1) n++;
      if (n === 0) cell.remove();
      else if (span > 1) cell.colSpan = n;
    }
  }
  const cg = t.querySelector("colgroup");
  if (cg) {
    Array.from(cg.children).forEach((c, i) => {
      if (keep.indexOf(i) === -1) c.remove();
    });
    const kept = Array.from(cg.children) as HTMLElement[];
    const pcts = kept.map((c) => parseFloat(c.style.width));
    if (kept.length > 0 && pcts.every((p) => p > 0) && kept[0].style.width.endsWith("%")) {
      const sum = pcts.reduce((a, b) => a + b, 0);
      kept.forEach((c, i) => {
        c.style.width = ((pcts[i] / sum) * 100).toFixed(3) + "%";
      });
    }
  }
  return t;
}

export interface GridCell {
  cell: HTMLTableCellElement;
  col: number;
  span: number;
}

/** Every cell with its starting logical column, honouring rowspan/colspan. */
export function cellGrid(section: HTMLTableSectionElement): GridCell[] {
  const occupied: boolean[][] = [];
  const out: GridCell[] = [];
  Array.from(section.rows).forEach((tr, r) => {
    occupied[r] = occupied[r] || [];
    let c = 0;
    for (const cell of Array.from(tr.cells)) {
      while (occupied[r][c]) c++;
      const rs = cell.rowSpan || 1;
      const cs = cell.colSpan || 1;
      for (let i = 0; i < rs; i++) {
        occupied[r + i] = occupied[r + i] || [];
        for (let j = 0; j < cs; j++) occupied[r + i][c + j] = true;
      }
      out.push({ cell, col: c, span: cs });
      c += cs;
    }
  });
  return out;
}

export function columnCount(table: HTMLTableElement): number {
  const sec = table.tHead || table.tBodies[0];
  if (!sec) return 0;
  let max = 0;
  for (const { col, span } of cellGrid(sec)) max = Math.max(max, col + span);
  return max;
}

/** Text of the bottom-most header cell over each column (for band labels). */
function headerLabels(table: HTMLTableElement, total: number): string[] {
  const labels = range(0, total).map((i) => String(i + 1));
  if (!table.tHead) return labels;
  for (const { cell, col, span } of cellGrid(table.tHead)) {
    for (let c = col; c < col + span; c++) labels[c] = (cell.textContent ?? "").trim().replace(/\s+/g, " ");
  }
  return labels;
}

function balance(items: number[], n: number): number[][] {
  const out: number[][] = [];
  let start = 0;
  for (let i = 0; i < n; i++) {
    const size = Math.ceil((items.length - start) / (n - i));
    out.push(items.slice(start, start + size));
    start += size;
  }
  return out;
}

/** Template -> CSS `content` value, turning {page}/{pages} into live page counters. */
export function cssContent(template: string): string {
  const str = (x: string) => '"' + x.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\A ") + '"';
  const parts = String(template)
    .split(/(\{pages?\})/)
    .filter(Boolean);
  return parts.map((p) => (p === "{page}" ? "counter(page)" : p === "{pages}" ? "counter(pages)" : str(p))).join(" ") || '""';
}

function range(a: number, b: number): number[] {
  return Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
}
