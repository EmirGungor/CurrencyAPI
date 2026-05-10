// Vercel serverless function: Binance klines (OHLCV history).
// Usage: GET /api/binance-klines?symbol=BTCUSDT&interval=1d&limit=30
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || "").toUpperCase();
  const interval = String(req.query?.interval || "1d");
  const limit = parseInt(req.query?.limit || "30", 10);
  if (!symbol) return res.status(400).json({ error: "missing symbol" });
  const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return res.status(r.status).json({ error: `upstream ${r.status}` });
    const body = await r.text();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("content-type", "application/json");
    return res.status(200).send(body);
  } catch {
    return res.status(502).json({ error: "upstream fetch failed" });
  }
}
