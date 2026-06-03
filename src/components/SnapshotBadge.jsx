import { FaCamera, FaBolt } from "react-icons/fa";

/**
 * Honest snapshot badge for fund pages — explains that the underlying
 * closing NAV is from a daily snapshot while the live estimate is computed
 * from real-time underlying assets (BIST + gold + FX).
 */
export default function SnapshotBadge({ snapshotDate = "11 May 2026", compact }) {
  if (compact) {
    return (
      <span
        title={`Son NAV: ${snapshotDate} kapanışı. Anlık tahmin canlı BIST/altın/döviz fiyatlarından hesaplanıyor.`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 6px",
          borderRadius: 4,
          fontSize: 9,
          fontWeight: 700,
          background: "rgba(245, 158, 11, 0.12)",
          color: "#f59e0b",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          fontFamily: "ui-monospace, JetBrains Mono, monospace",
        }}
      >
        <FaCamera style={{ fontSize: 8 }} />
        SNAPSHOT
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: "linear-gradient(90deg, rgba(245,158,11,0.08), transparent)",
        border: "1px solid rgba(245,158,11,0.2)",
        fontSize: 12,
        color: "var(--text)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "rgba(245,158,11,0.15)",
          color: "#f59e0b",
          flexShrink: 0,
        }}
      >
        <FaCamera />
      </span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
        <strong style={{ color: "#f59e0b" }}>SNAPSHOT · {snapshotDate}</strong>
        <span style={{ color: "var(--muted)" }}> — Son resmi NAV bu tarihten. </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#22c55e", fontWeight: 600 }}>
          <FaBolt style={{ fontSize: 10 }} /> Anlık tahmin canlı dayanak fiyatlarından
        </span>
      </div>
    </div>
  );
}
