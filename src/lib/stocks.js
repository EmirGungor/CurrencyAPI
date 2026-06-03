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

import { withCache } from "./dataCache";

export async function fetchNasdaqQuotes(symbols) {
  const list = symbols.map((s) => s.toUpperCase()).join(",");
  const key = `us:quotes:${list}`;
  return withCache(
    key,
    async (signal) => {
      const r = await fetch(`/api/nasdaq-batch?symbols=${encodeURIComponent(list)}`, { signal });
      if (!r.ok) throw new Error(`nasdaq ${r.status}`);
      const data = await r.json();
      return (data?.results || []).filter((x) => x && !x.error);
    },
    { feed: "us", freshMs: 30_000 }
  );
}

export const fetchStooq = fetchNasdaqQuotes;

export async function fetchBistQuotes(symbols) {
  const list = symbols.join(",");
  const key = `bist:quotes:${list}`;
  return withCache(
    key,
    async (signal) => {
      const r = await fetch(`/api/bist?symbols=${encodeURIComponent(list)}`, { signal });
      if (!r.ok) throw new Error(`bist ${r.status}`);
      const data = await r.json();
      const rows = data?.quoteResponse?.result || [];
      return rows.map((q) => ({
        symbol: q.symbol,
        close: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePct: q.regularMarketChangePercent,
      }));
    },
    { feed: "bist", freshMs: 30_000 }
  );
}
