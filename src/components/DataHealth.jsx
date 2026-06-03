import { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { getHealth } from "../lib/dataCache";

const FEEDS = [
  { id: "fx", label: "FX" },
  { id: "crypto", label: "Crypto" },
  { id: "metal", label: "Gold" },
  { id: "bist", label: "BIST" },
  { id: "us", label: "NASDAQ" },
];

const STALE_MS = 5 * 60_000;

export default function DataHealth() {
  const [health, setHealth] = useState(() => getHealth());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onUpdate = () => setHealth(getHealth());
    window.addEventListener("crental:data-health", onUpdate);
    const tick = setInterval(onUpdate, 5000);
    return () => {
      window.removeEventListener("crental:data-health", onUpdate);
      clearInterval(tick);
    };
  }, []);

  const now = Date.now();
  const feedStatus = (id) => {
    const h = health[id];
    if (!h) return { color: "#64748b", state: "idle" };
    if (!h.ok) return { color: "#ef4444", state: "error" };
    if (now - h.ts > STALE_MS) return { color: "#eab308", state: "stale" };
    return { color: "#22c55e", state: "ok" };
  };

  const summary = (() => {
    let ok = 0, err = 0, stale = 0;
    for (const f of FEEDS) {
      const s = feedStatus(f.id).state;
      if (s === "ok") ok++;
      else if (s === "error") err++;
      else if (s === "stale") stale++;
    }
    if (err > 0) return { color: "#ef4444", text: `${err} hata` };
    if (stale > 0) return { color: "#eab308", text: "bayat" };
    if (ok > 0) return { color: "#22c55e", text: "canlı" };
    return { color: "#64748b", text: "—" };
  })();

  return (
    <div className="data-health" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="topbar-icon-btn"
        aria-label="Data feed health"
        title="Veri kaynakları durumu"
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}
      >
        <FaCircle style={{ fontSize: 8, color: summary.color }} />
        <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {summary.text}
        </span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 220,
            padding: 12,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 50,
          }}
        >
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            Veri Kaynakları
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {FEEDS.map((f) => {
              const h = health[f.id];
              const st = feedStatus(f.id);
              const age = h ? Math.max(0, Math.round((now - h.ts) / 1000)) : null;
              const ageLabel = age == null ? "—" : age < 60 ? `${age}s` : age < 3600 ? `${Math.round(age / 60)}d` : `${Math.round(age / 3600)}sa`;
              return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaCircle style={{ fontSize: 8, color: st.color }} />
                    <span style={{ fontWeight: 600 }}>{f.label}</span>
                  </div>
                  <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                    {st.state === "error" ? "hata" : ageLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
