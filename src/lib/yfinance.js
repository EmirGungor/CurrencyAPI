// Yahoo Finance helper — uses Vite dev proxy in development, Vercel serverless in production.
// Both paths return the same Yahoo quote response shape.

const isDev = import.meta.env.DEV;

export async function fetchYahooQuote(symbols) {
  const list = Array.isArray(symbols) ? symbols.join(",") : symbols;
  const url = isDev
    ? `/yf/v7/finance/quote?symbols=${encodeURIComponent(list)}`
    : `/api/yfinance?symbols=${encodeURIComponent(list)}`;

  const r = await fetch(url);
  if (!r.ok) throw new Error(`Yahoo upstream ${r.status}`);
  return r.json();
}

export async function fetchYahooChart(symbol, range = "5d", interval = "1d") {
  const path = `/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=${range}&interval=${interval}`;
  const url = isDev ? `/yf${path}` : `/api/yfinance-chart?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Yahoo chart ${r.status}`);
  return r.json();
}
