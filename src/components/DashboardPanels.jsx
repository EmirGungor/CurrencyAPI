import {
  FaRocket,
  FaMoneyBillWave,
  FaBriefcase,
  FaUsers,
  FaCrown,
  FaArrowRight,
  FaCommentDots,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import { useRoute } from "../lib/router";
import { useSelection } from "../lib/selection";
import AssetIcon from "./AssetIcon";
import TypePill from "./TypePill";

function Panel({ title, icon, action, children, padded = true }) {
  return (
    <div className="panel">
      <div
        className="panel-head"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ color: "var(--primary)" }}>{icon}</span>}
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="panel-body" style={padded ? { padding: 16 } : { padding: 0 }}>{children}</div>
    </div>
  );
}

/* ---------------- Halka Arz Teaser ---------------- */
const IPO_TEASER = [
  { code: "AKDMR", name: "Akademi Demir Çelik", date: "15 May", status: "active" },
  { code: "TKNLJ", name: "Teknoloji Holdings", date: "22 May", status: "upcoming" },
  { code: "TARMK", name: "Tarımak Tarım", date: "03 Haz", status: "upcoming" },
];
export function IpoTeaser() {
  const { setRoute } = useRoute();
  const labels = { active: "Aktif", upcoming: "Yakında", closed: "Kapandı" };
  const colors = { active: "#22c55e", upcoming: "#eab308", closed: "#94a3b8" };
  return (
    <Panel
      title="Halka Arz"
      icon={<FaRocket />}
      action={
        <button
          type="button"
          onClick={() => setRoute("ipo")}
          style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
        >
          Tümü <FaArrowRight style={{ fontSize: 10 }} />
        </button>
      }
    >
      <div style={{ display: "grid", gap: 8 }}>
        {IPO_TEASER.map((r) => (
          <div
            key={r.code}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
              gap: 10,
              alignItems: "center",
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--panel-2)",
              fontSize: 12,
            }}
          >
            <strong style={{ fontSize: 13 }}>{r.code}</strong>
            <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.name}
            </span>
            <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{r.date}</span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 999,
                background: `${colors[r.status]}22`,
                color: colors[r.status],
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {labels[r.status]}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------- Sermaye & Temettü Teaser ---------------- */
const DIV_TEASER = [
  { code: "AKBNK", rate: "%34,5", date: "14 May" },
  { code: "GARAN", rate: "%41,0", date: "19 May" },
  { code: "TUPRS", rate: "%67,8", date: "02 Haz" },
];
export function DividendsTeaser() {
  const { setRoute } = useRoute();
  return (
    <Panel
      title="Sermaye & Temettü"
      icon={<FaMoneyBillWave />}
      action={
        <button
          type="button"
          onClick={() => setRoute("dividends")}
          style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
        >
          Tümü <FaArrowRight style={{ fontSize: 10 }} />
        </button>
      }
    >
      <div style={{ display: "grid", gap: 8 }}>
        {DIV_TEASER.map((r) => (
          <div
            key={r.code}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--panel-2)",
              fontSize: 12,
            }}
          >
            <strong style={{ fontSize: 13 }}>{r.code}</strong>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>{r.rate}</span>
            <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{r.date}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------- PRO Upsell Banner ---------------- */
export function ProBanner() {
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
        padding: "12px 18px",
        textAlign: "left",
        cursor: "pointer",
        border: "1px solid rgba(124,58,237,0.4)",
        background: "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(124,58,237,0.02))",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "var(--primary)",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <FaCrown />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Crental PRO'ya geç, anlık veriye eriş</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Sınırsız favori · Gelişmiş teknik analiz · Reklamsız · API erişimi
        </div>
      </div>
      <span
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          background: "var(--primary)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        PRO Ol
      </span>
    </button>
  );
}

/* ---------------- Portföy Özeti ---------------- */
export function PortfolioSummary() {
  const { setRoute } = useRoute();
  const { setSelection } = useSelection();
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("crental:favorites:v1") || "[]");
  } catch {
    saved = [];
  }
  // If empty, show suggestions
  const suggestions = [
    { kind: "crypto", symbol: "BTC", coinId: "bitcoin", vs: "USD", label: "BTC/USD" },
    { kind: "forex", from: "USD", to: "TRY", label: "USD/TRY" },
    { kind: "metal", unit: "gram", vs: "TRY", label: "Gram Altın" },
    { kind: "stock", market: "bist", symbol: "THYAO", label: "THYAO" },
  ];
  const list = saved.length > 0 ? saved : suggestions;

  return (
    <Panel
      title="Portföy Özeti"
      icon={<FaBriefcase />}
      action={
        <button
          type="button"
          onClick={() => setRoute(saved.length > 0 ? "portfolio" : "favorites")}
          style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 12 }}
        >
          {saved.length > 0 ? "Detay →" : "Düzenle →"}
        </button>
      }
    >
      {saved.length === 0 && (
        <div style={{ marginBottom: 10, fontSize: 11, color: "var(--muted)" }}>
          Önerilen takip listesi:
        </div>
      )}
      <div style={{ display: "grid", gap: 6 }}>
        {list.slice(0, 5).map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setSelection(f);
              setRoute(f.kind === "crypto" ? "crypto" : f.kind === "stock" && f.market === "bist" ? "stocks" : "gold-fx");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel-2)",
              color: "var(--text)",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 12,
            }}
          >
            <AssetIcon
              kind={f.kind}
              symbol={f.symbol || f.from}
              from={f.from}
              size={20}
            />
            <span style={{ fontWeight: 600, flex: 1 }}>{f.label}</span>
            <TypePill kind={f.kind} market={f.market} />
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------- Toplulukta Konuşulanlar ---------------- */
const COMMUNITY = [
  { user: "Murat D.", action: "yorumladı", topic: "THYAO", time: "5dk", up: true },
  { user: "Ayşe K.", action: "paylaştı", topic: "BTC Analizi", time: "12dk", up: true },
  { user: "Ahmet Y.", action: "uyardı", topic: "GARAN", time: "23dk", up: false },
  { user: "Selin A.", action: "tartıştı", topic: "USD/TRY beklentisi", time: "45dk", up: true },
  { user: "Can E.", action: "yorumladı", topic: "Altın hedefi", time: "1sa", up: true },
];
export function CommunityFeed() {
  const { setRoute } = useRoute();
  return (
    <Panel
      title="Toplulukta Konuşulanlar"
      icon={<FaUsers />}
      action={
        <button
          type="button"
          onClick={() => setRoute("community")}
          style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: 12 }}
        >
          Tümü →
        </button>
      }
    >
      <div style={{ display: "grid", gap: 8 }}>
        {COMMUNITY.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--panel-2)",
              fontSize: 12,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: c.up ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                color: c.up ? "#22c55e" : "#ef4444",
                fontSize: 10,
                flexShrink: 0,
              }}
            >
              {c.up ? <FaArrowUp /> : <FaArrowDown />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <strong>{c.user}</strong>{" "}
                <span style={{ color: "var(--muted)" }}>{c.action}</span>{" "}
                <strong>{c.topic}</strong>
              </div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 11, flexShrink: 0 }}>
              <FaCommentDots style={{ marginRight: 4 }} />
              {c.time}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
