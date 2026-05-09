import { useState, useCallback, useMemo } from "react";
import { useI18n } from "../i18n";
import {
  NASDAQ_TOP,
  SP500_TOP,
  BIST_TOP,
  fetchStooq,
  fetchBistQuotes,
} from "../lib/stocks";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isBistOpen, isUsMarketOpen } from "../lib/marketHours";

const MARKETS = [
  { id: "bist", label: "BIST 30", flag: "🇹🇷" },
  { id: "nasdaq", label: "NASDAQ", flag: "🇺🇸" },
  { id: "sp500", label: "S&P 500", flag: "🇺🇸" },
];

const TICKER_LABELS = {
  tr: { title: "TOP HİSSELER", lastClose: "son kapanış", live: "canlı" },
  en: { title: "TOP STOCKS", lastClose: "last close", live: "live" },
};

const formatPrice = (v, locale = "en-US") => {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function TopStocks() {
  const { t, lang } = useI18n();
  const [active, setActive] = useState("nasdaq");
  const [data, setData] = useState({ bist: [], nasdaq: [], sp500: [] });
  const [loading, setLoading] = useState({ bist: false, nasdaq: false, sp500: false });
  const [error, setError] = useState({});

  const labels = TICKER_LABELS[lang] || TICKER_LABELS.tr;

  const load = useCallback(async (marketId) => {
    setLoading((s) => ({ ...s, [marketId]: true }));
    setError((s) => ({ ...s, [marketId]: null }));
    try {
      let rows;
      if (marketId === "nasdaq") {
        rows = await fetchStooq(NASDAQ_TOP.map((s) => s.symbol));
        rows = rows.map((r) => {
          const meta = NASDAQ_TOP.find((s) => s.symbol === r.symbol);
          return { ...r, name: meta?.name };
        });
      } else if (marketId === "sp500") {
        rows = await fetchStooq(SP500_TOP.map((s) => s.symbol.replace("-", "-")));
        rows = rows.map((r) => {
          const meta = SP500_TOP.find((s) => s.symbol === r.symbol);
          return { ...r, name: meta?.name };
        });
      } else if (marketId === "bist") {
        rows = await fetchBistQuotes(BIST_TOP.map((s) => s.symbol));
        rows = rows.map((r) => {
          const meta = BIST_TOP.find((s) => s.symbol === r.symbol);
          return { ...r, code: meta?.code || r.symbol, name: meta?.name };
        });
      }
      setData((s) => ({ ...s, [marketId]: rows || [] }));
    } catch (e) {
      setError((s) => ({ ...s, [marketId]: t("common.error.market") }));
    } finally {
      setLoading((s) => ({ ...s, [marketId]: false }));
    }
  }, [t]);

  // Per-tab market-hours predicate: paused outside market hours.
  const isOpenForActive = useCallback(() => {
    if (active === "bist") return isBistOpen();
    if (active === "nasdaq" || active === "sp500") return isUsMarketOpen();
    return false;
  }, [active]);

  const { open } = useSmartPoll(() => load(active), {
    isOpen: isOpenForActive,
    openMs: 30_000,
    closedMs: 0, // paused when closed — last close stays on screen
    deps: [active],
  });

  const rows = useMemo(() => data[active] || [], [data, active]);
  const isLoading = loading[active];
  const err = error[active];
  const locale = lang === "tr" ? "tr-TR" : "en-US";

  // For BIST show TRY, for US show $
  const currency = active === "bist" ? "₺" : "$";
  const isBist = active === "bist";

  return (
    <section className="top-stocks" aria-label={labels.title}>
      <div className="ts-head">
        <div className="ts-title">
          <span className={`ts-pulse ${open ? "" : "is-off"}`} aria-hidden="true" />
          <span>{labels.title}</span>
          <span className="ts-status">
            {open ? t("section.open") : t("section.closed")}
          </span>
        </div>
        <div className="ts-tabs" role="tablist">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={active === m.id}
              type="button"
              className={`ts-tab ${active === m.id ? "is-active" : ""}`}
              onClick={() => setActive(m.id)}
            >
              <span className="ts-flag" aria-hidden="true">{m.flag}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ts-strip" role="tabpanel">
        {err ? (
          <div className="ts-error">
            <span>{err}</span>
            <button type="button" className="retry-btn" onClick={() => load(active)}>
              {t("common.retry")}
            </button>
          </div>
        ) : isLoading && rows.length === 0 ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ts-item is-skeleton">
              <span className="ts-sym">···</span>
              <span className="ts-price">···</span>
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="ts-empty">{labels.lastClose}: —</div>
        ) : (
          rows.map((r) => {
            const up = (r.changePct ?? 0) >= 0;
            const sym = isBist ? r.code || r.symbol.replace(".IS", "") : r.symbol;
            return (
              <div key={r.symbol} className="ts-item" title={r.name}>
                <div className="ts-sym-row">
                  <span className="ts-sym">{sym}</span>
                  <span className={`ts-pct ${up ? "up" : "down"}`}>
                    {r.changePct == null ? "—" : `${up ? "+" : ""}${r.changePct.toFixed(2)}%`}
                  </span>
                </div>
                <div className="ts-price">
                  {currency}{formatPrice(r.close, locale)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
