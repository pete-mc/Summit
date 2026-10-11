/**
 * Can this browser print summit-print's footers? (.claude/Print/PLAN_STAGE_3.md)
 *
 * Footers are CSS page-margin boxes (@page { @bottom-left { … } }), which only Chromium 131+
 * supports. Anything else silently prints no footer, so it gets the in-table fallback instead
 * (a repeating <tfoot>). An unrecognised browser also gets the fallback: assuming support could
 * print footer-less pages without anyone noticing, whereas the fallback always prints something.
 */
export const MIN_MARGIN_BOX_CHROMIUM = 131;

/** DevTools test switch — the user's own Edge is current, so the fallback can't otherwise be seen. */
export const FOOTER_FALLBACK_KEY = "summit.print.footerFallback";

export type FooterMode = "margin-box" | "table";

interface UserAgentBrand {
  brand: string;
  version: string;
}

interface NavigatorLike {
  userAgent: string;
  userAgentData?: { brands?: UserAgentBrand[] };
}

/** Chromium major version, or null when the browser isn't Chromium (Firefox, Safari) or can't be told. */
export function chromiumMajorVersion(nav: NavigatorLike = navigator as NavigatorLike): number | null {
  const brand = (nav.userAgentData?.brands || []).filter((b) => b.brand === "Chromium")[0];
  if (brand) {
    const v = parseInt(brand.version, 10);
    if (!isNaN(v)) return v;
  }
  // Edge's user agent carries "Chrome/NNN" as well as "Edg/NNN".
  const match = /\bChrom(?:e|ium)\/(\d+)/.exec(nav.userAgent || "");
  return match ? parseInt(match[1], 10) : null;
}

export function isFooterFallbackForced(): boolean {
  try {
    return window.localStorage.getItem(FOOTER_FALLBACK_KEY) === "force";
  } catch {
    return false;
  }
}

export function footerMode(nav: NavigatorLike = navigator as NavigatorLike): FooterMode {
  if (isFooterFallbackForced()) return "table";
  const version = chromiumMajorVersion(nav);
  return version !== null && version >= MIN_MARGIN_BOX_CHROMIUM ? "margin-box" : "table";
}

/** True only when the browser genuinely can't do footers — not when the fallback was forced for testing. */
export function browserLacksFooterSupport(nav: NavigatorLike = navigator as NavigatorLike): boolean {
  const version = chromiumMajorVersion(nav);
  return version === null || version < MIN_MARGIN_BOX_CHROMIUM;
}
