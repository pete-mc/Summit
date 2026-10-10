/**
 * Borrows Terrain's own Nunito Sans for the print document (user decision, .claude/Print/PLAN.md
 * "Print font").
 *
 * The print document is a separate document, so Terrain's @font-face rules don't reach it —
 * naming `NunitoSans-regular` there (as printWorksheets.ts does) silently falls back to Arial.
 * This copies the rules across at print time.
 *
 * Terrain declares each weight as a SEPARATE family, every one at font-weight 400 (captured CSS,
 * docs/terrain.scouts.com.au/_nuxt/css/0131ac3.css):
 *   NunitoSans-regular, NunitoSans-semibold, NunitoSans-bold (plus light/extralight)
 * Copying them verbatim would mean every bold rule in the print CSS has to name a different
 * family, and a plain `font-weight: 600` would fake-bold the regular face. Instead each file is
 * re-declared under ONE family, SummitPrintSans, at its real weight — so ordinary font-weight
 * rules pick the true face.
 *
 * Terrain's font URLs are root-relative (/_nuxt/fonts/…) and content-hashed, so they are resolved
 * against the stylesheet's own URL rather than hard-coded; if Terrain renames or drops them the
 * print falls back to Arial and logs a warning, and printing still works.
 */

import { createLogger } from "@/helpers/Logger";

const logger = createLogger("summit-print");

export const PRINT_FONT_FAMILY = "SummitPrintSans";

/** Terrain family name (lower-cased) -> the weight it is re-declared at. */
const TERRAIN_FAMILY_WEIGHTS: Record<string, number> = {
  "nunitosans-regular": 400,
  "nunitosans-semibold": 600,
  "nunitosans-bold": 700,
};

export interface FoundFontFace {
  family: string;
  src: string;
  /** URL the src's relative url()s resolve against — the stylesheet's own href. */
  base: string;
}

export function unquote(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

/** Rewrite every url(...) in a @font-face src to an absolute URL. Unparseable URLs are left as-is. */
export function absolutiseFontSrc(src: string, base: string): string {
  return src.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, _quote: string, url: string) => {
    try {
      return `url("${new URL(url, base).href}")`;
    } catch {
      return match;
    }
  });
}

/** The re-declared @font-face rules for the faces Summit prints with, or "" if none were found. */
export function buildPrintFontFaces(faces: FoundFontFace[]): string {
  const rules: string[] = [];
  const used: number[] = [];
  for (const face of faces) {
    const weight = TERRAIN_FAMILY_WEIGHTS[unquote(face.family).toLowerCase()];
    if (weight === undefined || used.indexOf(weight) !== -1) continue;
    used.push(weight);
    rules.push(`@font-face {
  font-family: "${PRINT_FONT_FAMILY}";
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: ${absolutiseFontSrc(face.src, face.base)};
}`);
  }
  return rules.join("\n");
}

/** The weights buildPrintFontFaces() declared — so the caller can wait for exactly those to load. */
export function declaredPrintWeights(css: string): number[] {
  const weights: number[] = [];
  const re = /font-weight:\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) weights.push(Number(m[1]));
  return weights;
}

/** Walk the live page's stylesheets for Terrain's Nunito Sans @font-face rules. */
export function findTerrainFontFaces(doc: Document = document): FoundFontFace[] {
  const found: FoundFontFace[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // throws for cross-origin sheets — those can't be Terrain's own fonts anyway
    } catch {
      continue;
    }
    const base = sheet.href || doc.baseURI;
    for (const rule of Array.from(rules)) {
      if (rule.type !== 5 /* CSSRule.FONT_FACE_RULE */) continue;
      const style = (rule as CSSFontFaceRule).style;
      const family = style.getPropertyValue("font-family");
      const src = style.getPropertyValue("src");
      if (family && src && /^nunitosans-/i.test(unquote(family))) found.push({ family, src, base });
    }
  }
  return found;
}

/** The @font-face CSS to put in the print document. Logs once and returns "" if Terrain's fonts aren't found. */
export function collectPrintFontCss(doc: Document = document): string {
  const css = buildPrintFontFaces(findTerrainFontFaces(doc));
  if (!css) logger.warn("Terrain's Nunito Sans fonts were not found; printing in Arial.");
  return css;
}
