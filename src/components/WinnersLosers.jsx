import { useCallback, useState, useMemo } from "react";
import { FaTrophy, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isUsMarketOpen } from "../lib/marketHours";
import { fetchStooq } from "../lib/stocks";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";
import Freshness from "./Freshness";
import { Shimmer, ErrorState } from "./DataState";
import TickValue from "./TickValue";

// Curated wider universe so we can compute winners/losers within a known set.
const UNIVERSE = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "TSLA", "AVGO", "NFLX", "AMD",
  "ORCL", "CRM", "ADBE", "INTC", "CSCO", "QCOM", "TXN", "IBM", "PYPL", "MU",
  "V", "MA", "JPM", "BAC", "WFC", "GS", "MS", "C", "AXP", "BLK",
  "JNJ", "LLY", "PFE", "ABBV", "MRK", "UNH", "TMO", "ABT",
  "WMT", "COST", "HD", "LOW", "PG", "KO", "PEP", "MCD", "DIS",
  "XOM", "CVX", "BA",
];

export default function WinnersLosers() {
  const { t } = useI18n();
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const onPick = (r) => {
    setSelection({ kind: "stock", market: "us", symbol: r.symbol, vs: "USD", label: `${r.symbol} · NASDAQ` });
    setRoute("stocks");
  };

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await fetchStooq(UNIVERSE);
      const cleaned = data.filter((r) => Number.isFinite(r.changePct));
      setRows(cleaned);
    } catch {
      setError(t("common.error.market"));
    }
  }, [t]);

  const { open } = useSmartPoll(load, {
    isOpen: isUsMarketOpen,
    openMs: 60_000,
    closedMs: 0,
  });

  const winners = useMemo(
    () => [...rows].sort((a, b) => b.changePct - a.changePct).slice(0, 10),
    [rows]
  );
  const losers = useMemo(
    () => [...rows].sort((a, b) => a.changePct - b.changePct).slice(0, 10),
    [rows]
  );

  const fmtPrice = (v) =>
    v == null ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderRow = (r, i, dir) => (
    <tr key={r.symbol} className="wl-row is-clickable" onClick={() => onPick(r)} title={`${r.symbol} chart →`}>
      <td>
        <span className="wl-rank">
          <span className={`wl-rank-num ${i < 3 ? `is-${i + 1}` : ""}`}>{i + 1}</span>
          {r.symbol}
        </span>
      </td>
      <td className="num">
        {r.close == null ? <span style={{ color: "var(--muted)" }}>—</span> : (
          <TickValue value={r.close} prefix="$" format={(v) => fmtPrice(v)} />
        )}
      </td>
      <td className={`wl-pct ${dir}`}>
        {dir === "up" ? "+" : ""}
        {r.changePct.toFixed(2)}%
      </td>
    </tr>
  );

  const renderSkelRow = (i) => (
    <tr key={`sk${i}`}>
      <td>
        <span className="wl-rank">
          <span className="wl-rank-num">{i + 1}</span>
          <Shimmer width={42} height={11} />
        </span>
      </td>
      <td><Shimmer width={56} height={11} /></td>
      <td><Shimmer width={42} height={11} /></td>
    </tr>
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">
          <FaTrophy />
          {t("wl.title")}
        </span>
        <Freshness ts={rows.length ? Date.now() : null} isOpen={open} error={!!error} label={`NASDAQ · ${open ? "Canlı" : "Kapalı"}`} />

      </div>
      {error ? (
        <div className="panel-body no-pad">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : (
        <div className="wl-grid panel-body no-pad">
          <div className="wl-col wl-col-up">
            <div className="wl-col-head">
              <span className="wl-badge"><FaArrowUp /></span>
              {t("wl.winners")}
            </div>
            <table className="wl-table">
              <thead>
                <tr>
                  <th>{t("wl.symbol")}</th>
                  <th>{t("wl.price")}</th>
                  <th>{t("wl.change")}</th>
                </tr>
              </thead>
              <tbody>
                {winners.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => renderSkelRow(i))
                  : winners.map((r, i) => renderRow(r, i, "up"))}
              </tbody>
            </table>
          </div>
          <div className="wl-col wl-col-down">
            <div className="wl-col-head">
              <span className="wl-badge"><FaArrowDown /></span>
              {t("wl.losers")}
            </div>
            <table className="wl-table">
              <thead>
                <tr>
                  <th>{t("wl.symbol")}</th>
                  <th>{t("wl.price")}</th>
                  <th>{t("wl.change")}</th>
                </tr>
              </thead>
              <tbody>
                {losers.length === 0
                  ? Array.from({ length: 5 }).map((_, i) => renderSkelRow(i))
                  : losers.map((r, i) => renderRow(r, i, "down"))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
