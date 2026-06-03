/**
 * Asset type pill — colored badge for at-a-glance classification.
 * Variants: crypto / stock / fund / metal / forex / index
 */

const VARIANTS = {
  crypto: { bg: "rgba(245, 158, 11, 0.14)", fg: "#f59e0b", label: "CRYPTO" },
  stock:  { bg: "rgba(34, 197, 94, 0.14)",  fg: "#22c55e", label: "STOCK" },
  bist:   { bg: "rgba(239, 68, 68, 0.14)",  fg: "#ef4444", label: "BIST" },
  fund:   { bg: "rgba(99, 102, 241, 0.14)", fg: "#818cf8", label: "FUND" },
  metal:  { bg: "rgba(234, 179, 8, 0.14)",  fg: "#eab308", label: "METAL" },
  forex:  { bg: "rgba(14, 165, 233, 0.14)", fg: "#38bdf8", label: "FOREX" },
  index:  { bg: "rgba(139, 92, 246, 0.14)", fg: "#a78bfa", label: "INDEX" },
  etf:    { bg: "rgba(20, 184, 166, 0.14)", fg: "#2dd4bf", label: "ETF" },
};

export default function TypePill({ kind, market, label }) {
  let key = (kind || "").toLowerCase();
  // BIST stocks get a distinct red pill
  if (key === "stock" && (market || "").toLowerCase() === "bist") key = "bist";
  const v = VARIANTS[key];
  if (!v) return null;
  const text = label || v.label;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        background: v.bg,
        color: v.fg,
        verticalAlign: "middle",
        fontFamily: "ui-monospace, JetBrains Mono, monospace",
      }}
    >
      {text}
    </span>
  );
}
