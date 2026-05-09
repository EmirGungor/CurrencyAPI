export const FREECURRENCY_API_KEY = import.meta.env.VITE_FREECURRENCY_API_KEY || "";
export const FREECURRENCY_BASE = "https://api.freecurrencyapi.com/v1";

export const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export const YFINANCE_BASE = import.meta.env.DEV
  ? "/yf"
  : "/api/yfinance";
