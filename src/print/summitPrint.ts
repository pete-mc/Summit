/**
 * Print / Save-as-PDF: clone the live table into a hidden iframe at the printable width, fit or split
 * the columns, then window.print(). Nothing is screenshotted, so text stays sharp and headers repeat.
 */
import { BASE_PRINT_CSS } from "./printStyles";
import { layoutTable, cssContent, columnCount, type LayoutOptions, type LayoutResult, type PrintLayout } from "./printFit";
import { footerMode as detectFooterMode, type FooterMode } from "./printSupport";
import { collectPrintFontCss, declaredPrintWeights, PRINT_FONT_FAMILY, waitForPrintFonts } from "./printFonts";
import { createLogger } from "@/helpers/Logger";
import { SUMMIT_PRINT_PROFILES } from "./profiles";

export { layoutTable, cssContent, type LayoutResult, type PrintLayout };

const logger = createLogger("summit-print");

const MM_TO_PX = 96 / 25.4;

export type PageSize = "A4" | "A3" | "Letter" | "Legal";
export type Orientation = "portrait" | "landscape";
export type MarginPreset = "normal" | "narrow";
export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margins: MarginPreset;
  layout: PrintLayout;
}

export const PAGE_SIZES: Record<PageSize, [number, number]> = {
  A4: [210, 297],
  A3: [297, 420],
  Letter: [215.9, 279.4],
  Legal: [215.9, 355.6],
};

/** mm. The bottom margin leaves room for the footer. */
export const MARGIN_PRESETS: Record<MarginPreset, Margins> = {
  normal: { top: 12, right: 12, bottom: 14, left: 12 },
  narrow: { top: 7, right: 7, bottom: 10, left: 7 },
};

export interface MetaEntry {
  label: string;
  /** null removes an entry with this label (see mergeMeta). */
  value: string | null;
}

export interface PrintHeader {
  title?: string;
  subtitle?: string;
  meta?: MetaEntry[];
}

export interface PrintFooter {
  left?: string;
  center?: string;
  right?: string;
  part?: string;
}

export interface CopyComputedRule {
  selector: string;
  props: string[];
}

/** One per LOGICAL column (a colspan="3" header counts as 3). */
export type ColumnWidths = Array<number | string> | ((table: HTMLTableElement) => Array<number | string> | null);

export interface PrintProfile {
  name: string;
  tableSelector?: string;
  /** Scope every rule with .summit-print-profile-<name>. */
  css?: string;
  /** Copies computed SCREEN values onto the clone, matched by index. */
  copyComputed?: CopyComputedRule[];
  /** 'fit' only; split bands size to content. */
  columnWidths?: ColumnWidths | null;
  repeatColumns?: number;
  /** {first}/{last} = header text of the band's first/last column. */
  bandLabel?: string;
  /** Clone only, never the live table. Runs before columnWidths. */
  transform?: ((clone: HTMLTableElement, source: HTMLTableElement) => void) | null;
  stripTooltips?: boolean;
  /** The user's last choice per profile overrides these. */
  defaults?: Partial<PageSettings>;
  /** Below this zoom the table is split instead. */
  minZoom?: number;
  splitZoom?: number;
  header?: PrintHeader;
  footer?: PrintFooter;
  vars?: Record<string, string>;
}

interface ResolvedProfile {
  name: string;
  tableSelector: string;
  css: string;
  copyComputed: CopyComputedRule[];
  columnWidths: ColumnWidths | null;
  repeatColumns: number;
  bandLabel: string;
  transform: ((clone: HTMLTableElement, source: HTMLTableElement) => void) | null;
  stripTooltips: boolean;
  defaults: PageSettings;
  minZoom: number;
  splitZoom: number;
  header: PrintHeader;
  footer: PrintFooter;
  vars: Record<string, string>;
}

export interface PrintOptions {
  source: Element;
  profile?: string;
  pageSize?: PageSize;
  orientation?: Orientation;
  margins?: MarginPreset | Margins;
  layout?: PrintLayout;
  title?: string;
  subtitle?: string;
  meta?: MetaEntry[];
  header?: PrintHeader | string;
  footer?: PrintFooter | string;
  vars?: Record<string, string | undefined>;
  minZoom?: number;
  generated?: Date;
  logo?: string | null;
  fontCss?: string;
  /** Page-margin boxes need Chromium 131+; older browsers get a repeating <tfoot>. Detected when omitted. */
  footerMode?: FooterMode;
}

const DEFAULT_PAGE_SETTINGS: PageSettings = { pageSize: "A4", orientation: "landscape", margins: "normal", layout: "fit" };

const DEFAULT_PROFILE: ResolvedProfile = {
  name: "default",
  tableSelector: "table",
  css: "",
  copyComputed: [],
  columnWidths: null,
  repeatColumns: 1,
  bandLabel: "Columns {first} – {last}",
  transform: null,
  stripTooltips: true,
  defaults: DEFAULT_PAGE_SETTINGS,
  minZoom: 0.6,
  splitZoom: 1,
  header: {},
  footer: {},
  vars: {},
};

export const DEFAULT_HEADER: Required<PrintHeader> = {
  title: "{title}",
  subtitle: "{group} · {unit}",
  meta: [{ label: "Generated", value: "{generated}" }],
};
export const DEFAULT_FOOTER: Required<PrintFooter> = {
  left: "{title} · {unit}",
  center: "Generated {generated}",
  right: "Page {page} of {pages}",
  part: "Part {part} of {parts}",
};

const profiles: Record<string, ResolvedProfile> = { default: DEFAULT_PROFILE };

export function registerPrintProfile(profile: PrintProfile): void {
  profiles[profile.name] = {
    ...DEFAULT_PROFILE,
    ...profile,
    defaults: { ...DEFAULT_PROFILE.defaults, ...(profile.defaults || {}) },
    header: { ...(profile.header || {}) },
    footer: { ...(profile.footer || {}) },
    vars: { ...(profile.vars || {}) },
  } as ResolvedProfile;
}

// Registered from the list, not by import side effect (see profiles/index.ts).
SUMMIT_PRINT_PROFILES.forEach(registerPrintProfile);

export function getPrintProfile(name = "default"): ResolvedProfile {
  const p = profiles[name];
  if (!p) throw new Error(`summit-print: unknown profile "${name}"`);
  return p;
}

export interface ResolvedPage {
  width: number;
  height: number;
  margins: Margins;
  printableWidthPx: number;
}

export function resolvePage({ pageSize = "A4", orientation = "landscape", margins = "normal" }: { pageSize?: PageSize; orientation?: Orientation; margins?: MarginPreset | Margins } = {}): ResolvedPage {
  const dims = PAGE_SIZES[pageSize];
  if (!dims) throw new Error(`summit-print: unknown page size "${pageSize}"`);
  const [a, b] = dims;
  const width = orientation === "landscape" ? Math.max(a, b) : Math.min(a, b);
  const height = orientation === "landscape" ? Math.min(a, b) : Math.max(a, b);
  const m = typeof margins === "string" ? MARGIN_PRESETS[margins] : margins;
  if (!m) throw new Error(`summit-print: unknown margins "${String(margins)}"`);
  return {
    width,
    height,
    margins: m,
    printableWidthPx: Math.floor((width - m.left - m.right) * MM_TO_PX),
  };
}

function settingsFor(o: HeaderFooterOptions, profile: ResolvedProfile) {
  return {
    pageSize: o.pageSize ?? profile.defaults.pageSize,
    orientation: o.orientation ?? profile.defaults.orientation,
    margins: o.margins ?? profile.defaults.margins,
    layout: o.layout ?? profile.defaults.layout,
  };
}

const FOOTER_FONT = `7.5pt "${PRINT_FONT_FAMILY}", arial, sans-serif`;

export function buildPrintDocument(o: PrintOptions): string {
  const profile = getPrintProfile(o.profile);
  const opts = settingsFor(o, profile);
  const page = resolvePage(opts);

  const sourceTable = (o.source.matches("table") ? o.source : o.source.querySelector(profile.tableSelector)) as HTMLTableElement | null;
  if (!sourceTable) throw new Error("summit-print: no table found in source element");

  const table = sourceTable.cloneNode(true) as HTMLTableElement;
  // Gotcha: copyComputed matches elements BY INDEX, so it must run before anything adds or removes them.
  copyComputedStyles(sourceTable, table, profile.copyComputed);
  cleanClone(table, profile.stripTooltips);
  if (profile.transform) profile.transform(table, sourceTable);
  // After transform, so a removed column doesn't get a width.
  const widths = typeof profile.columnWidths === "function" ? profile.columnWidths(table) : profile.columnWidths;
  if (widths && widths.length) applyColumnWidths(table, widths);
  table.classList.add("summit-print-table", `summit-print-profile-${profile.name}`);

  const { header, footer } = resolveHeaderFooter(o);
  const mode = o.footerMode ?? "margin-box";
  if (mode === "table") appendFallbackFooter(table, footer);

  // Gotcha: leave the margin boxes out in fallback mode, or a forced fallback prints two footers.
  const slot = (name: string, text: string) =>
    text && mode === "margin-box"
      ? `
  @bottom-${name} {
    content: ${cssContent(text)};
    font: ${FOOTER_FONT}; color: #555;
    vertical-align: middle;
  }`
      : "";

  const pageCss = `
@page {
  size: ${page.width}mm ${page.height}mm;
  margin: ${page.margins.top}mm ${page.margins.right}mm ${page.margins.bottom}mm ${page.margins.left}mm;${slot("left", footer.left)}${slot("center", footer.center)}${slot("right", footer.right)}
}`;

  const logo = o.logo ? `<img class="summit-print-logo" src="${esc(o.logo)}" alt="">` : "";
  const meta = header.meta.length ? `<dl class="summit-print-meta">${header.meta.map((m) => `<div><dt>${esc(m.label)}:</dt><dd>${esc(m.value)}</dd></div>`).join("")}</dl>` : "";

  return `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8">
<title>${esc(header.title)}</title>
<style>${o.fontCss || ""}
${pageCss}
${BASE_PRINT_CSS}
${profile.css}</style>
</head><body class="summit-print-layout-${opts.layout === "split" ? "split" : "fit"}">
<header class="summit-print-header">
  ${logo}
  <div class="summit-print-header-text">
    ${header.title ? `<h1>${esc(header.title)}</h1>` : ""}
    ${header.subtitle ? `<div class="summit-print-subtitle">${esc(header.subtitle)}</div>` : ""}
    ${meta}
  </div>
</header>
<main>${table.outerHTML}</main>
</body></html>`;
}

/** Resolves when the dialog closes; the browser doesn't say whether the user printed or cancelled. */
export async function printTable(o: PrintOptions): Promise<LayoutResult> {
  const options: PrintOptions = { ...o, generated: o.generated ?? new Date(), fontCss: o.fontCss ?? collectPrintFontCss(document), footerMode: o.footerMode ?? detectFooterMode() };
  const html = buildPrintDocument(options);
  const { page, fit } = layoutOptions(options);
  return printViaSrcdoc(html, page, fit, declaredPrintWeights(options.fontCss || ""));
}

function makeHiddenFrame(widthPx: number): HTMLIFrameElement {
  const f = document.createElement("iframe");
  f.setAttribute("aria-hidden", "true");
  f.tabIndex = -1;
  Object.assign(f.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${widthPx}px`,
    height: "10px",
    border: "0",
    visibility: "hidden",
  });
  return f;
}

/** Gotcha: unloaded images can print blank. Capped so a dead URL can't hang the print. */
function waitForImages(doc: Document, timeoutMs = 4000): Promise<void> {
  const pending = Array.from(doc.images).filter((img) => !img.complete);
  if (!pending.length) return Promise.resolve();
  const loads = pending.map(
    (img) =>
      new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      }),
  );
  return Promise.race([Promise.all(loads).then(() => undefined), new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}

function printViaSrcdoc(html: string, page: ResolvedPage, fit: LayoutOptions, fontWeights: number[]): Promise<LayoutResult> {
  return new Promise((resolve, reject) => {
    const frame = makeHiddenFrame(page.printableWidthPx);
    frame.onload = async () => {
      try {
        const doc = frame.contentDocument as Document;
        const win = frame.contentWindow as Window;
        // Gotcha: the srcdoc iframe inherits Terrain's CSP, which could block the inline <style>. Fail loudly.
        const t = doc.querySelector("table.summit-print-table");
        if (t && win.getComputedStyle(t).borderCollapse !== "collapse") {
          throw new Error("print styles were blocked by the page's security policy (CSP)");
        }
        await waitForPrintFonts(doc, fontWeights);
        await waitForImages(doc);
        const result = layoutTable(doc, fit);
        const done = () => {
          frame.remove();
          resolve(result);
        };
        win.addEventListener("afterprint", () => setTimeout(done, 0), { once: true });
        win.focus();
        win.print();
      } catch (err) {
        frame.remove();
        reject(err);
      }
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

export function layoutOptions(o: PrintOptions): { page: ResolvedPage; fit: LayoutOptions } {
  const profile = getPrintProfile(o.profile);
  const opts = settingsFor(o, profile);
  return {
    page: resolvePage(opts),
    fit: {
      layout: opts.layout,
      minZoom: o.minZoom ?? profile.minZoom,
      splitZoom: profile.splitZoom,
      repeatColumns: profile.repeatColumns,
      bandLabel: profile.bandLabel,
      partFooter: resolveHeaderFooter(o).partFooter,
      footerMode: o.footerMode ?? "margin-box",
    },
  };
}

// Merge order (later wins): DEFAULT_HEADER/FOOTER → profile → per-print options.
// {page}/{pages} are live page counters (footer only); {part}/{parts} are filled per split part.

export interface ResolvedHeaderFooter {
  header: { title: string; subtitle: string; meta: Array<{ label: string; value: string }> };
  footer: { left: string; center: string; right: string };
  partFooter: string;
}

const KEPT_PLACEHOLDERS = ["page", "pages", "part", "parts"];

/** Lets the Excel export reuse the header wording without a table. */
export type HeaderFooterOptions = Omit<PrintOptions, "source">;

export function resolveHeaderFooter(o: HeaderFooterOptions): ResolvedHeaderFooter {
  const profile = getPrintProfile(o.profile);
  const opts = settingsFor(o, profile);
  const callHeader: PrintHeader = typeof o.header === "string" ? { title: o.header } : o.header || {};
  const callFooter: PrintFooter = typeof o.footer === "string" ? { left: o.footer } : o.footer || {};

  const when = o.generated ? new Date(o.generated) : new Date();
  const fmt = (x: Intl.DateTimeFormatOptions) => when.toLocaleString("en-AU", x);
  const vars: Record<string, string | undefined> = {
    title: "",
    subtitle: "",
    generated: fmt({ day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    date: fmt({ day: "2-digit", month: "2-digit", year: "numeric" }),
    time: fmt({ hour: "2-digit", minute: "2-digit" }),
    pageSize: opts.pageSize,
    orientation: opts.orientation,
    layout: opts.layout,
    profile: profile.name,
    ...profile.vars,
    ...(o.vars || {}),
  };

  // Unknown placeholders become '' and dangling separators are tidied: '{title} · {unit}' → '{title}'.
  const missing: string[] = [];
  const fill = (t: string | null | undefined): string =>
    String(t ?? "")
      .replace(/\{(\w+)\}/g, (m: string, k: string) => {
        if (KEPT_PLACEHOLDERS.indexOf(k) !== -1) return m;
        const v = vars[k];
        if (v != null && v !== "") return String(v);
        if (!(k in vars) && missing.indexOf(k) === -1) missing.push(k);
        return "";
      })
      .trim()
      .replace(/(\s+[·|–](?=\s))+/g, (m: string) => m.slice(0, m.search(/[·|–]/) + 1))
      .replace(/^[·|–]\s+|\s+[·|–]$/g, "");

  const h = {
    ...DEFAULT_HEADER,
    ...profile.header,
    ...(o.title != null ? { title: o.title } : {}),
    ...(o.subtitle != null ? { subtitle: o.subtitle } : {}),
    ...callHeader,
  };
  vars.title = fill(h.title.replace(/\{title\}/g, ""));
  vars.subtitle = fill(h.subtitle.replace(/\{subtitle\}/g, ""));
  const meta = mergeMeta(DEFAULT_HEADER.meta, profile.header.meta, callHeader.meta, o.meta)
    .map((m) => ({ label: fill(m.label), value: fill(m.value) }))
    .filter((m) => m.value !== "");

  const f = { ...DEFAULT_FOOTER, ...profile.footer, ...callFooter };
  const center = fill(f.center);
  const part = fill(f.part);
  const footer = { left: fill(f.left), center, right: fill(f.right) };
  const header = { title: fill(h.title), subtitle: fill(h.subtitle), meta };
  if (missing.length) logger.warn(`no value for {${missing.join("}, {")}} (pass them in vars)`);
  return {
    header,
    footer,
    partFooter: part ? (center ? `${center}  ·  ${part}` : part) : center,
  };
}

/** Later lists win, null removes, and new labels go before the trailing defaults ("Generated" stays last). */
export function mergeMeta(defaults: MetaEntry[], ...lists: Array<MetaEntry[] | undefined>): MetaEntry[] {
  const tailLabels = defaults.map((m) => m.label);
  const order: string[] = [];
  const values: Record<string, string | null> = {};
  for (const list of [defaults].concat(lists.filter((l): l is MetaEntry[] => !!l))) {
    for (const m of list) {
      if (!(m.label in values)) order.push(m.label);
      values[m.label] = m.value;
    }
  }
  const body = order.filter((l) => tailLabels.indexOf(l) === -1);
  const tail = order.filter((l) => tailLabels.indexOf(l) !== -1);
  return body
    .concat(tail)
    .filter((l) => values[l] != null)
    .map((l) => ({ label: l, value: values[l] }));
}

function copyComputedStyles(srcRoot: Element, cloneRoot: Element, rules: CopyComputedRule[]): void {
  for (const { selector, props } of rules) {
    const src = srcRoot.querySelectorAll(selector);
    const dst = cloneRoot.querySelectorAll<HTMLElement>(selector);
    const n = Math.min(src.length, dst.length);
    for (let i = 0; i < n; i++) {
      const cs = getComputedStyle(src[i]);
      for (const p of props) dst[i].style.setProperty(p, cs.getPropertyValue(p));
    }
  }
}

function cleanClone(table: HTMLTableElement, stripTooltips: boolean): void {
  const all = [table as Element].concat(Array.from(table.querySelectorAll("*")));
  for (const el of all) {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.indexOf("data-v-") === 0) el.removeAttribute(attr.name);
      else if (stripTooltips && attr.name === "title") el.removeAttribute("title");
    }
  }
  // Vuetify's empty <col>s would override our widths.
  Array.from(table.querySelectorAll("colgroup")).forEach((c) => c.remove());
}

export function hasPageCounter(text: string): boolean {
  return /\{pages?\}/.test(text);
}

/** Fallback footer: browsers repeat <tfoot> on every page. Slots with a page counter are left empty. */
function appendFallbackFooter(table: HTMLTableElement, footer: ResolvedHeaderFooter["footer"]): void {
  const doc = table.ownerDocument;
  const tfoot = table.createTFoot();
  tfoot.className = "summit-print-tfoot";
  const row = tfoot.insertRow();
  const cell = doc.createElement("td");
  cell.colSpan = Math.max(1, columnCount(table));
  const box = doc.createElement("div");
  box.className = "summit-print-foot";
  (["left", "center", "right"] as const).forEach((slot) => {
    const span = doc.createElement("span");
    span.className = `summit-print-foot-${slot}`;
    span.textContent = hasPageCounter(footer[slot]) ? "" : footer[slot];
    box.appendChild(span);
  });
  cell.appendChild(box);
  row.appendChild(cell);
}

function applyColumnWidths(table: HTMLTableElement, widths: Array<number | string>): void {
  const doc = table.ownerDocument;
  const cg = doc.createElement("colgroup");
  const nums = widths.map((w) => parseFloat(String(w)));
  const sum = nums.reduce((a, b) => a + b, 0);
  for (const n of nums) {
    const col = doc.createElement("col");
    col.style.width = ((n / sum) * 100).toFixed(3) + "%";
    cg.appendChild(col);
  }
  table.insertBefore(cg, table.firstChild);
  table.classList.add("summit-print-fixed");
}

function esc(s: string | null | undefined): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(s ?? "").replace(/[&<>"']/g, (c) => map[c]);
}
