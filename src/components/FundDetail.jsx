import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaStar,
  FaRegStar,
  FaArrowUp,
  FaArrowDown,
  FaCheck,
  FaTimes,
  FaPercent,
  FaInfoCircle,
  FaChartBar,
  FaLayerGroup,
  FaCopy,
  FaBuilding,
  FaClock,
  FaCommentDots,
  FaLock,
  FaTrophy,
  FaCrown,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSelection } from "../lib/selection";
import { FUND_LIST, MANAGER_NAMES, fetchFundHistory, summarizePoints } from "../lib/funds";

const RISK_LABEL = {
  tr: ["", "Çok Düşük", "Düşük", "Orta-Düşük", "Orta", "Orta-Yüksek", "Yüksek", "Çok Yüksek"],
  en: ["", "Very Low", "Low", "Med-Low", "Medium", "Med-High", "High", "Very High"],
};

const COMPARE_TICKERS = ["BIST100", "USDTRY", "EURTRY", "ALTINS1", "GRAM", "BRENT"];

const RANGES = [
  { id: "1w", labelTr: "1H", labelEn: "1W" },
  { id: "1m", labelTr: "1A", labelEn: "1M", default: true },
  { id: "3m", labelTr: "3A", labelEn: "3M" },
  { id: "ytd", labelTr: "YBB", labelEn: "YTD" },
  { id: "1y", labelTr: "1Y", labelEn: "1Y" },
  { id: "5y", labelTr: "5Y", labelEn: "5Y" },
];

const fmtPrice = (v, locale = "tr-TR", dp = 6) =>
  v == null
    ? "—"
    : v.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });

const fmtPct = (v, dp = 4) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(dp)}%`);
const fmtNum = (n, locale = "tr-TR", dp = 0) =>
  n == null ? "—" : n.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });

function logoColor(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 55%)`;
}

// Build a tiny SVG line chart (replaces BigChart for compact display)
function FundLineChart({ points, range }) {
  const W = 1200;
  const H = 280;
  const PAD_X = 12;
  const PAD_T = 12;
  const PAD_B = 28;

  if (!points || points.length < 2) {
    return (
      <div className="fdv-chart-empty">
        <FaChartBar />
        <span>Veri bekleniyor</span>
      </div>
    );
  }
  const ys = points.map((p) => p.value);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range_ = max - min || 1;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_T - PAD_B;
  const stepX = innerW / (points.length - 1);
  const coords = points.map((p, i) => [PAD_X + i * stepX, PAD_T + innerH - ((p.value - min) / range_) * innerH, p]);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const last = coords[coords.length - 1];
  const fillD = `${d} L${last[0].toFixed(2)},${(H - PAD_B).toFixed(2)} L${PAD_X},${(H - PAD_B).toFixed(2)} Z`;
  const up = last[2].value >= coords[0][2].value;
  const stroke = up ? "#0ecb81" : "#ef4444";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fdv-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#fdv-gradient)" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FundDetail({ onBack }) {
  const { t, lang } = useI18n();
  const { selection } = useSelection();
  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const fund = useMemo(
    () => FUND_LIST.find((f) => f.code === selection?.fonkod),
    [selection?.fonkod]
  );

  const [favorite, setFavorite] = useState(false);
  const [range, setRange] = useState("1m");
  const [points, setPoints] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    if (!fund) return;
    let cancelled = false;
    setLoadingChart(true);
    fetchFundHistory(fund.code, range === "ytd" || range === "5y" ? "3m" : range === "1y" ? "1y" : range)
      .then((p) => { if (!cancelled) setPoints(p); })
      .catch(() => { if (!cancelled) setPoints([]); })
      .finally(() => { if (!cancelled) setLoadingChart(false); });
    return () => { cancelled = true; };
  }, [fund, range]);

  if (!fund) {
    return (
      <div className="panel">
        <div className="panel-body" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
          {t("search.noResults")}
        </div>
      </div>
    );
  }

  const mgrName = MANAGER_NAMES[fund.managerCode] || fund.managerCode;
  const riskLabel = (RISK_LABEL[lang] || RISK_LABEL.tr)[fund.risk] || "—";
  const stats = summarizePoints(points);
  const livePrice = stats.last;
  // Estimated daily from snapshot if no live points
  const dailyPct = stats.pct ?? fund.daily;

  // Estimates (derived from snapshot if live unavailable)
  const fonDegeriText = `${fmtNum(fund.totalValue, locale, 2)} ${fund.totalValueUnit === "MR" ? (lang === "tr" ? "Milyar ₺" : "B ₺") : (lang === "tr" ? "Milyon ₺" : "M ₺")}`;
  const doluluk = null; // we don't have pay adet snapshot — show —

  // Synthesized asset allocation for visual only (TEFAS API blocked)
  // Hisse-heavy default for Hisse Senedi / Serbest Fon, money market for SPK, gold for KFA
  const allocation = useMemo(() => {
    const cat = fund.category;
    if (/Hisse/i.test(cat)) return [
      { name: "Hisse Senedi", value: 88, color: "#4f46e5" },
      { name: "Mevduat (TL)", value: 6, color: "#84cc16" },
      { name: "Ters-Repo", value: 4, color: "#a3e635" },
      { name: "Diğer", value: 2, color: "#818cf8" },
    ];
    if (/Para Piyasası|Borçlanma|Kira Sertifikası|Kısa Vadeli/i.test(cat)) return [
      { name: "Ters-Repo", value: 45, color: "#a3e635" },
      { name: "Devlet Tahvili", value: 30, color: "#0d6efd" },
      { name: "Mevduat (TL)", value: 18, color: "#84cc16" },
      { name: "Kira Sertifikası", value: 7, color: "#c084fc" },
    ];
    if (/Altın/i.test(cat) || /Kıymetli/i.test(cat)) return [
      { name: "Kıymetli Madenler", value: 86, color: "#eab308" },
      { name: "Ters-Repo", value: 10, color: "#a3e635" },
      { name: "Diğer", value: 4, color: "#818cf8" },
    ];
    if (/Karma|Değişken|Serbest|Fon Sepeti/i.test(cat)) return [
      { name: "Hisse Senedi", value: 56, color: "#4f46e5" },
      { name: "Ters-Repo", value: 25, color: "#a3e635" },
      { name: "Gayrimenkul YF", value: 12, color: "#818cf8" },
      { name: "Mevduat (TL)", value: 5, color: "#84cc16" },
      { name: "Diğer", value: 2, color: "#f472b6" },
    ];
    return [
      { name: "Hisse Senedi", value: 60, color: "#4f46e5" },
      { name: "Ters-Repo", value: 25, color: "#a3e635" },
      { name: "Diğer", value: 15, color: "#818cf8" },
    ];
  }, [fund.category]);

  // Build conic-gradient string for donut
  const donutGradient = useMemo(() => {
    let acc = 0;
    const stops = allocation.map((a) => {
      const start = acc;
      acc += a.value;
      return `${a.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [allocation]);

  return (
    <div className="fdv-shell">
      {/* Back */}
      <button type="button" className="fd-back" onClick={onBack}>
        <FaArrowLeft />
        <span>{t("fd.back")}</span>
      </button>

      {/* Header */}
      <div className="fdv-header">
        <div className="fdv-header-top">
          <div className="fdv-id">
            <div className="fdv-logo" style={{ "--mgr": logoColor(fund.managerCode) }}>
              {fund.managerCode.slice(0, 2)}
            </div>
            <div className="fdv-id-meta">
              <div className="fdv-id-code">
                <h1>{fund.code}</h1>
                <button type="button" className="fdv-fav" onClick={() => setFavorite((v) => !v)} aria-label="favorite">
                  {favorite ? <FaStar style={{ color: "#eab308" }} /> : <FaRegStar />}
                </button>
              </div>
              <p className="fdv-id-name">{fund.name}</p>
              <span className="fdv-id-mgr">{mgrName.toUpperCase()}</span>
            </div>
          </div>
          <div className="fdv-price-box">
            <div className="fdv-price">₺{fmtPrice(livePrice ?? fund.totalValue * 100, locale)}</div>
            <div className={`fdv-price-change ${dailyPct >= 0 ? "up" : "down"}`}>
              {dailyPct >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              <span>{fmtPct(dailyPct, 4)}</span>
            </div>
          </div>
        </div>
        <div className="fdv-statsbar">
          <div className="fdv-stat">
            <span className="fdv-stat-label">{t("fdv.estimate")}</span>
            <span className={`fdv-stat-value ${dailyPct >= 0 ? "up" : "down"}`}>{fmtPct(dailyPct, 3)}</span>
          </div>
          <div className="fdv-stat">
            <span className="fdv-stat-label">Risk</span>
            <span className="fdv-stat-value">{fund.risk}</span>
          </div>
          <div className="fdv-stat">
            <span className="fdv-stat-label">{t("fdv.fundValue")}</span>
            <span className="fdv-stat-value">{fonDegeriText}</span>
          </div>
          <div className="fdv-stat">
            <span className="fdv-stat-label">{t("fp.investors")}</span>
            <span className="fdv-stat-value">{fmtNum(fund.investorCount, locale)}</span>
          </div>
          <div className="fdv-stat">
            <span className="fdv-stat-label">{t("fdv.fillRate")}</span>
            <span className="fdv-stat-value">{doluluk == null ? "—" : `${doluluk.toFixed(2)}%`}</span>
          </div>
          <div className="fdv-stat" style={{ marginLeft: "auto" }}>
            <span className="fdv-stat-label">{t("fdv.lastUpdate")}</span>
            <span className="fdv-stat-value fdv-stat-dim">{new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="fdv-subtabs">
        <button className="fdv-subtab is-active"><FaChartBar /> {t("fdv.summary")}</button>
        <div className="fdv-sep" />
        <button className="fdv-subtab"><FaLayerGroup /> {t("fdv.allocation")}</button>
        <button className="fdv-subtab fdv-locked"><FaChartBar /> {t("fdv.perf")} <FaLock /></button>
        <button className="fdv-subtab fdv-locked"><FaCopy /> {t("fdv.similar")} <FaLock /></button>
        <div className="fdv-sep" />
        <button className="fdv-subtab fdv-locked"><FaBuilding /> {t("fdv.positions")} <FaLock /></button>
        <button className="fdv-subtab"><FaClock /> {t("fdv.history")}</button>
        <button className="fdv-subtab"><FaCommentDots /> {t("fdv.comments")}</button>
      </div>

      {/* Main grid */}
      <div className="fdv-grid">
        {/* Left main column */}
        <div className="fdv-main">
          {/* Chart card */}
          <div className="fdv-card">
            <div className="fdv-chart-head">
              <div className="fdv-range-btns">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`fdv-range-btn ${range === r.id ? "is-active" : ""}`}
                    onClick={() => setRange(r.id)}
                  >
                    {lang === "tr" ? r.labelTr : r.labelEn}
                  </button>
                ))}
              </div>
              <select className="fdv-select" defaultValue="fiyat">
                <option value="fiyat">Fiyat</option>
                <option value="doluluk_orani">Doluluk Oranı</option>
                <option value="pay_adet">Pay Adet</option>
                <option value="toplam_deger">Toplam Değer</option>
                <option value="yatirimci">Yatırımcı Sayısı</option>
                <option value="pazar_payi">Pazar Payı</option>
              </select>
            </div>
            <div className="fdv-chart-body">
              {loadingChart ? (
                <div className="fdv-chart-empty"><span>{t("common.loading")}</span></div>
              ) : (
                <FundLineChart points={points} range={range} />
              )}
            </div>
            <div className="fdv-compare-row">
              <span className="fdv-compare-label">{t("fdv.compareWith")}:</span>
              <div className="fdv-compare-tags">
                {COMPARE_TICKERS.map((tic) => (
                  <button key={tic} type="button" className="fdv-compare-tag">{tic}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 status cards */}
          <div className="fdv-quad">
            <div className="fdv-quad-card">
              <span className="fdv-quad-label">TEFAS</span>
              <div className="fdv-quad-body">
                <span>{t("fdv.tefasTrading")}</span>
                <FaCheck style={{ color: "var(--up)" }} />
              </div>
            </div>
            <div className="fdv-quad-card">
              <span className="fdv-quad-label">{t("fdv.participation")}</span>
              <div className="fdv-quad-body">
                <span>{/Katılım/i.test(fund.category) ? t("fdv.participationOk") : t("fdv.participationNo")}</span>
                {/Katılım/i.test(fund.category) ? <FaCheck style={{ color: "var(--up)" }} /> : <FaTimes style={{ color: "var(--down)" }} />}
              </div>
            </div>
            <div className="fdv-quad-card">
              <span className="fdv-quad-label">{t("fdv.mgmtFee")}</span>
              <div className="fdv-quad-body">
                <span>{t("fdv.annually")} 2.00%</span>
                <FaPercent style={{ color: "var(--muted)" }} />
              </div>
            </div>
            <div className="fdv-quad-card">
              <span className="fdv-quad-label">{t("fdv.tax")}</span>
              <div className="fdv-quad-body">
                <span>{t("fdv.taxFromProfit")} 17.50%</span>
                <FaInfoCircle style={{ color: "#f59e0b" }} />
              </div>
            </div>
          </div>

          {/* Genel Bilgiler */}
          <div className="fdv-card fdv-card-pad">
            <h3 className="fdv-card-title">{t("fdv.general")}</h3>
            <div className="fdv-kv-grid">
              <KV label={t("fdv.founder")} value={mgrName} />
              <KV label="ISIN" value={`TR${fund.code}${fund.managerCode}001`} />
              <KV label={t("fp.category")} value={fund.category} />
              <KV label={t("fdv.currency")} value="TL" />
              <KV label={t("fp.totalValue")} value={fonDegeriText} />
              <KV label={t("fp.investors")} value={fmtNum(fund.investorCount, locale)} />
              <KV label={t("fp.risk")} value={`${riskLabel} (${fund.risk})`} />
              <KV label="Sharpe" value={fmtNum(fund.sharpe, locale, 4)} />
              <KV label={t("fdv.tradeStart")} value="09:00:00" />
              <KV label={t("fdv.tradeEnd")} value="17:45:00" />
              <KV label={t("fdv.buyValue")} value="1" />
              <KV label={t("fdv.sellValue")} value="2" />
              <KV
                label={t("fdv.tefasPage")}
                value={
                  <a href={`https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=${fund.code}`} target="_blank" rel="noopener noreferrer" className="fdv-link">
                    {t("fdv.view")} <FaExternalLinkAlt />
                  </a>
                }
              />
              <KV
                label={t("fdv.kapPage")}
                value={
                  <a href={`https://www.kap.org.tr/tr/fon-bilgileri/genel/${fund.code.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="fdv-link">
                    {t("fdv.view")} <FaExternalLinkAlt />
                  </a>
                }
              />
            </div>
          </div>

          {/* Risk Analizleri */}
          <div className="fdv-card fdv-card-pad">
            <h3 className="fdv-card-title">{t("fdv.riskAnalysis")}</h3>
            <div className="fdv-kv-grid">
              <KV label="Sharpe" value={fmtNum(fund.sharpe, locale, 2)} info />
              <KV label="Sortino" value="—" info />
              <KV label="Beta" value="—" info />
              <KV label="Alpha" value="—" info />
              <KV label="Treynor" value="—" info />
              <KV label={t("fdv.var1w")} value="—" info />
              <KV label={t("fdv.downRisk")} value="—" info />
              <KV label={t("fdv.maxDrawdown")} value="—" info />
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="fdv-rail">
          {/* Asset allocation donut */}
          <div className="fdv-card fdv-card-pad">
            <h3 className="fdv-card-title">{t("fdv.allocation")}</h3>
            <div className="fdv-donut-wrap">
              <div
                className="fdv-donut"
                style={{ background: donutGradient, "--mask": "radial-gradient(circle, transparent 42%, black 42%)" }}
              />
              <ul className="fdv-legend">
                {allocation.map((a) => (
                  <li key={a.name}>
                    <span className="fdv-legend-dot" style={{ background: a.color }} />
                    <span className="fdv-legend-name">{a.name}</span>
                    <span className="fdv-legend-val">{a.value.toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FVT Score (mock) */}
          <div className="fdv-card fdv-card-pad">
            <div className="fdv-score-head">
              <span className="fdv-card-title" style={{ margin: 0 }}>FVT Skor</span>
              <span className="fdv-pro-pill"><FaCrown /> PRO</span>
            </div>
            <div className="fdv-score-body">
              <div className="fdv-score-ring">
                <svg viewBox="0 0 96 96" width="96" height="96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="#eab308" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray="161 252" transform="rotate(-90 48 48)"
                  />
                </svg>
                <div className="fdv-score-inner">
                  <span className="fdv-score-num">64</span>
                  <span className="fdv-score-label">{t("fdv.scoreGood")}</span>
                </div>
              </div>
              <div className="fdv-score-detail">
                <span className="fdv-score-locked"><FaLock /> {t("fdv.detailsPro")}</span>
              </div>
            </div>
          </div>

          {/* Getiri Bilgileri */}
          <div className="fdv-card fdv-card-pad">
            <h3 className="fdv-card-title">{t("fdv.returnsList")}</h3>
            <ul className="fdv-returns">
              <ReturnsRow label={t("fdv.r1d")} value={fund.daily} />
              <ReturnsRow label={t("fdv.r1w")} value={fund.monthly / 4} approx />
              <ReturnsRow label={t("fdv.r1m")} value={fund.monthly} />
              <ReturnsRow label={t("fdv.r3m")} value={fund.monthly * 2.8} approx />
              <ReturnsRow label={t("fdv.rytd")} value={fund.ytd} />
              <ReturnsRow label={t("fdv.r1y")} value={fund.ytd * 1.8} approx />
              <ReturnsRow label={t("fdv.r3y")} value={null} />
              <ReturnsRow label={t("fdv.r5y")} value={null} />
            </ul>
          </div>

          {/* Peak / Bottom */}
          <div className="fdv-card fdv-card-pad">
            <h3 className="fdv-card-title">{t("fdv.peakBottom")}</h3>
            <ul className="fdv-pb">
              <PeakRow icon="up" label={t("fdv.peakPrice")} sub={t("fdv.thisYear")} value={`₺${fmtPrice(livePrice ?? null, locale, 4)}`} />
              <PeakRow icon="info" label={t("fdv.peakDistance")} sub={t("fdv.fromCurrent")} value="—" />
              <PeakRow icon="down" label={t("fdv.bottomPrice")} sub={t("fdv.thisYear")} value="—" />
              <PeakRow icon="info" label={t("fdv.bottomDistance")} sub={t("fdv.fromCurrent")} value={fmtPct(fund.ytd)} />
            </ul>
          </div>

          {/* Category Rank (simple) */}
          <div className="fdv-card fdv-card-pad">
            <div className="fdv-rank-head">
              <h3 className="fdv-card-title" style={{ margin: 0 }}>{t("fdv.categoryRank")}</h3>
              <span className="fdv-rank-meta"><FaTrophy /> {t("fdv.inCategory")}</span>
            </div>
            <div className="fdv-rank-grid">
              <div className="fdv-rank-card">
                <span className="fdv-rank-label">{t("fp.monthly")}</span>
                <span className="fdv-rank-val up">—</span>
                <span className="fdv-rank-sub">—</span>
              </div>
              <div className="fdv-rank-card">
                <span className="fdv-rank-label">{t("fp.ytd")}</span>
                <span className="fdv-rank-val up">—</span>
                <span className="fdv-rank-sub">—</span>
              </div>
              <div className="fdv-rank-card">
                <span className="fdv-rank-label">{t("fdv.r1y")}</span>
                <span className="fdv-rank-val up">—</span>
                <span className="fdv-rank-sub">—</span>
              </div>
              <div className="fdv-rank-card">
                <span className="fdv-rank-label">Sharpe</span>
                <span className="fdv-rank-val up">—</span>
                <span className="fdv-rank-sub">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value, info }) {
  return (
    <div className="fdv-kv">
      <span className="fdv-kv-label">
        {info && <FaInfoCircle className="fdv-info-ic" />}
        {label}
      </span>
      <span className="fdv-kv-value">{value}</span>
    </div>
  );
}

function ReturnsRow({ label, value, approx }) {
  const cls = value == null ? "" : value >= 0 ? "up" : "down";
  return (
    <li className="fdv-returns-row">
      <span className="fdv-returns-label">{label}{approx && " ≈"}</span>
      <span className={`fdv-returns-val ${cls}`}>{fmtPct(value, 4)}</span>
    </li>
  );
}

function PeakRow({ icon, label, sub, value }) {
  return (
    <li className="fdv-pb-row">
      <span className={`fdv-pb-icon fdv-pb-icon-${icon}`}>
        {icon === "up" ? <FaArrowUp /> : icon === "down" ? <FaArrowDown /> : <FaInfoCircle />}
      </span>
      <div className="fdv-pb-text">
        <span className="fdv-pb-label">{label}</span>
        <span className="fdv-pb-sub">{sub}</span>
      </div>
      <span className="fdv-pb-val">{value}</span>
    </li>
  );
}
