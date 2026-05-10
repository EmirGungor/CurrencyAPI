// Vercel serverless function: TEFAS fund history proxy.
// Usage: GET /api/tefas?fonkod=AAK&days=30
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

export default async function handler(req, res) {
  const fonkod = String(req.query?.fonkod || "").toUpperCase();
  const days = parseInt(req.query?.days || "30", 10);
  if (!fonkod) return res.status(400).json({ error: "missing fonkod" });

  const today = new Date();
  const past = new Date(today);
  past.setDate(past.getDate() - days);
  const fmtTr = (d) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

  try {
    const r = await fetch("https://www.tefas.gov.tr/api/DB/BindHistoryInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": UA,
        "X-Requested-With": "XMLHttpRequest",
        Origin: "https://www.tefas.gov.tr",
        Referer: "https://www.tefas.gov.tr/TarihselVeriler.aspx",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      body: `fontip=YAT&sfontur=&fonkod=${encodeURIComponent(fonkod)}&fongrup=&bastarih=${fmtTr(past)}&bittarih=${fmtTr(today)}`,
    });
    const text = await r.text();
    if (!r.ok || text.includes('"fault"')) {
      return res.status(502).json({ error: "tefas_unavailable", upstream: r.status });
    }
    const data = JSON.parse(text);
    const rows = data?.data || [];
    const points = rows
      .map((row) => {
        const ms = Number(String(row.TARIH || "").replace(/[^0-9]/g, ""));
        const value = Number(row.FIYAT);
        if (!Number.isFinite(ms) || !Number.isFinite(value)) return null;
        return { date: new Date(ms).toISOString().slice(0, 10), value };
      })
      .filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date));
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    return res.status(200).json({ fonkod, points });
  } catch {
    return res.status(502).json({ error: "tefas_unavailable" });
  }
}
