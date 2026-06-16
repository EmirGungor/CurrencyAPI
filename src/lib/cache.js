// Per-ticker snapshot cache (localStorage) + resilient fetch helpers.
// Lets every tile render its last-known price INSTANTLY on cold load,
// even if every upstream API is down or the market is closed.

const NS = "crental:snap:v1";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(NS) || "{}");
  } catch {
    return {};
  }
}

function writeAll(obj) {
  try {
    localStorage.setItem(NS, JSON.stringify(obj));
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Load last cached snapshot for a key: { price, changePct, ts } | null */
export function loadSnapshot(key) {
  const all = readAll();
  const s = all[key];
  if (s && Number.isFinite(s.price)) return s;
  return null;
}

/** Persist a snapshot. Only writes when price is finite. */
export function saveSnapshot(key, { price, changePct }) {
  if (!Number.isFinite(price)) return;
  const all = readAll();
  all[key] = {
    price,
    changePct: Number.isFinite(changePct) ? changePct : (all[key]?.changePct ?? null),
    ts: Date.now(),
  };
  writeAll(all);
}

/* ---------------- resilient fetch ---------------- */

/** fetch with timeout (AbortController). */
export async function fetchWithTimeout(url, { timeout = 8000, ...opts } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

/** fetch JSON with retry + exponential backoff. Returns parsed JSON or null. */
export async function fetchJsonRetry(url, { retries = 2, backoff = 600, timeout = 8000, opts = {} } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetchWithTimeout(url, { timeout, ...opts });
      if (r.ok) return await r.json();
    } catch {
      /* network/timeout — fall through to retry */
    }
    if (attempt < retries) {
      await sleep(backoff * 2 ** attempt);
    }
  }
  return null;
}

/** fetch text with retry. Returns string or null. */
export async function fetchTextRetry(url, { retries = 2, backoff = 600, timeout = 8000, opts = {} } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetchWithTimeout(url, { timeout, ...opts });
      if (r.ok) return await r.text();
    } catch {
      /* retry */
    }
    if (attempt < retries) {
      await sleep(backoff * 2 ** attempt);
    }
  }
  return null;
}

/** Try a list of async source fns in order; return first non-null result. */
export async function firstOk(sourceFns) {
  for (const fn of sourceFns) {
    try {
      const v = await fn();
      if (v != null) return v;
    } catch {
      /* try next */
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
