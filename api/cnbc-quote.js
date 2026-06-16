// Vercel serverless function: CNBC quote JSON pass-through.
// Usage: GET /api/cnbc-quote?symbols=.IXIC|.SPX|.DJI|.VIX|.XU100
//
// CNBC sits behind Akamai which 403s requests that don't look like a real
// browser. We send a full browser header set to pass the bot filter.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36";

const BROWSER_HEADERS = {
  "User-Agent": UA,
  Accept: "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.cnbc.com/quotes/",
  Origin: "https://www.cnbc.com",
};

export default async function handler(req, res) {
  const symbols = String(req.query?.symbols || "");
  if (!symbols) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "missing symbols" }));
  }
  const url = `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(symbols)}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json`;
  try {
    const r = await fetch(url, { headers: BROWSER_HEADERS });
    const body = await r.text();
    // Akamai blocks return HTML; only forward JSON.
    if (!r.ok || body.trimStart().startsWith("<")) {
      res.statusCode = 502;
      res.setHeader("content-type", "application/json");
      return res.end(JSON.stringify({ error: "cnbc_blocked", upstream: r.status }));
    }
    res.setHeader("content-type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=120");
    res.statusCode = 200;
    return res.end(body);
  } catch {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: "cnbc_unavailable" }));
  }
}
