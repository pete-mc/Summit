/**
 * Gotcha: Terrain's @font-face rules don't reach a separate print document (it silently falls back to Arial),
 * so they're copied in at print time.
 * Gotcha: Terrain declares each weight as its own family at weight 400, so a plain `font-weight: 600` would
 * fake-bold. Each file is re-declared under one family, SummitPrintSans, at its real weight.
 * URLs are content-hashed, so they're resolved from the stylesheet; if they vanish, print falls back to Arial.
 */

import { createLogger } from "@/helpers/Logger";

const logger = createLogger("summit-print");

export const PRINT_FONT_FAMILY = "SummitPrintSans";

const TERRAIN_FAMILY_WEIGHTS: Record<string, number> = {
  "nunitosans-regular": 400,
  "nunitosans-semibold": 600,
  "nunitosans-bold": 700,
};

export interface FoundFontFace {
  family: string;
  src: string;
  base: string;
}

export function unquote(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

export function absolutiseFontSrc(src: string, base: string): string {
  return src.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, _quote: string, url: string) => {
    try {
      return `url("${new URL(url, base).href}")`;
    } catch {
      return match;
    }
  });
}

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

export function declaredPrintWeights(css: string): number[] {
  const weights: number[] = [];
  const re = /font-weight:\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) weights.push(Number(m[1]));
  return weights;
}

/** Layout measured before fonts load uses the wrong metrics. Capped, so a missing font can't hang the print. */
export async function waitForPrintFonts(doc: Document, weights: number[], timeoutMs = 4000): Promise<void> {
  if (!doc.fonts || weights.length === 0) return;
  // Gotcha: catch on the load itself, or a failure after the timeout wins is an unhandled rejection.
  const loaded = (async () => {
    await Promise.all(weights.map((w) => doc.fonts.load(`${w} 10pt "${PRINT_FONT_FAMILY}"`)));
    await doc.fonts.ready;
  })().catch((err) => logger.warn("Print fonts did not load; continuing with the fallback font.", err));
  await Promise.race([loaded, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}

export function findTerrainFontFaces(doc: Document = document): FoundFontFace[] {
  const found: FoundFontFace[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
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

export function collectPrintFontCss(doc: Document = document): string {
  const css = buildPrintFontFaces(findTerrainFontFaces(doc));
  if (!css) logger.warn("Terrain's Nunito Sans fonts were not found; printing in Arial.");
  return css;
}
