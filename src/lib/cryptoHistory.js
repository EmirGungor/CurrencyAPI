// Crypto history via Binance klines (free, no auth, CORS-friendly, very high rate limits).

const RANGE_TO_BINANCE = {
  "1d": { interval: "15m", limit: 96 },   // 24h × 4 / hour
  "1w": { interval: "1h", limit: 168 },   // 7 × 24
  "1m": { interval: "4h", limit: 180 },   // 30d × 6/day
  "3m": { interval: "1d", limit: 90 },
  "1y": { interval: "1d", limit: 365 },
};

// Lightweight coin → Binance symbol mapping (USD pair via USDT).
const COIN_TO_BINANCE = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
  dogecoin: "DOGEUSDT",
  "pax-gold": "PAXGUSDT",
};

export function coinIdToBinance(coinId) {
  return COIN_TO_BINANCE[coinId] || `${coinId.toUpperCase()}USDT`;
}

export async function fetchCryptoHistory(coinId, _vs = "usd", range = "1m") {
  const symbol = coinIdToBinance(coinId);
  const cfg = RANGE_TO_BINANCE[range] || RANGE_TO_BINANCE["1m"];
  const r = await fetch(
    `/api/binance-klines?symbol=${encodeURIComponent(symbol)}&interval=${cfg.interval}&limit=${cfg.limit}`
  );
  if (!r.ok) throw new Error(`binance ${r.status}`);
  const data = await r.json();
  // Klines: [openTime, open, high, low, close, volume, closeTime, ...]
  return (Array.isArray(data) ? data : [])
    .map((k) => ({
      ts: k[0],
      date: new Date(k[0]).toISOString().slice(0, 10),
      value: parseFloat(k[4]),
    }))
    .filter((p) => Number.isFinite(p.value));
}
