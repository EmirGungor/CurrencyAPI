// Vercel serverless function: Binance 24hr ticker batch.
// Usage: GET /api/binance-24hr?symbols=BTCUSDT,ETHUSDT
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req, res) {
  const symbols = String(req.query?.symbols || "").trim();
  if (!symbols) return res.status(400).json({ error: "missing symbols" });
  const arr = symbols.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  const param = encodeURIComponent(JSON.stringify(arr));
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${param}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return res.status(r.status).json({ error: `upstream ${r.status}` });
    const body = await r.text();
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=120");
    res.setHeader("content-type", "application/json");
    return res.status(200).send(body);
  } catch {
    return res.status(502).json({ error: "upstream fetch failed" });
  }
}
