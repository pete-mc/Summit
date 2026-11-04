/** Page-margin footers need Chromium 131+. Anything else, including an unknown browser, gets the <tfoot> fallback, which always prints. */
export const MIN_MARGIN_BOX_CHROMIUM = 131;

/** DevTools switch to force the fallback for testing. */
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

export function chromiumMajorVersion(nav: NavigatorLike = navigator as NavigatorLike): number | null {
  const brand = (nav.userAgentData?.brands || []).filter((b) => b.brand === "Chromium")[0];
  if (brand) {
    const v = parseInt(brand.version, 10);
    if (!isNaN(v)) return v;
  }
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

export function browserLacksFooterSupport(nav: NavigatorLike = navigator as NavigatorLike): boolean {
  const version = chromiumMajorVersion(nav);
  return version === null || version < MIN_MARGIN_BOX_CHROMIUM;
}
