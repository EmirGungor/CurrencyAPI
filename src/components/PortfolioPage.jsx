import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaChartBar,
  FaDollarSign,
  FaCrown,
  FaLock,
  FaPencilAlt,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCalendar,
  FaChevronRight,
  FaChevronLeft,
  FaPlus,
  FaGripVertical,
  FaSyncAlt,
  FaDownload,
  FaCopy,
  FaBullseye,
  FaHistory,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import { useRoute } from "../lib/router";
import {
  getPortfolios,
  computePortfolioStats,
  summarizeAll,
  hydrateRestPrices,
  setLivePrice,
  assetPriceKey,
  fmtCurrency,
  fmtPct,
  getTransactions,
  savePortfolios,
} from "../lib/portfolio";
import { subscribeTicker } from "../lib/binanceWs";
import { coinIdToBinance } from "../lib/cryptoHistory";
import AssetIcon from "./AssetIcon";
import TypePill from "./TypePill";
import AddTransactionModal from "./AddTransactionModal";
import CreatePortfolioModal from "./CreatePortfolioModal";

/* ---------- Donut SVG ---------- */
function Donut({ slices, size = 200, stroke = 28, gap = 2 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--panel-2, rgba(255,255,255,0.06))" strokeWidth={stroke} />
      {slices.map((s, i) => {
        const len = (s.value / total) * c;
        const offset = c - acc - len + gap / 2;
        const dash = `${Math.max(0, len - gap)} ${c}`;
        acc += len;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={dash}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

/* ---------- Progress Ring ---------- */
function ProgressRing({ value, size = 110, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value || 0));
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`grad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--panel-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`url(#grad-${size})`}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.7s" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#4ade80" fontSize={size * 0.18} fontWeight={700}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

/* ---------- Color palette for assets ---------- */
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#14b8a6"];

/* ---------- Live price subscriber hook ---------- */
function useLivePrices(portfolios) {
  const [, force] = useState(0);
  useEffect(() => {
    const onTick = () => force((n) => n + 1);
    window.addEventListener("crental:price-tick", onTick);
    return () => window.removeEventListener("crental:price-tick", onTick);
  }, []);

  // WS subscribe to crypto + metal symbols
  useEffect(() => {
    const unsubs = [];
    const seen = new Set();
    for (const p of portfolios) {
      for (const a of p.assets || []) {
        if (a.kind === "crypto") {
          const wsSym = coinIdToBinance(a.symbol?.toLowerCase());
          const key = assetPriceKey(a);
          if (!seen.has(wsSym)) {
            seen.add(wsSym);
            unsubs.push(subscribeTicker(wsSym, (t) => setLivePrice(key, t.close)));
          }
        } else if (a.kind === "metal") {
          const wsSym = (a.vs || "TRY").toUpperCase() === "TRY" ? "PAXGTRY" : "PAXGUSDT";
          const key = assetPriceKey(a);
          if (!seen.has(wsSym)) {
            seen.add(wsSym);
            unsubs.push(subscribeTicker(wsSym, (t) => setLivePrice(key, t.close)));
          }
        }
      }
    }
    return () => unsubs.forEach((fn) => fn && fn());
  }, [portfolios]);

  // Hydrate REST prices (stocks + funds) on mount + interval
  useEffect(() => {
    hydrateRestPrices(portfolios);
    const iv = setInterval(() => hydrateRestPrices(portfolios), 30_000);
    return () => clearInterval(iv);
  }, [portfolios]);
}

/* ---------- Page Header (FVT-style) ---------- */
function PageHead({ onNewPortfolio, canCreate = true }) {
  const { setRoute } = useRoute();
  const handler = canCreate ? onNewPortfolio : () => setRoute("pro");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title">Portföyler</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
            Yatırım portföylerini yönet ve takip et
          </p>
        </div>
        <button
          type="button"
          onClick={handler}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid",
            borderColor: canCreate ? "var(--primary)" : "var(--border)",
            background: canCreate ? "var(--primary)" : "transparent",
            color: canCreate ? "#fff" : "var(--text)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: canCreate ? "0 4px 12px rgba(124,92,255,0.25)" : "none",
          }}
        >
          {canCreate ? <FaPlus /> : <FaCrown style={{ color: "#eab308" }} />}
          {canCreate ? "Yeni Portföy" : "Pro'ya Yükselt"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Left summary rail ---------- */
function SummaryRail({ portfolios, summary }) {
  // Build slices from per-portfolio totals
  const slices = portfolios.map((p, i) => {
    const s = computePortfolioStats(p);
    return { name: p.name, value: s.value, color: p.color || COLORS[i % COLORS.length] };
  });
  return (
    <div
      className="panel"
      style={{
        position: "sticky",
        top: 16,
        background: "linear-gradient(180deg, var(--card), var(--panel-2))",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(124,58,237,0.04), transparent)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(124,58,237,0.2)",
              boxShadow: "0 0 0 2px rgba(124,58,237,0.08)",
              color: "var(--primary)",
            }}
          >
            <FaChartPie />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Portföy Özeti</h2>
            <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>{portfolios.length}/{portfolios.length} portföy</p>
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            background: summary.pnlPct >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            color: summary.pnlPct >= 0 ? "#10b981" : "#ef4444",
          }}
        >
          {summary.pnlPct >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          {fmtPct(summary.pnlPct)}
        </span>
      </div>

      {/* Donut */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "center" }}>
        <Donut slices={slices} size={200} stroke={28} />
      </div>

      {/* Weight list */}
      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Portföy / Ağırlık
          </span>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
              <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {summary.value > 0 ? ((s.value / summary.value) * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "grid", gap: 16 }}>
        <Kpi icon={<FaWallet />} label="TOPLAM DEĞER" value={fmtCurrency(summary.value)} sub={`Bugün ${fmtCurrency(summary.dayChange)}`} subColor={summary.dayChange >= 0 ? "#10b981" : "#ef4444"} big />
        <Kpi icon={<FaArrowUp />} label="KÂR / ZARAR" value={fmtCurrency(summary.pnl)} valueColor={summary.pnl >= 0 ? "#10b981" : "#ef4444"} />
        <Kpi icon={<FaChartBar />} label="GETİRİ ORANI" value={fmtPct(summary.pnlPct)} valueColor={summary.pnlPct >= 0 ? "#10b981" : "#ef4444"} />
        <Kpi icon={<FaDollarSign />} label="TOPLAM MALİYET" value={fmtCurrency(summary.cost)} />
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, sub, subColor, valueColor, big }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color: "var(--primary)", fontSize: 12, opacity: 0.6 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: big ? 24 : 18, fontWeight: 800, color: valueColor || "var(--text)", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, marginTop: 2 }}>
          <span style={{ color: "var(--muted)" }}>Bugün </span>
          <span style={{ color: subColor || "var(--text)", fontWeight: 700 }}>{fmtCurrency(Math.abs(parseFloat(sub.replace(/[^\d.\-]/g, "")) || 0))}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Pro Cüzdan Banner ---------- */
function CuzdanBanner() {
  const { setRoute } = useRoute();
  return (
    <button
      type="button"
      onClick={() => setRoute("pro")}
      className="panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        cursor: "pointer",
        textAlign: "left",
        border: "1px solid rgba(234,179,8,0.3)",
        background: "linear-gradient(90deg, rgba(234,179,8,0.06), var(--card), var(--card))",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "rgba(234,179,8,0.15)",
          boxShadow: "0 0 0 2px rgba(234,179,8,0.08)",
          color: "#eab308",
          flexShrink: 0,
        }}
      >
        <FaCrown />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Cüzdan</h3>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              background: "linear-gradient(90deg, rgba(234,179,8,0.25), rgba(234,179,8,0.1))",
              color: "#eab308",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            <FaCrown style={{ fontSize: 9 }} />
            Pro
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
          Gelir-gider takibi, bütçe yönetimi ve portföy entegrasyonu için Pro üyelik gereklidir.
        </p>
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800,
          background: "linear-gradient(90deg, rgba(234,179,8,0.25), rgba(234,179,8,0.1))",
          color: "#eab308",
          flexShrink: 0,
        }}
      >
        <FaLock style={{ fontSize: 11 }} />
        Pro'ya Yükselt
      </div>
    </button>
  );
}

/* ---------- Portfolio Card ---------- */
function PortfolioCard({ portfolio, onOpen, onEdit, onDelete }) {
  const stats = useMemo(() => computePortfolioStats(portfolio), [portfolio]);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(portfolio.id)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(portfolio.id); }}
      className="panel"
      style={{
        position: "relative",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.15)",
                boxShadow: "0 0 0 2px rgba(16,185,129,0.2)",
                color: "#10b981",
                flexShrink: 0,
                fontWeight: 800,
              }}
            >
              {portfolio.icon || <FaDollarSign />}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {portfolio.name}
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>Hedef : {portfolio.target || "—"}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            <IconBtn label="Düzenle" onClick={(e) => { e.stopPropagation(); onEdit?.(portfolio); }}>
              <FaPencilAlt />
            </IconBtn>
            <IconBtn label="Sil" danger onClick={(e) => { e.stopPropagation(); onDelete?.(portfolio); }}>
              <FaTrash />
            </IconBtn>
          </div>
        </div>

        {/* Progress ring */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
          <ProgressRing value={stats.progress} size={110} />
        </div>

        {/* Big value */}
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>{fmtCurrency(stats.value)}</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>
            <span style={{ color: "var(--muted)" }}>Bugün, </span>
            <span style={{ color: stats.dayChange >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
              {fmtCurrency(stats.dayChange)}
            </span>
            <span style={{ color: "var(--muted)" }}> {stats.dayChange >= 0 ? "↑" : "↓"} </span>
            <span style={{ color: stats.dayChange >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
              {fmtPct(stats.dayChangePct)}
            </span>
          </div>
        </div>

        {/* Motivational banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 12,
            background: stats.pnl >= 0 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
            margin: "12px 0",
          }}
        >
          <span style={{ fontSize: 18 }}>{stats.pnl >= 0 ? "📈" : "📉"}</span>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text)", opacity: 0.85 }}>
            {stats.pnl >= 0 ? "Güzel ilerliyorsun, devam et!" : "Sabırlı ol, piyasalar dalgalıdır."}
          </p>
        </div>

        {/* Stats list */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gap: 6 }}>
          <Row icon={<FaBullseye />} label="Hedef" value={fmtCurrency(portfolio.hedef)} />
          <Row icon={<FaEye />} label="Kâr / Zarar" value={`${fmtCurrency(stats.pnl)} (${fmtPct(stats.pnlPct)})`} valueColor={stats.pnl >= 0 ? "#10b981" : "#ef4444"} />
          <Row icon={<FaChartBar />} label="Maliyet" value={fmtCurrency(stats.cost)} />
          <Row icon={<FaCalendar />} label="Oluşturma Tarihi" value={portfolio.createdAt} />
        </div>

        {/* Detail link */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 2 }}>
            Detaylar
            <FaChevronRight style={{ fontSize: 9 }} />
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value, valueColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)" }}>
        <span style={{ opacity: 0.6, fontSize: 11 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <span style={{ fontWeight: 600, color: valueColor || "var(--text)" }}>{value}</span>
    </div>
  );
}

function IconBtn({ children, label, onClick, danger }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: 6,
        background: "transparent",
        border: "none",
        color: danger ? "#ef4444" : "var(--text)",
        cursor: "pointer",
        opacity: 0.6,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = "var(--panel-2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

/* ---------- Add new portfolio card ---------- */
function AddPortfolioCard({ onClick, isLocked = false }) {
  const { setRoute } = useRoute();
  if (isLocked) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setRoute("pro")}
        className="panel"
        style={{
          position: "relative",
          cursor: "pointer",
          border: "1px dashed rgba(234,179,8,0.4)",
          minHeight: 320,
        }}
      >
        <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(234,179,8,0.15)",
              boxShadow: "0 0 0 2px rgba(234,179,8,0.1)",
              color: "#eab308",
              marginBottom: 16,
            }}
          >
            <FaLock />
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              background: "linear-gradient(90deg, rgba(234,179,8,0.25), rgba(234,179,8,0.1))",
              color: "#eab308",
              marginBottom: 8,
            }}
          >
            <FaCrown /> Pro'ya Yükselt
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
            3'ten fazla portföy için Pro üyelik gereklidir
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter") onClick?.(); }}
      className="panel"
      style={{
        position: "relative",
        cursor: "pointer",
        border: "1px dashed var(--border)",
        minHeight: 320,
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)";
        e.currentTarget.style.background = "rgba(124,92,255,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "";
      }}
    >
      <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(124,92,255,0.12)",
            boxShadow: "0 0 0 2px rgba(124,92,255,0.16)",
            color: "var(--primary)",
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          <FaPlus />
        </div>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800 }}>Yeni Portföy Oluştur</h3>
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", textAlign: "center", maxWidth: 220 }}>
          Hedef belirle, varlık ekle, ilerlemeni takip et
        </p>
      </div>
    </div>
  );
}

/* ---------- Transactions panel ---------- */
function TransactionsPanel({ portfolioId, onChange }) {
  const [tick, setTick] = useState(0);
  const txs = useMemo(() => {
    const all = getTransactions(portfolioId);
    return [...all].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [portfolioId, tick]);

  const removeTx = (txId) => {
    try {
      const all = JSON.parse(localStorage.getItem("crental:transactions:v1") || "[]");
      const idx = all.findIndex((t) => t.id === txId);
      if (idx < 0) return;
      const tx = all[idx];
      // Revert position: re-apply reverse buy/sell with same qty/price
      const portfolios = getPortfolios();
      const p = portfolios.find((x) => x.id === tx.portfolioId);
      if (p) {
        const pos = p.assets?.find(
          (a) => a.kind === tx.kind && a.symbol === tx.symbol && (a.market || null) === (tx.market || null)
        );
        if (pos) {
          if (tx.type === "buy") {
            const prevCost = pos.avgCost * pos.qty;
            const removedCost = tx.price * tx.qty;
            const newQty = pos.qty - tx.qty;
            pos.qty = Math.max(0, newQty);
            pos.avgCost = newQty > 0 ? (prevCost - removedCost) / newQty : 0;
            if (pos.qty === 0) p.assets = p.assets.filter((a) => a !== pos);
          } else {
            // reverse sell: add qty back
            pos.qty = pos.qty + tx.qty;
          }
          savePortfolios(portfolios);
        }
      }
      // Remove tx entry
      all.splice(idx, 1);
      localStorage.setItem("crental:transactions:v1", JSON.stringify(all));
      setTick((n) => n + 1);
      onChange?.();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="panel">
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FaHistory style={{ color: "var(--primary)" }} />
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>İşlem Geçmişi</h3>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{txs.length} işlem</span>
        </div>
      </div>

      {txs.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          <FaHistory style={{ fontSize: 24, opacity: 0.4, marginBottom: 10 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Henüz işlem yok</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            + İşlem Ekle butonuyla alış/satış kaydı oluştur.
          </div>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl-finance">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tür</th>
                <th>Varlık</th>
                <th className="col-num-h">Miktar</th>
                <th className="col-num-h">Fiyat</th>
                <th className="col-num-h">Toplam</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => {
                const total = (tx.qty || 0) * (tx.price || 0);
                const isBuy = tx.type === "buy";
                const sym = tx.vs === "USD" ? "$" : tx.vs === "EUR" ? "€" : "₺";
                return (
                  <tr key={tx.id}>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{tx.date}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          background: isBuy ? "rgba(34,197,94,0.14)" : "rgba(239,68,68,0.14)",
                          color: isBuy ? "#22c55e" : "#ef4444",
                          textTransform: "uppercase",
                        }}
                      >
                        {isBuy ? <FaArrowDown style={{ fontSize: 9 }} /> : <FaArrowUp style={{ fontSize: 9 }} />}
                        {isBuy ? "Alış" : "Satış"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <AssetIcon kind={tx.kind} symbol={tx.symbol} size={22} />
                        <span style={{ fontWeight: 700 }}>{tx.symbol}</span>
                        <TypePill kind={tx.kind} market={tx.market} />
                      </div>
                    </td>
                    <td className="col-num">{(tx.qty || 0).toLocaleString("tr-TR", { maximumFractionDigits: 6 })}</td>
                    <td className="col-num">{sym}{(tx.price || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                    <td className="col-num" style={{ fontWeight: 700, color: isBuy ? "var(--text)" : "#22c55e" }}>
                      {sym}{total.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button
                        type="button"
                        title="İşlemi Sil"
                        onClick={() => {
                          if (window.confirm("Bu işlemi silmek istiyor musun? Pozisyon geri alınacak.")) {
                            removeTx(tx.id);
                          }
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "none",
                          background: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                          opacity: 0.6,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.background = "transparent"; }}
                      >
                        <FaTrash style={{ fontSize: 11 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Detail view ---------- */
function PortfolioDetail({ portfolio, onBack, onChange }) {
  const stats = useMemo(() => computePortfolioStats(portfolio), [portfolio]);
  const slices = stats.positions.map((p, i) => ({ name: p.symbol, value: p.value, color: COLORS[i % COLORS.length] }));
  const [tab, setTab] = useState("ozet");
  const [txModalOpen, setTxModalOpen] = useState(false);
  const TABS = ["Özet", "İşlemler", "Kapalı Pozisyonlar", "Geçmiş", "AI Analiz", "Hedef Dağılım", "Temettü", "Strateji", "Risk"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="portfolio-detail">
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12,
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        <FaChevronLeft /> Portföylere Dön
      </button>

      <div className="portfolio-detail-grid">
        {/* Left rail */}
        <div className="panel" style={{ height: "fit-content", position: "sticky", top: 16 }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "var(--panel-2)" }}>
                <FaWallet />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{portfolio.name}</h2>
                <p style={{ margin: 0, fontSize: 11, color: "var(--muted)" }}>{stats.positions.length} varlık</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, opacity: 0.6 }}>
              <IconBtn label="Gizle"><FaEyeSlash /></IconBtn>
              <IconBtn label="İndir"><FaDownload /></IconBtn>
              <IconBtn label="Kopyala"><FaCopy /></IconBtn>
              <IconBtn label="Düzenle"><FaPencilAlt /></IconBtn>
              <IconBtn label="Sil" danger><FaTrash /></IconBtn>
            </div>
          </div>

          <div style={{ padding: "16px 20px", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
              <span>PORTFÖY DEĞERİ</span>
              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                <FaSyncAlt style={{ fontSize: 9 }} />
              </span>
              <span style={{ padding: "3px 8px", borderRadius: 6, background: "var(--panel-2)", color: "var(--text)" }}>₺ TRY</span>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>{fmtCurrency(stats.value)}</div>
              <div style={{ fontSize: 12, color: stats.dayChange >= 0 ? "#10b981" : "#ef4444", marginTop: 2 }}>
                {fmtCurrency(stats.dayChange)} ({fmtPct(stats.dayChangePct)}) <span style={{ color: "var(--muted)" }}>bugün</span>
              </div>
              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>
                tahmini: {fmtCurrency(stats.dayChange * -1.7)} ({fmtPct(stats.dayChangePct * -1.7)})
              </div>
            </div>

            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 8 }}>VARLIK DAĞILIMI</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Donut slices={slices} size={180} stroke={26} />
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                SEMBOL / AĞIRLIK
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {stats.positions.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: slices[i]?.color, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{p.symbol}</span>
                    <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {p.weight.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeframe placeholders */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginTop: 12 }}>
              {["1H", "1A", "3A", "6A", "1Y"].map((r) => (
                <div key={r} style={{ padding: "8px 4px", borderRadius: 8, background: "var(--panel-2)", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{r}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>N/A</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gap: 8 }}>
              <Row icon={<FaArrowUp />} label="Açık K/Z" value={`${fmtCurrency(stats.pnl)} (${fmtPct(stats.pnlPct)})`} valueColor={stats.pnl >= 0 ? "#10b981" : "#ef4444"} />
              <Row icon={<FaArrowUp />} label="Gerçekleşen K/Z" value="₺1.111,11" valueColor="#10b981" />
              <Row icon={<FaDollarSign />} label="Maliyet" value={fmtCurrency(stats.cost)} />
              <Row icon={<FaWallet />} label="Cüzdan" value="₺0,00" />
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <FaBullseye style={{ color: "var(--muted)" }} />
                  <span>Hedef</span>
                </div>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{Math.round(stats.progress)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--panel-2)", overflow: "hidden" }}>
                <div style={{ width: `${stats.progress}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #4ade80)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--muted)" }}>
                <span>{fmtCurrency(stats.value)}</span>
                <span>{fmtCurrency(portfolio.hedef)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTxModalOpen(true)}
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                background: "var(--primary)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124,92,255,0.25)",
              }}
            >
              <FaPlus /> İşlem Ekle
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ display: "grid", gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t.toLowerCase().replace(/\s+/g, "-"))}
                style={{
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  borderBottom: tab === t.toLowerCase().replace(/\s+/g, "-") ? "2px solid var(--primary)" : "2px solid transparent",
                  color: tab === t.toLowerCase().replace(/\s+/g, "-") ? "var(--text)" : "var(--muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Transactions tab content */}
          {tab === "i̇şlemler" || tab === "işlemler" ? (
            <TransactionsPanel portfolioId={portfolio.id} onChange={onChange} />
          ) : null}

          {/* Other-tab placeholder content */}
          {tab !== "özet" && tab !== "ozet" && tab !== "i̇şlemler" && tab !== "işlemler" && (
            <div className="panel">
              <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>
                <FaCrown style={{ fontSize: 28, color: "#eab308", marginBottom: 10 }} />
                <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                  Bu sekme Pro üyelere özel
                </h3>
                <p style={{ margin: 0, fontSize: 13 }}>
                  Detaylı analiz, AI öneriler ve risk göstergeleri Pro üyelikte aktiftir.
                </p>
              </div>
            </div>
          )}

          {/* Positions table — only on Özet tab */}
          {(tab === "özet" || tab === "ozet") && (
          <div className="panel">
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaChartPie style={{ color: "var(--primary)" }} />
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Pozisyonlar</h3>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{stats.positions.length} varlık</span>
                <button
                  type="button"
                  onClick={() => setTxModalOpen(true)}
                  style={{
                    marginLeft: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "var(--primary)",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <FaPlus style={{ fontSize: 10 }} /> İşlem Ekle
                </button>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  style={{ padding: "4px 10px", borderRadius: 6, background: "var(--panel-2)", border: "1px solid var(--border)", fontSize: 11, color: "var(--text)" }}
                >
                  ≡ Liste
                </button>
                <button
                  type="button"
                  style={{ padding: "4px 10px", borderRadius: 6, background: "transparent", border: "1px solid var(--border)", fontSize: 11, color: "var(--muted)" }}
                >
                  ⊞ Kategori
                </button>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl-finance">
                <thead>
                  <tr>
                    <th className="col-sticky">Varlık</th>
                    <th className="col-num-h">Adet</th>
                    <th className="col-num-h">Ort. Maliyet</th>
                    <th className="col-num-h">Fiyat</th>
                    <th className="col-num-h">Değer</th>
                    <th className="col-num-h">K/Z</th>
                    <th className="col-num-h">K/Z %</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.positions.map((p, i) => (
                    <tr key={i}>
                      <td className="col-sticky">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <AssetIcon kind={p.kind} symbol={p.symbol} size={28} />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 700 }}>{p.symbol}</span>
                              <TypePill kind={p.kind} market={p.market} />
                            </div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>
                              {p.kind === "fund" ? "TRY · Yatırım Fonu" : p.kind === "crypto" ? `${p.symbol}/USD` : p.kind === "metal" ? "Altın" : p.market === "bist" ? "BIST" : "NASDAQ"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="col-num">
                        {(p.qty || 0).toLocaleString("tr-TR", { maximumFractionDigits: 6 })}
                      </td>
                      <td className="col-num">
                        <div>{fmtCurrency(p.avgCost)}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmtCurrency(p.cost)}</div>
                      </td>
                      <td className="col-num">
                        <div style={{ color: "#f59e0b" }}>{fmtCurrency(p.price)}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>Tahmini</div>
                      </td>
                      <td className="col-num">
                        <div style={{ fontWeight: 700 }}>{fmtCurrency(p.value)}</div>
                        <div style={{ fontSize: 11, color: p.pnl >= 0 ? "#10b981" : "#ef4444" }}>
                          {fmtCurrency(p.pnl)} (bugün)
                        </div>
                      </td>
                      <td className="col-num" style={{ color: p.pnl >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                        {fmtCurrency(p.pnl)}
                      </td>
                      <td className="col-num">
                        <span style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: p.pnlPct >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                          color: p.pnlPct >= 0 ? "#10b981" : "#ef4444",
                        }}>
                          {fmtPct(p.pnlPct)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="col-sticky" colSpan={4} style={{ fontWeight: 700 }}>Toplam</td>
                    <td className="col-num" style={{ fontWeight: 700 }}>{fmtCurrency(stats.value)}</td>
                    <td className="col-num" style={{ fontWeight: 700, color: stats.pnl >= 0 ? "#10b981" : "#ef4444" }}>{fmtCurrency(stats.pnl)}</td>
                    <td className="col-num">
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        background: stats.pnlPct >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                        color: stats.pnlPct >= 0 ? "#10b981" : "#ef4444",
                      }}>
                        {fmtPct(stats.pnlPct)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        open={txModalOpen}
        portfolioId={portfolio.id}
        onClose={() => setTxModalOpen(false)}
        onSaved={() => { setTxModalOpen(false); onChange?.(); }}
      />
    </div>
  );
}

/* ---------- Main page export ---------- */
export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState(() => getPortfolios());
  const [detailId, setDetailId] = useState(null);
  useLivePrices(portfolios);

  const summary = useMemo(() => summarizeAll(portfolios), [portfolios]);
  const detailP = detailId ? portfolios.find((p) => p.id === detailId) : null;

  // Storage sync (in case other tabs add)
  useEffect(() => {
    const onStorage = () => setPortfolios(getPortfolios());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = () => setPortfolios(getPortfolios());
  const [createOpen, setCreateOpen] = useState(false);
  const FREE_LIMIT = 3;
  const canCreate = portfolios.length < FREE_LIMIT;
  const handleNew = () => {
    if (canCreate) setCreateOpen(true);
  };

  if (detailP) {
    return <PortfolioDetail portfolio={detailP} onBack={() => setDetailId(null)} onChange={refresh} />;
  }

  return (
    <>
      <div className="portfolio-grid">
        <div className="portfolio-rail">
          <SummaryRail portfolios={portfolios} summary={summary} />
        </div>
        <div className="portfolio-main">
          <PageHead onNewPortfolio={handleNew} canCreate={canCreate} />
          <CuzdanBanner />
          <div className="portfolio-cards">
            {portfolios.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                onOpen={(id) => setDetailId(id)}
              />
            ))}
            <AddPortfolioCard isLocked={!canCreate} onClick={handleNew} />
          </div>
        </div>
      </div>

      <CreatePortfolioModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => { refresh(); setDetailId(id); }}
      />
    </>
  );
}
