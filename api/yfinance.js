// Vercel serverless function — proxies Yahoo Finance to bypass CORS in production.
// In dev, Vite's server.proxy handles `/yf` instead.
// Usage: GET /api/yfinance?symbols=XU100.IS,XU030.IS

export default async function handler(req, res) {
  const { symbols = "" } = req.query || {};
  if (!symbols) {
    return res.status(400).json({ error: "Missing 'symbols' query param" });
  }

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
    symbols
  )}`;

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
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Upstream fetch failed" });
  }
}
