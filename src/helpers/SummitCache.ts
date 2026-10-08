const CACHE_KEY_PREFIX = "summit.cache.";

interface CacheEntry<T> {
  cachedAt: number;
  value: T;
}

function cacheKey(key: string): string {
  return CACHE_KEY_PREFIX + key;
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

/**
 * Clears cache entries. With no filter, clears every Summit cache entry regardless of
 * feature. With a filter, each caller tests its own un-prefixed key (whatever shape it
 * chose when calling saveCached) rather than this module trying to parse every feature's
 * key format.
 */
export function clearCache(filter?: (key: string) => boolean): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(CACHE_KEY_PREFIX)) {
        continue;
      }
      if (filter && !filter(key.slice(CACHE_KEY_PREFIX.length))) {
        continue;
      }
      keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // local storage is best-effort only
  }
}
