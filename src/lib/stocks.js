// Stock data helpers — Stooq for US (works server-to-server), Yahoo for BIST (works in prod).

export const NASDAQ_TOP = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AVGO", name: "Broadcom" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "AMD", name: "AMD" },
];

// S&P 500 top non-tech / blue chip names (avoid pure overlap with NASDAQ list above)
export const SP500_TOP = [
  { symbol: "BRK-B", name: "Berkshire" },
  { symbol: "JPM", name: "JPMorgan" },
  { symbol: "LLY", name: "Eli Lilly" },
  { symbol: "V", name: "Visa" },
  { symbol: "JNJ", name: "Johnson & J" },
  { symbol: "WMT", name: "Walmart" },
  { symbol: "PG", name: "P&G" },
  { symbol: "XOM", name: "Exxon" },
  { symbol: "MA", name: "Mastercard" },
  { symbol: "HD", name: "Home Depot" },
];

// BIST 30 popular names — uses İş Yatırım codes (no suffix)
export const BIST_TOP = [
  { symbol: "THYAO", code: "THYAO", name: "Türk Hava Yolları" },
  { symbol: "GARAN", code: "GARAN", name: "Garanti BBVA" },
  { symbol: "AKBNK", code: "AKBNK", name: "Akbank" },
  { symbol: "ASELS", code: "ASELS", name: "Aselsan" },
  { symbol: "KCHOL", code: "KCHOL", name: "Koç Holding" },
  { symbol: "BIMAS", code: "BIMAS", name: "BİM Mağazaları" },
  { symbol: "EREGL", code: "EREGL", name: "Ereğli Demir Çelik" },
  { symbol: "TUPRS", code: "TUPRS", name: "Tüpraş" },
  { symbol: "FROTO", code: "FROTO", name: "Ford Otosan" },
  { symbol: "SISE", code: "SISE", name: "Şişecam" },
];

// Stooq: parse CSV → [{symbol, close, change, changePct}]
export async function fetchStooq(symbols) {
  const list = symbols.map((s) => `${s.toLowerCase()}.us`).join(",");
  const r = await fetch(`/api/stooq?symbols=${encodeURIComponent(list)}`);
  if (!r.ok) throw new Error(`stooq ${r.status}`);
  const text = await r.text();
  const lines = text.trim().split(/\r?\n/);
  const [header, ...rows] = lines;
  const cols = header.split(",");
  const idxSym = cols.indexOf("Symbol");
  const idxOpen = cols.indexOf("Open");
  const idxClose = cols.indexOf("Close");
  return rows
    .map((line) => {
      const parts = line.split(",");
      const sym = (parts[idxSym] || "").replace(/\.US$/, "");
      const open = parseFloat(parts[idxOpen]);
      const close = parseFloat(parts[idxClose]);
      if (!Number.isFinite(close)) return { symbol: sym, close: null };
      const change = Number.isFinite(open) ? close - open : null;
      const pct = Number.isFinite(open) && open !== 0 ? ((close - open) / open) * 100 : null;
      return { symbol: sym, close, change, changePct: pct };
    })
    .filter(Boolean);
}

// BIST: fetch quotes via İş Yatırım proxy (Yahoo-shaped response)
export async function fetchBistQuotes(symbols) {
  const list = symbols.join(",");
  const r = await fetch(`/api/bist?symbols=${encodeURIComponent(list)}`);
  if (!r.ok) throw new Error(`bist ${r.status}`);
  const data = await r.json();
  const rows = data?.quoteResponse?.result || [];
  return rows.map((q) => ({
    symbol: q.symbol,
    close: q.regularMarketPrice,
    change: q.regularMarketChange,
    changePct: q.regularMarketChangePercent,
  }));
}
