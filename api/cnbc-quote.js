// Vercel serverless function: CNBC quote JSON pass-through.
// Usage: GET /api/cnbc-quote?symbols=.IXIC|.SPX|.DJI|.VIX|.XU100
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36";

export default async function handler(req, res) {
  const symbols = String(req.query?.symbols || "");
  if (!symbols) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "missing symbols" }));
  }
  try {
    const r = await fetch(
      `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(symbols)}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json`,
      { headers: { "User-Agent": UA, Accept: "application/json" } }
    );
    const body = await r.text();
    res.setHeader("content-type", r.headers.get("content-type") || "application/json");
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=60");
    res.statusCode = r.status;
    return res.end(body);
  } catch {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: "cnbc_unavailable" }));
  }
}
