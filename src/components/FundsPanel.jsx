import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaSearch,
  FaSlidersH,
  FaDownload,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";
import { useSearch } from "../lib/search";
import { FUND_LIST, MANAGER_NAMES, fetchFundHistory, summarizePoints } from "../lib/funds";

const PAGE_SIZE = 50;

const SORT_TABS = [
  { id: "ytd", labelTr: "Getiri", labelEn: "Return", icon: "▲" },
  { id: "totalValue", labelTr: "Büyüklük", labelEn: "Size", icon: "$" },
  { id: "investorCount", labelTr: "Yatırımcı", labelEn: "Investors", icon: "👥" },
  { id: "daily", labelTr: "Nakit Akışı", labelEn: "Cash Flow", icon: "💵" },
  { id: "monthly", labelTr: "Aylık Getiriler", labelEn: "Monthly", icon: "📅" },
];

const RISK_TONE = (r) => {
  if (r == null) return "muted";
  if (r <= 2) return "success";
  if (r <= 4) return "warning";
  return "danger";
};

const fmtNum = (n, locale = "tr-TR", dp = 0) =>
  n == null ? "—" : n.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });

const fmtPct = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}%`);

export default function FundsPanel() {
  const { t, lang } = useI18n();
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const { matches } = useSearch();

  const [tefasFilter, setTefasFilter] = useState(""); // "", "1", "0"
  const [katilimFilter, setKatilimFilter] = useState("");
  const [stopajFilter, setStopajFilter] = useState("");
  const [localQuery, setLocalQuery] = useState("");
  const [sortBy, setSortBy] = useState("investorCount");
  const [sortDir, setSortDir] = useState("desc");
  const [activeTab, setActiveTab] = useState("investorCount");

  // Runtime overlay: { [code]: { last, pct, error } } from /api/tefas
  const [live, setLive] = useState({});
  const [tefasReachable, setTefasReachable] = useState(null);

  // Lazy probe TEFAS — only fetch first row + extrapolate. If reachable, batch a few popular.
  const loadLive = useCallback(async () => {
    // Quick probe: try the top 3 funds. If even one works, mark TEFAS reachable.
    const codes = FUND_LIST.slice(0, 3).map((f) => f.code);
    const results = await Promise.all(
      codes.map(async (code) => {
        try {
          const pts = await fetchFundHistory(code, "1m");
          const { last, pct } = summarizePoints(pts);
          return [code, { last, pct, ok: last != null }];
        } catch {
          return [code, { ok: false }];
        }
      })
    );
    const any = results.some(([, v]) => v.ok);
    setTefasReachable(any);
    setLive(Object.fromEntries(results));
  }, []);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  const onSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const onTabClick = (id) => {
    setActiveTab(id);
    setSortBy(id);
    setSortDir("desc");
  };

  const rows = useMemo(() => {
    let r = FUND_LIST.slice();
    if (localQuery) {
      const q = localQuery.toLowerCase();
      r = r.filter(
        (f) =>
          f.code.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          (MANAGER_NAMES[f.managerCode] || "").toLowerCase().includes(q)
      );
    }
    // Global search bar still applies
    r = r.filter((f) => matches(f.code, f.name, MANAGER_NAMES[f.managerCode]));

    if (katilimFilter === "1") r = r.filter((f) => /katılım/i.test(f.category));
    if (katilimFilter === "0") r = r.filter((f) => !/katılım/i.test(f.category));

    r.sort((a, b) => {
      const va = a[sortBy] ?? -Infinity;
      const vb = b[sortBy] ?? -Infinity;
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return r;
  }, [localQuery, matches, katilimFilter, sortBy, sortDir]);

  const onPick = (f) => {
    setSelection({ kind: "fund", fonkod: f.code, label: `${f.code} · TEFAS` });
    setRoute("funds");
  };

  const visible = rows.slice(0, PAGE_SIZE);
  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const sortArrow = (col) =>
    sortBy === col ? (sortDir === "desc" ? <FaChevronDown className="fp-sort-icon" /> : <FaChevronUp className="fp-sort-icon" />) : null;

  return (
    <div className="funds-shell">
      {/* Filter bar */}
      <div className="fp-filterbar">
        <select
          className="fp-select"
          value={tefasFilter}
          onChange={(e) => setTefasFilter(e.target.value)}
          aria-label="TEFAS filter"
        >
          <option value="">{t("fp.tefasAll")}</option>
          <option value="1">{t("fp.tefasOpen")}</option>
          <option value="0">{t("fp.tefasClosed")}</option>
        </select>
        <div className="fp-search">
          <FaSearch aria-hidden />
          <input
            type="text"
            placeholder={t("fp.searchPlaceholder")}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>
        <select
          className="fp-select"
          value={katilimFilter}
          onChange={(e) => setKatilimFilter(e.target.value)}
        >
          <option value="">{t("fp.katilimAll")}</option>
          <option value="1">{t("fp.katilimYes")}</option>
          <option value="0">{t("fp.katilimNo")}</option>
        </select>
        <select
          className="fp-select"
          value={stopajFilter}
          onChange={(e) => setStopajFilter(e.target.value)}
        >
          <option value="">{t("fp.stopajAll")}</option>
          <option value="stopajsiz">{t("fp.stopajNone")}</option>
          <option value="avantajli">{t("fp.stopajAdv")}</option>
          <option value="stopajli">{t("fp.stopajYes")}</option>
        </select>
        <button type="button" className="fp-filter-btn">
          <FaSlidersH />
          <span>{t("fp.filterX")}</span>
        </button>
        <button type="button" className="fp-excel-btn">
          <FaDownload />
          <span>Excel</span>
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="fp-subtabs">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`fp-subtab ${activeTab === tab.id ? "is-active" : ""}`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="fp-tab-icon" aria-hidden>{tab.icon}</span>
            <span>{lang === "tr" ? tab.labelTr : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Big table */}
      <div className="fp-table-wrap">
        {tefasReachable === false && (
          <div className="fp-snapshot-note">
            ⓘ {t("fp.snapshotNote")}
          </div>
        )}
        <div className="fp-table-scroll">
          <table className="fp-table">
            <thead>
              <tr>
                <th className="fp-col-rank">#</th>
                <th className="fp-col-name">{t("fp.fund")}</th>
                <th className="fp-col-tefas">TEFAS</th>
                <th className="fp-col-cat">{t("fp.category")}</th>
                <th className="fp-col-num clickable" onClick={() => onSort("investorCount")}>
                  <span>{t("fp.investors")}</span>{sortArrow("investorCount")}
                </th>
                <th className="fp-col-num clickable" onClick={() => onSort("totalValue")}>
                  <span>{t("fp.totalValue")}</span>{sortArrow("totalValue")}
                </th>
                <th className="fp-col-num clickable" onClick={() => onSort("risk")}>
                  <span>{t("fp.risk")}</span>{sortArrow("risk")}
                </th>
                <th className="fp-col-num clickable" onClick={() => onSort("sharpe")}>
                  <span>Sharpe</span>{sortArrow("sharpe")}
                </th>
                <th className="fp-col-num clickable" onClick={() => onSort("daily")}>
                  <span>{t("fp.daily")}</span>{sortArrow("daily")}
                </th>
                <th className="fp-col-num clickable" onClick={() => onSort("monthly")}>
                  <span>{t("fp.monthly")}</span>{sortArrow("monthly")}
                </th>
                <th className="fp-col-num clickable" onClick={() => onSort("ytd")}>
                  <span>{t("fp.ytd")}</span>{sortArrow("ytd")}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f, i) => {
                const liveRow = live[f.code];
                const isLive = !!liveRow?.ok;
                const dailyVal = isLive && Number.isFinite(liveRow.pct) ? liveRow.pct : f.daily;
                const monthly = f.monthly;
                const ytd = f.ytd;
                const riskTone = RISK_TONE(f.risk);
                const mgrName = MANAGER_NAMES[f.managerCode] || f.managerCode;
                return (
                  <tr key={f.code} className="fp-row" onClick={() => onPick(f)} title={f.name}>
                    <td className="fp-col-rank">{i + 1}</td>
                    <td className="fp-col-name">
                      <div className="fp-fund-cell">
                        <div className="fp-mgr-logo" style={{ "--mgr": logoColor(f.managerCode) }}>
                          {f.managerCode.slice(0, 2)}
                        </div>
                        <div className="fp-fund-meta">
                          <span className="fp-code">
                            {f.code}
                            <span className={`fp-status-dot ${isLive ? "live" : "stale"}`} title={isLive ? "Bugün güncellendi" : "Snapshot"} />
                          </span>
                          <span className="fp-mgr">{mgrName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="fp-col-tefas">
                      <FaCheck className="fp-check" />
                    </td>
                    <td className="fp-col-cat">{f.category}</td>
                    <td className="fp-col-num">{fmtNum(f.investorCount, locale)}</td>
                    <td className="fp-col-num">
                      ₺{fmtNum(f.totalValue, locale, 2)} {f.totalValueUnit}
                    </td>
                    <td className="fp-col-num">
                      <span className={`fp-risk fp-risk-${riskTone}`}>{f.risk ?? "—"}</span>
                    </td>
                    <td className="fp-col-num">{fmtNum(f.sharpe, locale, 4)}</td>
                    <td className={`fp-col-num ${dailyVal >= 0 ? "up" : "down"}`}>
                      {fmtPct(dailyVal)}
                    </td>
                    <td className={`fp-col-num ${monthly >= 0 ? "up" : "down"}`}>
                      {fmtPct(monthly)}
                    </td>
                    <td className={`fp-col-num ${ytd >= 0 ? "up" : "down"}`}>
                      {fmtPct(ytd)}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={11} className="fp-empty">
                    {t("search.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="fp-footer">
          <span>{visible.length} / {FUND_LIST.length} {t("fp.fundsShown")}</span>
        </div>
      </div>
    </div>
  );
}

// Deterministic color per manager code (hue derived from code)
function logoColor(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 55%)`;
}
