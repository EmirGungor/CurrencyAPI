import { useMemo } from "react";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSelection } from "../lib/selection";
import { FUND_LIST, MANAGER_NAMES } from "../lib/funds";
import BigChart from "./BigChart";

const RISK_TONE = (r) => {
  if (r == null) return "muted";
  if (r <= 2) return "success";
  if (r <= 4) return "warning";
  return "danger";
};

const RISK_LABEL = {
  tr: ["", "Çok Düşük", "Düşük", "Orta-Düşük", "Orta", "Orta-Yüksek", "Yüksek", "Çok Yüksek"],
  en: ["", "Very Low", "Low", "Med-Low", "Medium", "Med-High", "High", "Very High"],
};

const fmtNum = (n, locale, dp = 0) =>
  n == null ? "—" : n.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });

const fmtPct = (n) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}%`);

function MetricCard({ label, value, sub, tone }) {
  return (
    <div className={`fd-metric ${tone ? `fd-metric-${tone}` : ""}`}>
      <span className="fd-metric-label">{label}</span>
      <span className="fd-metric-value">{value}</span>
      {sub && <span className="fd-metric-sub">{sub}</span>}
    </div>
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
  const riskTone = RISK_TONE(fund.risk);
  const riskLabel = (RISK_LABEL[lang] || RISK_LABEL.tr)[fund.risk] || "—";

  return (
    <div className="fd-shell">
      {/* Header */}
      <div className="fd-header">
        <button type="button" className="fd-back" onClick={onBack}>
          <FaArrowLeft />
          <span>{t("fd.back")}</span>
        </button>
        <div className="fd-title-row">
          <div className="fd-mgr-logo-lg" style={{ "--mgr": logoColor(fund.managerCode) }}>
            {fund.managerCode.slice(0, 2)}
          </div>
          <div className="fd-title-meta">
            <div className="fd-code-row">
              <span className="fd-code">{fund.code}</span>
              <span className="fd-tefas-badge">
                <FaCheck /> TEFAS
              </span>
              <span className={`fp-risk fp-risk-${riskTone}`}>{fund.risk}</span>
              <span className="fd-risk-label">{riskLabel}</span>
            </div>
            <h2 className="fd-name">{fund.name}</h2>
            <div className="fd-sub">
              <span>{mgrName}</span>
              <span className="fd-sep">·</span>
              <span>{fund.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className="fd-metrics">
        <MetricCard
          label={t("fp.daily")}
          value={fmtPct(fund.daily)}
          tone={fund.daily >= 0 ? "up" : "down"}
        />
        <MetricCard
          label={t("fp.monthly")}
          value={fmtPct(fund.monthly)}
          tone={fund.monthly >= 0 ? "up" : "down"}
        />
        <MetricCard
          label={t("fp.ytd")}
          value={fmtPct(fund.ytd)}
          tone={fund.ytd >= 0 ? "up" : "down"}
        />
        <MetricCard
          label={t("fp.investors")}
          value={fmtNum(fund.investorCount, locale)}
          sub={t("fd.activeInvestors")}
        />
        <MetricCard
          label={t("fp.totalValue")}
          value={`₺${fmtNum(fund.totalValue, locale, 2)}`}
          sub={fund.totalValueUnit === "MR" ? t("fd.billion") : t("fd.million")}
        />
        <MetricCard
          label="Sharpe"
          value={fmtNum(fund.sharpe, locale, 4)}
          sub={t("fd.riskAdj")}
        />
      </div>

      {/* Chart */}
      <BigChart />

      {/* Description box */}
      <div className="panel fd-info-panel">
        <div className="panel-head">
          <span className="panel-title">{t("fd.aboutFund")}</span>
        </div>
        <div className="panel-body">
          <dl className="fd-dl">
            <dt>{t("fp.fund")}</dt>
            <dd>{fund.name}</dd>
            <dt>{t("fd.manager")}</dt>
            <dd>{mgrName}</dd>
            <dt>{t("fp.category")}</dt>
            <dd>{fund.category}</dd>
            <dt>{t("fp.risk")}</dt>
            <dd>
              <span className={`fp-risk fp-risk-${riskTone}`}>{fund.risk}</span>
              <span style={{ marginLeft: 8 }}>{riskLabel}</span>
            </dd>
            <dt>TEFAS</dt>
            <dd><FaCheck style={{ color: "var(--up)" }} /> {t("fd.tefasAvailable")}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

function logoColor(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 65% 55%)`;
}
