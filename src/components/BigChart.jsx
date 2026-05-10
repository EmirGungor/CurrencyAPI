import { useEffect, useMemo, useState, useCallback } from "react";
import { FaChartLine } from "react-icons/fa";
import { useI18n } from "../i18n";
import { fetchFxHistory } from "../lib/fxHistory";
import { fetchCryptoHistory } from "../lib/cryptoHistory";
import { fetchGoldHistory } from "../lib/metalHistory";
import { fetchBistStockHistory, fetchUsStockHistory } from "../lib/stockHistory";
import { fetchFundHistory } from "../lib/funds";
import { useSelection } from "../lib/selection";

const RANGES = ["1d", "1w", "1m", "3m", "1y"];

export default function BigChart() {
  const { t, lang } = useI18n();
  const { selection } = useSelection();
  const [range, setRange] = useState("1m");
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (r) => {
      try {
        setLoading(true);
        setError("");
        let data;
        if (selection.kind === "crypto") {
          data = await fetchCryptoHistory(selection.coinId, (selection.vs || "usd").toLowerCase(), r);
        } else if (selection.kind === "metal") {
          data = await fetchGoldHistory({
            unit: selection.unit || "oz",
            vs: (selection.vs || "usd").toLowerCase(),
            range: r,
          });
        } else if (selection.kind === "stock") {
          if (selection.market === "bist") {
            data = await fetchBistStockHistory(selection.symbol, r);
          } else {
            data = await fetchUsStockHistory(selection.symbol, r);
          }
        } else if (selection.kind === "fund") {
          data = await fetchFundHistory(selection.fonkod, r);
        } else {
          data = await fetchFxHistory(selection.from, selection.to, r);
        }
        setPoints(data);
      } catch {
        setError(t("common.error.market"));
        setPoints([]);
      } finally {
        setLoading(false);
      }
    },
    [
      t,
      selection.kind,
      selection.from,
      selection.to,
      selection.coinId,
      selection.vs,
      selection.unit,
      selection.symbol,
      selection.market,
      selection.fonkod,
    ]
  );

  useEffect(() => {
    load(range);
  }, [range, load]);

  const stats = useMemo(() => {
    if (points.length < 1) return { last: null, prev: null, pct: null };
    const last = points[points.length - 1].value;
    const first = points[0].value;
    const pct = first ? ((last - first) / first) * 100 : null;
    return { last, prev: first, pct };
  }, [points]);

  const path = useMemo(() => {
    if (points.length < 2) return null;
    const W = 1000;
    const H = 220;
    const PAD_X = 12;
    const PAD_T = 12;
    const PAD_B = 28;
    const ys = points.map((p) => p.value);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const range = max - min || 1;
    const innerW = W - PAD_X * 2;
    const innerH = H - PAD_T - PAD_B;
    const stepX = innerW / Math.max(1, points.length - 1);
    const coords = points.map((p, i) => {
      const cx = PAD_X + i * stepX;
      const cy = PAD_T + innerH - ((p.value - min) / range) * innerH;
      return [cx, cy, p];
    });
    const d = coords
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ");
    const last = coords[coords.length - 1];
    const fillD = `${d} L${last[0].toFixed(2)},${(H - PAD_B).toFixed(2)} L${PAD_X},${(H - PAD_B).toFixed(2)} Z`;

    // Y-axis ticks (3 levels)
    const yTicks = [min, (min + max) / 2, max].map((v) => ({
      value: v,
      y: PAD_T + innerH - ((v - min) / range) * innerH,
    }));

    // X-axis ticks: 4-6 spread
    const tickCount = Math.min(6, points.length);
    const xTicks = Array.from({ length: tickCount }, (_, i) => {
      const idx = Math.round((i / (tickCount - 1)) * (points.length - 1));
      const c = coords[idx];
      return { x: c[0], date: c[2].date };
    });

    return { d, fillD, W, H, yTicks, xTicks, padB: PAD_B };
  }, [points]);

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const vsCode = (selection.vs || selection.to || "USD").toUpperCase();
  const symbolLabel =
    selection.label ||
    (selection.kind === "crypto" ? `${selection.symbol}/${vsCode}` : null) ||
    (selection.kind === "stock" ? selection.symbol : null) ||
    (selection.kind === "fund" ? `${selection.fonkod} · TEFAS` : null) ||
    `${selection.from}/${selection.to}`;
  const isLargePrice = stats.last != null && stats.last >= 1000;
  const priceDecimals = isLargePrice ? 2 : selection.kind === "forex" ? 4 : 2;
  const currencyCode =
    selection.kind === "forex"
      ? selection.to
      : selection.kind === "fund"
      ? "TRY"
      : vsCode;
  const pricePrefix =
    currencyCode === "TRY" ? "₺" :
    currencyCode === "EUR" ? "€" :
    currencyCode === "GBP" ? "£" :
    currencyCode === "USD" ? "$" : "";
  const fmt = (v, dp = priceDecimals) =>
    v == null ? "—" : v.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (range === "1d" || range === "1w") return dt.toLocaleDateString(locale, { day: "2-digit", month: "short" });
    if (range === "1m") return dt.toLocaleDateString(locale, { day: "2-digit", month: "short" });
    return dt.toLocaleDateString(locale, { month: "short", year: "2-digit" });
  };
  const up = (stats.pct ?? 0) >= 0;
  const stroke = up ? "var(--up)" : "var(--down)";

  return (
    <div className="panel">
      <div className="bc-head">
        <div className="bc-meta">
          <span className="bc-symbol">{symbolLabel}</span>
          <span className="bc-price">{pricePrefix}{fmt(stats.last)}</span>
          {stats.pct != null && (
            <span className={`bc-change ${up ? "up" : "down"}`}>
              {up ? "▲" : "▼"} {Math.abs(stats.pct).toFixed(2)}%
            </span>
          )}
        </div>
        <div className="bc-tabs" role="tablist" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              className={`bc-tab ${range === r ? "is-active" : ""}`}
              onClick={() => setRange(r)}
            >
              {r === "1d" ? "1G" : r === "1w" ? "1H" : r === "1m" ? "1A" : r === "3m" ? "3A" : "1Y"}
            </button>
          ))}
        </div>
      </div>
      <div className="bc-chart">
        {error ? (
          <div className="bc-empty">
            <span>{error}</span>
            <button type="button" className="retry-btn" onClick={() => load(range)}>{t("common.retry")}</button>
          </div>
        ) : path ? (
          <svg viewBox={`0 0 ${path.W} ${path.H}`} width="100%" height="100%" preserveAspectRatio="none" role="img" aria-label="USD/TRY history">
            <defs>
              <linearGradient id="bc-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            {path.yTicks.map((t, i) => (
              <line key={`yt${i}`} x1="12" x2={path.W - 12} y1={t.y} y2={t.y} stroke="var(--border)" strokeDasharray="3 4" opacity="0.6" />
            ))}
            <path d={path.fillD} fill="url(#bc-fill)" />
            <path d={path.d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {path.yTicks.map((t, i) => (
              <text key={`yl${i}`} x={path.W - 14} y={t.y - 4} fontSize="10" fill="var(--dim)" textAnchor="end" fontFamily="ui-sans-serif, system-ui">
                {pricePrefix}{fmt(t.value, isLargePrice ? 0 : 2)}
              </text>
            ))}
            {path.xTicks.map((tk, i) => (
              <text key={`xl${i}`} x={tk.x} y={path.H - 8} fontSize="10" fill="var(--dim)" textAnchor="middle" fontFamily="ui-sans-serif, system-ui">
                {fmtDate(tk.date)}
              </text>
            ))}
          </svg>
        ) : (
          <div className="bc-empty">
            <FaChartLine />
            <span>{loading ? t("common.loading") : t("bigchart.collecting")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
