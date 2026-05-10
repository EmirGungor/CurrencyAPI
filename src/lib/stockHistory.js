// Stock price history.
// - BIST: İş Yatırım HisseTekil endpoint via /api/bist-history (we fetch direct here).
// - US (NASDAQ/SP500): Yahoo Finance chart via /api/yfinance-chart proxy.

const RANGE_TO_DAYS = {
  "1d": 1,
  "1w": 7,
  "1m": 30,
  "3m": 90,
  "1y": 365,
};

const RANGE_TO_YAHOO = {
  "1d": { range: "1d", interval: "5m" },
  "1w": { range: "5d", interval: "30m" },
  "1m": { range: "1mo", interval: "1d" },
  "3m": { range: "3mo", interval: "1d" },
  "1y": { range: "1y", interval: "1wk" },
};

const RANGE_TO_NASDAQ_DAYS = {
  "1d": 5,
  "1w": 12,
  "1m": 35,
  "3m": 100,
  "1y": 380,
};

function fmtDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

// İş Yatırım has CORS issues from browser, so we proxy through Vite/Vercel.
// Wraps it in /api/bist-history?symbol=THYAO&days=N — we'll add this endpoint to vite.config.js + api/.
export async function fetchBistStockHistory(symbol, range = "1m") {
  const days = RANGE_TO_DAYS[range] ?? 30;
  const r = await fetch(`/api/bist-history?symbol=${encodeURIComponent(symbol)}&days=${days}`);
  if (!r.ok) throw new Error(`bist-history ${r.status}`);
  const data = await r.json();
  return (data?.points || []).map((p) => ({ date: p.date, value: p.value }));
}

// US stock history via NASDAQ.com (works without auth, has CORS via proxy).
export async function fetchUsStockHistory(symbol, range = "1m") {
  const days = RANGE_TO_NASDAQ_DAYS[range] ?? 35;
  const r = await fetch(`/api/nasdaq?symbol=${encodeURIComponent(symbol)}&kind=history&days=${days}`);
  if (!r.ok) throw new Error(`nasdaq-history ${r.status}`);
  const data = await r.json();
  const rows = data?.data?.tradesTable?.rows || [];
  return rows
    .map((row) => {
      // Date format: "MM/DD/YYYY"
      const [mm, dd, yyyy] = String(row.date || "").split("/");
      const value = parseFloat(String(row.close || "").replace(/[$,]/g, ""));
      return Number.isFinite(value) && yyyy
        ? { date: `${yyyy}-${mm}-${dd}`, value }
        : null;
    })
    .filter(Boolean)
    // NASDAQ returns newest-first; chart wants oldest→newest
    .reverse();
}
