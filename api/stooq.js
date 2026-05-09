// Vercel serverless function: Stooq CSV proxy.
// Usage: GET /api/stooq?symbols=aapl.us,msft.us,nvda.us
export default async function handler(req, res) {
  const { symbols = "" } = req.query || {};
  if (!symbols) return res.status(400).json({ error: "missing symbols" });

  // Stooq needs `+` as literal separator (not URL-encoded).
  const list = String(symbols).split(",").map((s) => s.trim()).join("+");
  const url = `https://stooq.com/q/l/?s=${list}&f=sd2t2ohlcvn&h&e=csv`;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/csv,*/*",
      },
    });
    if (!r.ok) return res.status(r.status).json({ error: `upstream ${r.status}` });
    const body = await r.text();
    res.setHeader("content-type", "text/csv");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).send(body);
  } catch {
    return res.status(502).json({ error: "upstream fetch failed" });
  }
}
