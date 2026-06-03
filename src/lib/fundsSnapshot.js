// Loads public/funds-snapshot.json (committed daily by GitHub Action).
// Frontend prefers this real NAV over the synthetic walk in funds.js.
//
// Shape:
//   { source, generated_at, trading_date, fund_count,
//     funds: { CODE: { price, date, market_cap?, number_of_shares?, number_of_investors? } } }

let cache = null;
let pending = null;

export async function loadFundsSnapshot() {
  if (cache) return cache;
  if (pending) return pending;
  pending = fetch("/funds-snapshot.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      cache = data || { funds: {} };
      pending = null;
      return cache;
    })
    .catch(() => {
      cache = { funds: {} };
      pending = null;
      return cache;
    });
  return pending;
}

/** Get last-known NAV for a fund (sync once snapshot loaded). */
export function getSnapshotPrice(code) {
  const entry = cache?.funds?.[code];
  return entry ? Number(entry.price) || null : null;
}

/** Snapshot metadata for UI badges. */
export function getSnapshotMeta() {
  if (!cache) return null;
  return {
    source: cache.source,
    generatedAt: cache.generated_at,
    tradingDate: cache.trading_date,
    fundCount: cache.fund_count || Object.keys(cache.funds || {}).length,
  };
}
