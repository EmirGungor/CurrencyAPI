// Vercel serverless function: BIST single-symbol history via İş Yatırım.
// Usage: GET /api/bist-history?symbol=THYAO&days=30
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || "").toUpperCase();
  const days = parseInt(req.query?.days || "30", 10);
  if (!symbol) return res.status(400).json({ error: "missing symbol" });

  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - Math.max(2, days));
  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

  const url = `https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/HisseTekil?hisse=${encodeURIComponent(symbol)}&startdate=${fmt(past)}&enddate=${fmt(today)}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!r.ok) return res.status(r.status).json({ error: `upstream ${r.status}` });
    const data = await r.json();
    const rows = data?.value || [];
    const points = rows
      .map((row) => {
        const [dd, mm, yyyy] = String(row.HGDG_TARIH || "").split("-");
        return { date: `${yyyy}-${mm}-${dd}`, value: Number(row.HGDG_KAPANIS) };
      })
      .filter((p) => Number.isFinite(p.value));
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json({ symbol, points });
  } catch {
    return res.status(502).json({ error: "upstream fetch failed" });
  }
}
