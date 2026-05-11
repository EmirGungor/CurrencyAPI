import { useEffect, useMemo, useState, useCallback } from "react";
import { FaBitcoin } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isCryptoOpen } from "../lib/marketHours";
import { useSearch } from "../lib/search";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";
import { CRYPTO_GROUPS, fetchCryptoQuotes } from "../lib/cryptoList";

const TABS = [
  { id: "top", labelTr: "Top", labelEn: "Top" },
  { id: "defi", labelTr: "DeFi", labelEn: "DeFi" },
  { id: "l2", labelTr: "L2", labelEn: "L2" },
  { id: "meme", labelTr: "Meme", labelEn: "Meme" },
];

const formatPrice = (v) => {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 100) return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 1) return v.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  return v.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });
};

export default function CryptoList() {
  const { t, lang } = useI18n();
  const { matches } = useSearch();
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const [active, setActive] = useState("top");
  const [data, setData] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const group = CRYPTO_GROUPS[active] || [];
    try {
      const rows = await fetchCryptoQuotes(group.map((g) => g.binance));
      setData((s) => ({ ...s, [active]: rows }));
    } catch {
      setError(t("common.error.market"));
    }
  }, [active, t]);

  useSmartPoll(load, { isOpen: isCryptoOpen, openMs: 30_000 });

  useEffect(() => {
    // Re-fetch when tab changes
    load();
  }, [active, load]);

  const onPick = (item) => {
    setSelection({
      kind: "crypto",
      coinId: item.coinId,
      symbol: item.symbol,
      vs: "USD",
      label: `${item.symbol}/USD`,
    });
    setRoute("crypto");
  };

  const rows = useMemo(() => {
    const fetched = data[active] || [];
    const map = new Map();
    for (const r of fetched) map.set(r.symbol.replace("USDT", ""), r);
    const base = CRYPTO_GROUPS[active] || [];
    return base
      .map((b) => {
        const f = map.get(b.symbol) || map.get(b.binance.replace("USDT", ""));
        return { ...b, close: f?.close ?? null, changePct: f?.changePct ?? null };
      })
      .filter((r) => matches(r.symbol, r.name));
  }, [data, active, matches]);

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">
          <FaBitcoin />
          {t("crypto.title")}
        </span>
        {error ? (
          <button className="retry-btn" type="button" onClick={load}>{t("common.retry")}</button>
        ) : (
          <span className="panel-meta">
            <span className="status-dot status-dot-up" aria-hidden />
            <span className="status-label">{t("section.alwaysOpen")}</span>
          </span>
        )}
      </div>

      <div className="cl-tabs-row">
        <div className="cl-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              className={`wl-tab ${active === tab.id ? "is-active" : ""}`}
              onClick={() => setActive(tab.id)}
            >
              {lang === "tr" ? tab.labelTr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-body no-pad">
        <table className="wl-table">
          <thead>
            <tr>
              <th>{t("crypto.symbol")}</th>
              <th style={{ width: "40%" }}>{t("crypto.name")}</th>
              <th style={{ textAlign: "right" }}>{t("crypto.price")}</th>
              <th style={{ textAlign: "right" }}>{t("crypto.change24h")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>
                  {t("search.noResults")}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const up = (r.changePct ?? 0) >= 0;
                return (
                  <tr
                    key={r.symbol + "_" + r.binance}
                    className="wl-row is-clickable"
                    onClick={() => onPick(r)}
                    title={`${r.name} chart →`}
                  >
                    <td><span className="wl-rank"><strong>{r.symbol}</strong></span></td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{r.name}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      ${formatPrice(r.close)}
                    </td>
                    <td className={`wl-pct ${up ? "up" : "down"}`}>
                      {r.changePct == null ? "—" : `${up ? "+" : ""}${r.changePct.toFixed(2)}%`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
