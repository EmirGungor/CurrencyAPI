// Frankfurter (ECB) — free, no auth, CORS-friendly. Endpoints: /v1/latest, /v1/currencies, /v1/{start}..{end}
export const FX_BASE = "https://api.frankfurter.dev/v1";

// Legacy export (some files still import this name) — alias to Frankfurter so the converter stops failing.
export const FREECURRENCY_BASE = FX_BASE;
export const FREECURRENCY_API_KEY = ""; // unused with Frankfurter

export const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export const YFINANCE_BASE = import.meta.env.DEV
  ? "/yf"
  : "/api/yfinance";
