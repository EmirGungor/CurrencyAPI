// Unified, resilient data feed for the 8 tile tickers + converter FX.
//
// Every feed: (1) seeds the tile instantly from the localStorage snapshot,
// (2) refreshes through a multi-source fallback chain, (3) persists each
// successful value. So a tile never blanks — even on a cold load with all
// upstreams down it shows the last-known price (with a "stale" hint), and
// closed markets always show their last close.
//
//   Crypto (BTC/ETH) → Binance WS (live) + REST chain Binance→OKX→Kraken
//   Indices          → CNBC batch (proxy) → Yahoo chart per-symbol (proxy)
//   Gold gram (TRY)  → Truncgil → derived from XAU/USD × USD/TRY
//   FX (converter)   → Frankfurter → open.er-api.com

import { subscribeTicker as binanceSub } from "./binanceWs";
import { loadSnapshot, saveSnapshot, fetchJsonRetry, firstOk } from "./cache";

// Build-time seed values — the absolute last-resort fallback so a brand-new
// visitor (empty localStorage) whose every upstream is down still sees a
// plausible number instead of a blank skeleton. Overwritten the instant any
// live value arrives. Refresh these occasionally; they only ever show in the
// rare all-sources-down + cold-cache case.
const SEED = {
  "crypto:BTCUSDT": { price: 65750, changePct: -1.2 },
  "crypto:ETHUSDT": { price: 1795, changePct: -1.6 },
  "gold:GRAMTRY": { price: 6875, changePct: 0.5 },
  "index:.XU100": { price: 14493, changePct: 0.3 },
  "index:.IXIC": { price: 26376, changePct: -1.1 },
  "index:.SPX": { price: 7511, changePct: -0.6 },
  "index:.DJI": { price: 51999, changePct: 0.6 },
  "index:.VIX": { price: 16.4, changePct: 1.4 },
};

// Returns the persisted snapshot, or the build-time seed if cache is empty.
export function seedOrSnapshot(key) {
  const snap = loadSnapshot(key);
  if (snap) return snap;
  const s = SEED[key];
  return s ? { price: s.price, changePct: s.changePct, ts: 0 } : null;
}

const num = (s) => {
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace(/[,%$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function parseTr(s) {
  if (typeof s !== "string") return null;
  let c = s.replace(/[^\d.,\-]/g, "");
  if (!c) return null;
  const lastComma = c.lastIndexOf(",");
  const lastDot = c.lastIndexOf(".");
  if (lastComma > lastDot) c = c.replace(/\./g, "").replace(",", ".");
  else c = c.replace(/,/g, "");
  const n = parseFloat(c);
  return Number.isFinite(n) ? n : null;
}

/* ============================================================
   CRYPTO — Binance WebSocket (live) + REST fallback chain
   ============================================================ */

async function cryptoBinance(sym) {
  // Try global, then data.binance.com (works where api.binance.com is geo-blocked / 451)
  for (const host of ["api.binance.com", "data-api.binance.vision"]) {
    const d = await fetchJsonRetry(`https://${host}/api/v3/ticker/24hr?symbol=${sym}`, { retries: 1 });
    if (d && d.lastPrice) {
      return { price: Number(d.lastPrice), changePct: Number(d.priceChangePercent) };
    }
  }
  return null;
}
async function cryptoOkx(sym) {
  const instId = sym.replace(/USDT$/, "-USDT").replace(/USD$/, "-USD");
  const d = await fetchJsonRetry(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`, { retries: 1 });
  const t = d?.data?.[0];
  if (!t) return null;
  const last = Number(t.last);
  const open = Number(t.open24h);
  if (!Number.isFinite(last)) return null;
  return { price: last, changePct: open ? ((last - open) / open) * 100 : null };
}
async function cryptoKraken(sym) {
  const pair = sym.replace("BTC", "XBT").replace(/USDT$/, "USD");
  const d = await fetchJsonRetry(`https://api.kraken.com/0/public/Ticker?pair=${pair}`, { retries: 1 });
  const res = d?.result;
  if (!res) return null;
  const k = Object.keys(res)[0];
  const t = res[k];
  if (!t?.c?.[0]) return null;
  const last = Number(t.c[0]);
  const open = Number(t.o);
  return { price: last, changePct: open ? ((last - open) / open) * 100 : null };
}

export function subscribeCrypto(binanceSymbol, cb) {
  const key = `crypto:${binanceSymbol}`;
  const snap = seedOrSnapshot(key);
  if (snap) cb({ price: snap.price, changePct: snap.changePct, ts: snap.ts });

  let lastChangePct = snap?.changePct ?? null;

  const restTick = async () => {
    const q = await firstOk([
      () => cryptoBinance(binanceSymbol),
      () => cryptoOkx(binanceSymbol),
      () => cryptoKraken(binanceSymbol),
    ]);
    if (q && Number.isFinite(q.price)) {
      if (Number.isFinite(q.changePct)) lastChangePct = q.changePct;
      saveSnapshot(key, { price: q.price, changePct: lastChangePct });
      cb({ price: q.price, changePct: lastChangePct, ts: Date.now() });
    }
  };
  restTick();
  const iv = setInterval(restTick, 30_000);

  // Live ticks (price + change% from @ticker stream)
  const unWs = binanceSub(binanceSymbol, (t) => {
    if (Number.isFinite(t.changePct)) lastChangePct = t.changePct;
    saveSnapshot(key, { price: t.close, changePct: lastChangePct });
    cb({ price: t.close, changePct: lastChangePct, ts: t.ts });
  });

  return () => {
    clearInterval(iv);
    unWs();
  };
}

/* ============================================================
   GOLD — gram price in TRY
   ============================================================ */

async function goldTruncgil() {
  const d = await fetchJsonRetry("https://finans.truncgil.com/today.json", { retries: 1 });
  const g = d?.["gram-altin"];
  if (!g) return null;
  const price = parseTr(g["Satış"]);
  if (!Number.isFinite(price)) return null;
  return { price, changePct: parseTr(g["Değişim"]) };
}
async function goldDerived() {
  // gram TRY = (XAU USD per oz / 31.1035 g) × USD/TRY
  const [xau, fx] = await Promise.all([
    fetchJsonRetry("https://api.gold-api.com/price/XAU", { retries: 1 }),
    fetchJsonRetry("https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY", { retries: 1 }),
  ]);
  const usdPerOz = num(xau?.price);
  const usdtry = num(fx?.rates?.TRY);
  if (!usdPerOz || !usdtry) return null;
  return { price: (usdPerOz / 31.1035) * usdtry, changePct: null };
}

export function subscribeGold(cb) {
  const key = "gold:GRAMTRY";
  const snap = seedOrSnapshot(key);
  if (snap) cb({ price: snap.price, changePct: snap.changePct, ts: snap.ts });

  let lastChangePct = snap?.changePct ?? null;
  const tick = async () => {
    const q = await firstOk([goldTruncgil, goldDerived]);
    if (q && Number.isFinite(q.price)) {
      if (Number.isFinite(q.changePct)) lastChangePct = q.changePct;
      saveSnapshot(key, { price: q.price, changePct: lastChangePct });
      cb({ price: q.price, changePct: lastChangePct, ts: Date.now() });
    }
  };
  tick();
  const iv = setInterval(tick, 60_000);
  return () => clearInterval(iv);
}

/* ============================================================
   INDICES — CNBC batch → Yahoo chart per-symbol (both via /api proxy)
   ============================================================ */

export const CNBC_SYMBOLS = {
  XU100: ".XU100",
  IXIC: ".IXIC",
  GSPC: ".SPX",
  DJI: ".DJI",
  VIX: ".VIX",
};

const YAHOO_MAP = {
  ".XU100": "XU100.IS",
  ".IXIC": "^IXIC",
  ".SPX": "^GSPC",
  ".DJI": "^DJI",
  ".VIX": "^VIX",
};

let indexCache = { results: {}, ts: 0 };
const indexSubs = new Set();
let indexTimer = null;

async function indicesCnbc(symbols) {
  const d = await fetchJsonRetry(`/api/cnbc-quote?symbols=${encodeURIComponent(symbols.join("|"))}`, { retries: 1 });
  const list = d?.FormattedQuoteResult?.FormattedQuote;
  if (!Array.isArray(list) || !list.length) return null;
  const map = {};
  for (const q of list) {
    const price = num(q.last);
    if (q.symbol && price != null) {
      map[q.symbol] = { price, changePct: num(q.change_pct), ts: Date.now() };
    }
  }
  return Object.keys(map).length ? map : null;
}

async function indicesYahoo(symbols) {
  const map = {};
  await Promise.all(
    symbols.map(async (cnbcSym) => {
      const ysym = YAHOO_MAP[cnbcSym];
      if (!ysym) return;
      const d = await fetchJsonRetry(
        `/api/yfinance-chart?symbol=${encodeURIComponent(ysym)}&range=1d&interval=1d`,
        { retries: 0 }
      );
      const meta = d?.chart?.result?.[0]?.meta;
      const price = num(meta?.regularMarketPrice);
      if (price == null) return;
      const prev = num(meta?.chartPreviousClose) ?? num(meta?.previousClose);
      map[cnbcSym] = { price, changePct: prev ? ((price - prev) / prev) * 100 : null, ts: Date.now() };
    })
  );
  return Object.keys(map).length ? map : null;
}

async function fetchIndices() {
  const symbols = Object.values(CNBC_SYMBOLS);
  const map = await firstOk([() => indicesCnbc(symbols), () => indicesYahoo(symbols)]);
  if (!map) return;
  indexCache = { results: { ...indexCache.results, ...map }, ts: Date.now() };
  for (const [sym, v] of Object.entries(map)) {
    saveSnapshot(`index:${sym}`, { price: v.price, changePct: v.changePct });
  }
  for (const cb of indexSubs) {
    try { cb(indexCache.results); } catch { /* swallow */ }
  }
}

export function subscribeIndex(cnbcSymbol, cb) {
  const key = `index:${cnbcSymbol}`;
  const snap = seedOrSnapshot(key);
  if (snap) cb({ price: snap.price, changePct: snap.changePct, ts: snap.ts });

  const deliver = (map) => {
    const q = map[cnbcSymbol];
    if (q) cb({ price: q.price, changePct: q.changePct, ts: q.ts });
  };
  if (indexCache.ts > 0) deliver(indexCache.results);
  indexSubs.add(deliver);

  if (!indexTimer) {
    fetchIndices();
    indexTimer = setInterval(fetchIndices, 30_000);
  }
  return () => {
    indexSubs.delete(deliver);
    if (indexSubs.size === 0 && indexTimer) {
      clearInterval(indexTimer);
      indexTimer = null;
    }
  };
}

/* ============================================================
   FX (converter) — Frankfurter → open.er-api.com
   ============================================================ */

async function fxFrankfurter(from, to) {
  const d = await fetchJsonRetry(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`, { retries: 1 });
  return num(d?.rates?.[to]);
}
async function fxErApi(from, to) {
  const d = await fetchJsonRetry(`https://open.er-api.com/v6/latest/${from}`, { retries: 1 });
  return num(d?.rates?.[to]);
}

export async function fetchFxRate(from, to) {
  if (!from || !to || from === to) return 1;
  return await firstOk([() => fxFrankfurter(from, to), () => fxErApi(from, to)]);
}

export const FX_CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
];
