import { useEffect, useState, useCallback } from "react";
import { FaChartLine } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";
import { useSearch } from "../lib/search";
import { FUND_LIST, fetchFundHistory, summarizePoints } from "../lib/funds";

const TYPE_LABELS = {
  HSF: { tr: "Hisse Senedi", en: "Equity" },
  FSF: { tr: "Fon Sepeti", en: "Fund Basket" },
  SPK: { tr: "Para Piyasası", en: "Money Market" },
  BIY: { tr: "Borçlanma", en: "Fixed Income" },
  KFA: { tr: "Kıymetli Maden", en: "Precious Metals" },
  KAR: { tr: "Karma", en: "Mixed" },
  DBF: { tr: "Değişken", en: "Flexible" },
  GMF: { tr: "Gayrimenkul", en: "Real Estate" },
};

export default function FundsPanel() {
  const { t, lang } = useI18n();
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const { matches } = useSearch();
  const [byCode, setByCode] = useState({}); // { AAK: { last, pct, points } }
  const [loading, setLoading] = useState(true);
  const [anyOk, setAnyOk] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    // 35 days = ~1 month — gives both last NAV and a recent percent change
    const results = await Promise.all(
      FUND_LIST.map(async (f) => {
        try {
          const points = await fetchFundHistory(f.code, "1m");
          const { last, pct } = summarizePoints(points);
          return [f.code, { last, pct, ok: last != null }];
        } catch {
          return [f.code, { last: null, pct: null, ok: false }];
        }
      })
    );
    const next = Object.fromEntries(results);
    setByCode(next);
    setAnyOk(Object.values(next).some((v) => v.ok));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    const iv = setInterval(loadAll, 15 * 60_000); // 15 min refresh — TEFAS publishes daily
    return () => clearInterval(iv);
  }, [loadAll]);

  const onPick = (f) => {
    setSelection({
      kind: "fund",
      fonkod: f.code,
      label: `${f.code} · TEFAS`,
    });
    setRoute("funds");
  };

  const visible = FUND_LIST.filter((f) =>
    matches(f.code, f.name, f.manager)
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">
          <FaChartLine />
          {t("funds.title")}
        </span>
        <span className="panel-meta">
          <span className={`status-dot ${anyOk ? "status-dot-up" : "status-dot-off"}`} aria-hidden />
          {anyOk ? "TEFAS" : t("funds.unavailable")}
          {!loading && <><span className="status-sep">·</span><button type="button" className="retry-btn" onClick={loadAll}>{t("common.retry")}</button></>}
        </span>
      </div>
      <div className="panel-body no-pad">
        <table className="wl-table funds-table">
          <thead>
            <tr>
              <th>{t("funds.code")}</th>
              <th style={{ width: "44%" }}>{t("funds.name")}</th>
              <th>{t("funds.type")}</th>
              <th style={{ textAlign: "right" }}>{t("funds.nav")}</th>
              <th style={{ textAlign: "right" }}>{t("funds.change30d")}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((f) => {
              const row = byCode[f.code] || {};
              const up = (row.pct ?? 0) >= 0;
              const typeLabel = TYPE_LABELS[f.type]?.[lang] || f.type;
              return (
                <tr
                  key={f.code}
                  className="wl-row is-clickable"
                  onClick={() => onPick(f)}
                  title={`${f.code} chart →`}
                >
                  <td><span className="wl-rank"><strong>{f.code}</strong></span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: "var(--dim)" }}>{f.manager}</div>
                  </td>
                  <td><span className="fund-badge">{typeLabel}</span></td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {row.last != null ? `₺${row.last.toLocaleString(lang === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 })}` : "—"}
                  </td>
                  <td className={`wl-pct ${up ? "up" : "down"}`}>
                    {row.pct == null ? "—" : `${up ? "+" : ""}${row.pct.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>
                  {t("search.noResults")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {!loading && !anyOk && (
          <div style={{ padding: "14px 16px", fontSize: 12, color: "var(--dim)", borderTop: "1px solid var(--border)" }}>
            {t("funds.unavailableDetail")}
          </div>
        )}
      </div>
    </div>
  );
}
