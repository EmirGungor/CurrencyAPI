// Single source of truth for number / currency / percent formatting.
//
// Crypto adaptive rule: ≥100 → 2 dp, ≥1 → 4 dp, <1 → 6 dp, <0.001 → 8 dp.
// FX: 4 dp (USD/TRY style). Fiat large numbers: 2 dp.

const SYM = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CHF: "CHF ",
  CAD: "C$",
  AUD: "A$",
};

/** Locale code from i18n language. */
export function localeFor(lang) {
  return lang === "en" ? "en-US" : "tr-TR";
}

/** Currency symbol (or empty string). */
export function symbolFor(code) {
  return SYM[(code || "").toUpperCase()] || "";
}

/** Format a money value with appropriate decimals and symbol. */
export function fmtMoney(v, opts = {}) {
  const {
    code = "TRY",
    locale,
    decimals,
    showSymbol = true,
    sign = false,
  } = opts;
  if (v == null || !Number.isFinite(v)) return "—";
  const loc = locale || "tr-TR";
  const dp = decimals ?? defaultDecimals(v, code);
  let formatted = v.toLocaleString(loc, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
  if (sign && v > 0) formatted = "+" + formatted;
  return showSymbol ? `${symbolFor(code)}${formatted}` : formatted;
}

/** Format a crypto value adaptively (small coins need more decimals). */
export function fmtCrypto(v, locale = "en-US") {
  if (v == null || !Number.isFinite(v)) return "—";
  let dp = 2;
  if (v < 0.001) dp = 8;
  else if (v < 1) dp = 6;
  else if (v < 100) dp = 4;
  return v.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

/** Format a percent with leading sign and 2 decimals. */
export function fmtPct(v, dp = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(dp)}%`;
}

/** Format an arrow-prefixed percent (▲ +1.23% / ▼ -0.45%). */
export function fmtPctArrow(v, dp = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v >= 0 ? "▲" : "▼"} ${Math.abs(v).toFixed(dp)}%`;
}

/** Compact form (1.2K, 3.4M, 5.6B). */
export function fmtCompact(v, locale = "en-US", dp = 1) {
  if (v == null || !Number.isFinite(v)) return "—";
  if (Math.abs(v) < 1000) return v.toFixed(0);
  return v.toLocaleString(locale, {
    notation: "compact",
    maximumFractionDigits: dp,
  });
}

/** Default decimals based on value magnitude + currency. */
function defaultDecimals(v, code) {
  const c = (code || "").toUpperCase();
  // Crypto follows adaptive rule
  if (c === "BTC" || c === "ETH" || c === "USDT" || c === "USDC") return 4;
  // Big fiat amounts: 2 dp; FX rates (≤10): 4 dp
  if (Math.abs(v) < 10) return 4;
  return 2;
}

/* Convenience factory: returns a memo-able formatter for a given (locale, code). */
export function makeFmt(locale, code) {
  return (v, dp) => fmtMoney(v, { locale, code, decimals: dp });
}
