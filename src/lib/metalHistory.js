// Gold history via Binance PAXG (PAX-Gold ≈ 1 troy oz spot gold).
// Pairs: PAXGUSDT (USD) and PAXGTRY (TRY). Free, CORS, very high rate-limits.

const RANGE_TO_BINANCE = {
  "1d": { interval: "15m", limit: 96 },
  "1w": { interval: "1h", limit: 168 },
  "1m": { interval: "4h", limit: 180 },
  "3m": { interval: "1d", limit: 90 },
  "1y": { interval: "1d", limit: 365 },
};

const TROY_OZ_TO_GRAM = 31.1035;

/**
 * @param {object} opts
 * @param {"oz"|"gram"} opts.unit
 * @param {string} opts.vs - "USD" or "TRY"
 * @param {string} opts.range
 */
export async function fetchGoldHistory({ unit = "oz", vs = "usd", range = "1m" }) {
  const cfg = RANGE_TO_BINANCE[range] || RANGE_TO_BINANCE["1m"];
  const quote = String(vs).toUpperCase();
  const symbol = quote === "TRY" ? "PAXGTRY" : "PAXGUSDT";
  const r = await fetch(
    `/api/binance-klines?symbol=${symbol}&interval=${cfg.interval}&limit=${cfg.limit}`
  );
  if (!r.ok) throw new Error(`binance ${r.status}`);
  const data = await r.json();
  const div = unit === "gram" ? TROY_OZ_TO_GRAM : 1;
  return (Array.isArray(data) ? data : [])
    .map((k) => ({
      ts: k[0],
      date: new Date(k[0]).toISOString().slice(0, 10),
      value: parseFloat(k[4]) / div,
    }))
    .filter((p) => Number.isFinite(p.value));
}
