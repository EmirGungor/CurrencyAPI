// Unified data feed for the 8 tile tickers.
//   Crypto (BTC, ETH)  → Binance WebSocket (live ticks) + REST sparkline
//   Gold gram (₺)      → Truncgil today.json (free, CORS-friendly)
//   Indices (BIST 100, NASDAQ, S&P 500, Dow, VIX) → /api/yfinance (batch)
//
// Each ticker callback receives { price, changePct, sparkline?, ts }.

import { subscribeTicker as binanceSub } from "./binanceWs";

/* -------- Crypto live (WebSocket) -------- */

export function subscribeCrypto(binanceSymbol, cb) {
  // also seed initial spark + REST quote in case WS is slow to fire
  fetchBinanceQuote(binanceSymbol).then((q) => {
    if (q) cb({ price: q.close, changePct: q.changePct, ts: Date.now() });
  });
  fetchBinanceKlines(binanceSymbol).then((spark) => {
    if (spark) cb({ sparkline: spark });
  });
  return binanceSub(binanceSymbol, (t) => {
    cb({ price: t.close, changePct: t.changePct, ts: t.ts });
  });
}

async function fetchBinanceQuote(symbol) {
  try {
    const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    if (!r.ok) return null;
    const d = await r.json();
    return { close: parseFloat(d.lastPrice), changePct: parseFloat(d.priceChangePercent) };
  } catch {
    return null;
  }
}

async function fetchBinanceKlines(symbol, interval = "1h", limit = 24) {
  try {
    const r = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    if (!r.ok) return null;
    const data = await r.json();
    return data.map((k) => parseFloat(k[4]));
  } catch {
    return null;
  }
}

/* -------- Gold (Truncgil) -------- */

const TR_URL = "https://finans.truncgil.com/today.json";
let goldTimer = null;

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

export function subscribeGold(cb) {
  const tick = async () => {
    try {
      const r = await fetch(TR_URL);
      if (!r.ok) return;
      const data = await r.json();
      const gram = data["gram-altin"];
      if (!gram) return;
      cb({
        price: parseTr(gram["Satış"]),
        changePct: parseTr(gram["Değişim"]),
        ts: Date.now(),
      });
    } catch {
      /* swallow */
    }
  };
  tick();
  goldTimer = setInterval(tick, 60_000);
  return () => clearInterval(goldTimer);
}

/* -------- Indices (CNBC quote API) --------
   CNBC's public quote-html-webservice returns delayed but reliable data
   for major indices including BIST 100 (.XU100). One batched fetch / 30s. */

export const CNBC_SYMBOLS = {
  XU100: ".XU100",
  IXIC: ".IXIC",
  GSPC: ".SPX",
  DJI: ".DJI",
  VIX: ".VIX",
};

const num = (s) => {
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace(/[,%]/g, ""));
  return Number.isFinite(n) ? n : null;
};

let indexCache = { results: {}, ts: 0 };
let indexSubs = new Set();
let indexTimer = null;

async function fetchIndices() {
  const symbols = Object.values(CNBC_SYMBOLS).join("|");
  try {
    const r = await fetch(`/api/cnbc-quote?symbols=${encodeURIComponent(symbols)}`);
    if (!r.ok) return;
    const data = await r.json();
    const list = data?.FormattedQuoteResult?.FormattedQuote || [];
    const map = {};
    for (const q of list) {
      const sym = q.symbol;
      const price = num(q.last);
      const changePct = num(q.change_pct);
      if (!sym || price == null) continue;
      map[sym] = { price, changePct, ts: Date.now() };
    }
    indexCache = { results: map, ts: Date.now() };
    for (const cb of indexSubs) {
      try { cb(map); } catch {}
    }
  } catch {
    /* swallow */
  }
}

export function subscribeIndex(cnbcSymbol, cb) {
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

/* -------- FX (Frankfurter) for converter -------- */

export async function fetchFxRate(from, to) {
  if (!from || !to || from === to) return 1;
  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.rates?.[to] ?? null;
  } catch {
    return null;
  }
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
