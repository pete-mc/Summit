const OAS_CACHE_KEY_PREFIX = "summit.oas.cache.";

interface CacheEntry<T> {
  cachedAt: number;
  value: T;
}

function cacheKey(key: string): string {
  return OAS_CACHE_KEY_PREFIX + key;
}

export function saveCached<T>(key: string, value: T): void {
  try {
    const entry: CacheEntry<T> = { cachedAt: Date.now(), value };
    window.localStorage.setItem(cacheKey(key), JSON.stringify(entry));
  } catch {
    // local storage is best-effort only
  }
}

export function loadCached<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(key));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.cachedAt !== "number") {
      return null;
    }

    const entry = parsed as CacheEntry<T>;
    if (Date.now() - entry.cachedAt > maxAgeMs) {
      return null;
    }

    return entry.value;
  } catch {
    return null;
  }
}

export function clearCache(streamFilter?: string): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(OAS_CACHE_KEY_PREFIX)) {
        continue;
      }
      if (streamFilter) {
        const suffix = key.slice(OAS_CACHE_KEY_PREFIX.length);
        const segments = suffix.split(".");
        // "tree.{stream}" | "template.{stream}" | "achievements.{unitId}.{stream}.{branch}.{stage}"
        const streamSegment = segments[0] === "achievements" ? segments[2] : segments[1];
        if (streamSegment !== streamFilter) {
          continue;
        }
      }
      keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // local storage is best-effort only
  }
}
