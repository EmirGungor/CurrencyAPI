// Last-known-good cache + health tracking for market data feeds.
// Wraps async fetchers so upstream outages don't blank the UI.

const CACHE_NS = "crental:dataCache:v1";
const HEALTH_NS = "crental:dataHealth:v1";
const MAX_ENTRIES = 200;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_NS) || "{}");
  } catch {
    return {};
  }
}
function writeCache(obj) {
  // Cap entries by recency to avoid quota exhaustion.
  const keys = Object.keys(obj);
  if (keys.length > MAX_ENTRIES) {
    const sorted = keys
      .map((k) => [k, obj[k]?.ts || 0])
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_ENTRIES);
    const trimmed = {};
    for (const [k] of sorted) trimmed[k] = obj[k];
    obj = trimmed;
  }
  try {
    localStorage.setItem(CACHE_NS, JSON.stringify(obj));
  } catch {
    // quota; bail
  }
}

export function cacheGet(key) {
  return readCache()[key];
}
export function cachePut(key, value) {
  const all = readCache();
  all[key] = { value, ts: Date.now() };
  writeCache(all);
}

export function reportHealth(feed, ok, err) {
  if (typeof localStorage === "undefined") return;
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(HEALTH_NS) || "{}");
  } catch {
    /* ignore */
  }
  all[feed] = { ok, ts: Date.now(), err: ok ? null : String(err || "").slice(0, 80) };
  try {
    localStorage.setItem(HEALTH_NS, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event("crental:data-health"));
  } catch {
    /* ignore */
  }
}
export function getHealth() {
  try {
    return JSON.parse(localStorage.getItem(HEALTH_NS) || "{}");
  } catch {
    return {};
  }
}

export async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...opts, signal: ac.signal });
    return r;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * withCache(key, fetcher, opts)
 *   - feed: short label for health indicator (e.g. "fx", "crypto", "bist")
 *   - freshMs: if cache newer than this, return immediately without network
 *   - staleMs: if fetcher fails, return cached value if newer than this (default 24h)
 *   - timeoutMs: fetcher abort time
 *
 * fetcher receives (signal). Throws on upstream failure.
 */
export async function withCache(key, fetcher, opts = {}) {
  const {
    feed = key.split(":")[0] || "data",
    freshMs = 0,
    staleMs = 24 * 60 * 60_000,
    timeoutMs = 8000,
  } = opts;

  const cached = cacheGet(key);
  const now = Date.now();
  if (cached && now - cached.ts < freshMs) {
    return cached.value;
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const value = await fetcher(ac.signal);
    cachePut(key, value);
    reportHealth(feed, true);
    return value;
  } catch (err) {
    reportHealth(feed, false, err);
    if (cached && now - cached.ts < staleMs) return cached.value;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
