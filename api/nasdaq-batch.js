// Vercel serverless function: parallel NASDAQ.com quote batch.
// Usage: GET /api/nasdaq-batch?symbols=AAPL,MSFT,NVDA
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const parsePrice = (s) => {
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const parsePct = (s) => {
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace(/[%+,]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default async function handler(req, res) {
  const symbols = String(req.query?.symbols || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (!symbols.length) return res.status(400).json({ error: "missing symbols" });

  const fetchOne = async (sym) => {
    try {
      const norm = sym.replace(/-/g, ".");
      const r = await fetch(
        `https://api.nasdaq.com/api/quote/${encodeURIComponent(norm)}/info?assetclass=stocks`,
        { headers: { "User-Agent": UA, Accept: "application/json" } }
      );
      if (!r.ok) return { symbol: sym, error: r.status };
      const data = await r.json();
      const p = data?.data?.primaryData || {};
      return {
        symbol: sym,
        close: parsePrice(p.lastSalePrice),
        change: parsePrice(p.netChange),
        changePct: parsePct(p.percentageChange),
        name: data?.data?.companyName || null,
      };
    } catch {
      return { symbol: sym, error: "fetch_failed" };
    }
  };
  try {
    const results = await Promise.all(symbols.map(fetchOne));
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({ results });
  } catch {
    return res.status(502).json({ error: "batch failed" });
  }
}
