// Vercel serverless function: NASDAQ.com proxy.
// Usage: GET /api/nasdaq?symbol=AAPL&kind=quote
//        GET /api/nasdaq?symbol=AAPL&kind=history&days=30
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || "").toUpperCase();
  const kind = String(req.query?.kind || "quote");
  const days = parseInt(req.query?.days || "30", 10);
  if (!symbol) return res.status(400).json({ error: "missing symbol" });

  const norm = symbol.replace(/-/g, ".");
  let upstream;
  if (kind === "history") {
    const today = new Date();
    const past = new Date(today);
    past.setDate(past.getDate() - days);
    const fmt = (d) => d.toISOString().slice(0, 10);
    upstream = `https://api.nasdaq.com/api/quote/${encodeURIComponent(norm)}/historical?assetclass=stocks&fromdate=${fmt(past)}&todate=${fmt(today)}&limit=${days + 5}&timeframe=d1`;
  } else {
    upstream = `https://api.nasdaq.com/api/quote/${encodeURIComponent(norm)}/info?assetclass=stocks`;
  }
  try {
    const r = await fetch(upstream, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return res.status(r.status).json({ error: `upstream ${r.status}` });
    const body = await r.text();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("content-type", "application/json");
    return res.status(200).send(body);
  } catch {
    return res.status(502).json({ error: "upstream fetch failed" });
  }
}
