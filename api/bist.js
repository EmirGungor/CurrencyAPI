// Vercel serverless function: BIST quotes via İş Yatırım public API.
// Returns Yahoo-shaped response so the same client code works for both.
// Usage: GET /api/bist?symbols=THYAO,GARAN,AKBNK

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req, res) {
  const symbols = String(req.query?.symbols || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (!symbols.length) return res.status(400).json({ error: "missing symbols" });

  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - 8);
  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  const start = fmt(past);
  const end = fmt(today);

  try {
    const results = await Promise.all(
      symbols.map(async (sym) => {
        const url = `https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/HisseTekil?hisse=${encodeURIComponent(sym)}&startdate=${start}&enddate=${end}`;
        const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
        if (!r.ok) return { symbol: sym, error: `upstream ${r.status}` };
        const data = await r.json();
        const rows = data?.value || [];
        if (!rows.length) return { symbol: sym, regularMarketPrice: null };
        const last = rows[rows.length - 1];
        const prev = rows.length > 1 ? rows[rows.length - 2] : null;
        const close = Number(last?.HGDG_KAPANIS);
        const prevClose = prev ? Number(prev?.HGDG_KAPANIS) : null;
        const change = prevClose != null ? close - prevClose : null;
        const changePct =
          prevClose != null && prevClose !== 0 ? ((close - prevClose) / prevClose) * 100 : null;
        return {
          symbol: sym,
          regularMarketPrice: close,
          regularMarketChange: change,
          regularMarketChangePercent: changePct,
        };
      })
    );
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({ quoteResponse: { result: results } });
  } catch {
    return res.status(502).json({ error: "upstream fetch failed" });
  }
}
