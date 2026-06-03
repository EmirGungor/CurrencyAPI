// Portfolio storage + live-price resolver.
// Each portfolio: { id, name, target, hedef (₺), createdAt, color, assets[] }
// Each asset: { kind: 'fund'|'stock'|'crypto'|'metal', symbol, qty, avgCost, market? }

import { FUND_LIST, getFundLastPrice, setFundLastPrice } from "./funds";
import { fetchBistQuotes, fetchNasdaqQuotes } from "./stocks";
import { coinIdToBinance } from "./cryptoHistory";

const KEY = "crental:portfolios:v2";

const DEFAULTS = [
  {
    id: "p-fon",
    name: "Fon",
    target: "Genel",
    hedef: 1_000_000,
    createdAt: "2026-05-08",
    color: "#10b981",
    icon: "₺",
    assets: [
      { kind: "fund", symbol: "PHE", qty: 121885, avgCost: 2.871541 },
    ],
  },
];

// Seed known recent prices for the default-sample funds so cards aren't wildly off.
const SEED_FUND_PRICES = {
  PHE: 2.904405,
};
function seedFundPrices() {
  for (const [code, price] of Object.entries(SEED_FUND_PRICES)) {
    setFundLastPrice(code, price);
  }
}

export function getPortfolios() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(raw) && raw.length > 0) {
      seedFundPrices();
      return raw;
    }
  } catch {
    /* fall through */
  }
  // First load: seed with defaults so user sees a real example
  seedFundPrices();
  savePortfolios(DEFAULTS);
  return DEFAULTS;
}

export function savePortfolios(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

export function getPortfolio(id) {
  return getPortfolios().find((p) => p.id === id) || null;
}

export function upsertPortfolio(p) {
  const list = getPortfolios();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  savePortfolios(list);
}

export function deletePortfolio(id) {
  savePortfolios(getPortfolios().filter((p) => p.id !== id));
}

/* --- Transaction log + position upsert --- */
const TX_KEY = "crental:transactions:v1";

export function getTransactions(portfolioId) {
  try {
    const all = JSON.parse(localStorage.getItem(TX_KEY) || "[]");
    return portfolioId ? all.filter((t) => t.portfolioId === portfolioId) : all;
  } catch {
    return [];
  }
}

function saveTransactions(list) {
  try {
    localStorage.setItem(TX_KEY, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

/**
 * Add a transaction and update the portfolio's position(s).
 * tx: { portfolioId, type: 'buy'|'sell', kind, symbol, market?, vs?, qty, price, date, note? }
 * Recalculates avgCost via weighted average for buys; FIFO-ish for sells.
 */
export function addTransaction(portfolioId, tx) {
  const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const fullTx = {
    id: txId,
    portfolioId,
    type: tx.type || "buy",
    kind: tx.kind,
    symbol: String(tx.symbol || "").toUpperCase(),
    market: tx.market || null,
    vs: tx.vs || null,
    qty: Number(tx.qty) || 0,
    price: Number(tx.price) || 0,
    date: tx.date || new Date().toISOString().slice(0, 10),
    note: tx.note || "",
    createdAt: Date.now(),
  };
  const txs = getTransactions();
  txs.push(fullTx);
  saveTransactions(txs);

  // Update position
  const portfolios = getPortfolios();
  const p = portfolios.find((x) => x.id === portfolioId);
  if (!p) return fullTx;
  p.assets = p.assets || [];

  const matchKey = (a) =>
    a.kind === fullTx.kind &&
    a.symbol === fullTx.symbol &&
    (a.market || null) === fullTx.market;

  let pos = p.assets.find(matchKey);

  if (fullTx.type === "buy") {
    if (!pos) {
      pos = {
        kind: fullTx.kind,
        symbol: fullTx.symbol,
        market: fullTx.market || undefined,
        vs: fullTx.vs || undefined,
        qty: 0,
        avgCost: 0,
      };
      p.assets.push(pos);
    }
    const prevCost = pos.avgCost * pos.qty;
    const newCost = fullTx.price * fullTx.qty;
    const newQty = pos.qty + fullTx.qty;
    pos.qty = newQty;
    pos.avgCost = newQty > 0 ? (prevCost + newCost) / newQty : 0;
  } else {
    // sell
    if (pos) {
      pos.qty = Math.max(0, pos.qty - fullTx.qty);
      if (pos.qty === 0) {
        p.assets = p.assets.filter((a) => a !== pos);
      }
    }
  }

  savePortfolios(portfolios);
  return fullTx;
}

/* --- Live price resolution (synchronous, from caches) --- */

// In-memory live-price snapshot — updated by WS or REST.
const livePrices = new Map();

export function setLivePrice(key, price) {
  if (!Number.isFinite(price)) return;
  livePrices.set(key, { price, ts: Date.now() });
  try { window.dispatchEvent(new Event("crental:price-tick")); } catch { /* ignore */ }
}

export function getLivePrice(key) {
  return livePrices.get(key)?.price ?? null;
}

export function assetPriceKey(asset) {
  if (asset.kind === "crypto") return `crypto:${(asset.symbol || "").toUpperCase()}USDT`;
  if (asset.kind === "metal") return `metal:PAXG${(asset.vs || "TRY").toUpperCase()}`;
  if (asset.kind === "stock") return `stock:${asset.market || "us"}:${asset.symbol}`;
  if (asset.kind === "fund") return `fund:${asset.symbol}`;
  return null;
}

// Synchronous price lookup — uses WS cache if available, falls back to last-known.
export function resolveAssetPrice(asset) {
  const k = assetPriceKey(asset);
  if (!k) return null;
  const live = livePrices.get(k)?.price;
  if (Number.isFinite(live)) return live;

  // Fund fallback: snapshot price
  if (asset.kind === "fund") {
    const f = FUND_LIST.find((x) => x.code === asset.symbol);
    if (f) return getFundLastPrice(f);
  }
  return null;
}

// Hydrate stock + fund prices via REST (one batched call per kind).
// Returns { bist: Map<sym,price>, us: Map, fund: Map }
export async function hydrateRestPrices(portfolios) {
  const bistSyms = new Set();
  const usSyms = new Set();
  const fundSyms = new Set();
  for (const p of portfolios) {
    for (const a of p.assets || []) {
      if (a.kind === "stock" && a.market === "bist") bistSyms.add(a.symbol);
      else if (a.kind === "stock") usSyms.add(a.symbol);
      else if (a.kind === "fund") fundSyms.add(a.symbol);
    }
  }
  await Promise.all([
    bistSyms.size > 0
      ? fetchBistQuotes([...bistSyms])
          .then((rows) => {
            for (const r of rows) setLivePrice(`stock:bist:${r.symbol}`, r.close);
          })
          .catch(() => {})
      : Promise.resolve(),
    usSyms.size > 0
      ? fetchNasdaqQuotes([...usSyms])
          .then((rows) => {
            for (const r of rows) setLivePrice(`stock:us:${r.symbol}`, r.close);
          })
          .catch(() => {})
      : Promise.resolve(),
  ]);
  // Funds: use snapshot price as the live price
  for (const code of fundSyms) {
    const f = FUND_LIST.find((x) => x.code === code);
    if (f) setLivePrice(`fund:${code}`, getFundLastPrice(f));
  }
}

/* --- Portfolio stats computation --- */
export function computePortfolioStats(p) {
  let value = 0;
  let cost = 0;
  let dayChange = 0;
  const positions = [];
  for (const a of p.assets || []) {
    const price = resolveAssetPrice(a);
    const v = (price ?? 0) * (a.qty || 0);
    const c = (a.avgCost || 0) * (a.qty || 0);
    value += v;
    cost += c;
    // dayChange approximation: pulled from daily snapshot for funds, zero otherwise
    if (a.kind === "fund") {
      const f = FUND_LIST.find((x) => x.code === a.symbol);
      if (f && Number.isFinite(f.daily)) dayChange += (v * f.daily) / 100;
    }
    positions.push({
      ...a,
      price,
      value: v,
      cost: c,
      pnl: v - c,
      pnlPct: c > 0 ? ((v - c) / c) * 100 : 0,
    });
  }
  // Weight after total known
  for (const pos of positions) {
    pos.weight = value > 0 ? (pos.value / value) * 100 : 0;
  }
  positions.sort((a, b) => b.value - a.value);
  return {
    value,
    cost,
    pnl: value - cost,
    pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
    dayChange,
    dayChangePct: cost > 0 ? (dayChange / value) * 100 : 0,
    progress: p.hedef > 0 ? Math.min(100, (value / p.hedef) * 100) : 0,
    positions,
  };
}

export function summarizeAll(portfolios) {
  let value = 0;
  let cost = 0;
  let dayChange = 0;
  const byPortfolio = portfolios.map((p) => {
    const s = computePortfolioStats(p);
    value += s.value;
    cost += s.cost;
    dayChange += s.dayChange;
    return { p, s };
  });
  return {
    value,
    cost,
    pnl: value - cost,
    pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
    dayChange,
    dayChangePct: value > 0 ? (dayChange / value) * 100 : 0,
    byPortfolio,
  };
}

/* --- Display helpers --- */
export const fmtCurrency = (v, locale = "tr-TR", code = "TRY") => {
  if (!Number.isFinite(v)) return "—";
  const sym = code === "TRY" ? "₺" : code === "USD" ? "$" : code === "EUR" ? "€" : "";
  return `${sym}${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
export const fmtPct = (v) => {
  if (!Number.isFinite(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
};
