// Vercel serverless function — proxies Yahoo Finance chart endpoint.
// Used for sparklines / historical data.
// Usage: GET /api/yfinance-chart?symbol=XU100.IS&range=5d&interval=1d

export default async function handler(req, res) {
  const { symbol = "", range = "5d", interval = "1d" } = req.query || {};
  if (!symbol) {
    return res.status(400).json({ error: "Missing 'symbol' query param" });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `Upstream ${r.status}` });
    }
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Upstream fetch failed" });
  }
}
