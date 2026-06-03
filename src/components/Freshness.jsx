import { useEffect, useState } from "react";

/**
 * Freshness badge — pulse dot + relative time + status label.
 *
 * Props:
 *   ts       Date or ms when data was last updated (null/undefined → unknown)
 *   isOpen   bool — market is currently open (controls "live" vs "kapalı")
 *   loading  bool — spinner-ish
 *   error    bool — show offline state
 *   liveMs   ms threshold for "live" (default 8000)
 *   staleMs  ms threshold for "stale" (default 60000)
 *   label    optional override (e.g. "BIST · kapalı")
 */
export default function Freshness({
  ts,
  isOpen = true,
  loading = false,
  error = false,
  liveMs = 8000,
  staleMs = 60_000,
  label,
}) {
  const [, force] = useState(0);
  // Re-render every 5s so "5sn → 10sn → 1dk" relative time updates.
  useEffect(() => {
    const iv = setInterval(() => force((n) => n + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  let status = "closed";
  let text = "Bekliyor";
  if (error) {
    status = "offline";
    text = "Çevrimdışı";
  } else if (loading && !ts) {
    status = "stale";
    text = "Yükleniyor…";
  } else if (!isOpen) {
    status = "closed";
    text = "Kapalı";
  } else if (ts != null) {
    const ms = typeof ts === "number" ? ts : ts.getTime();
    const age = Date.now() - ms;
    if (age < liveMs) {
      status = "live";
      text = "Canlı";
    } else if (age < staleMs) {
      status = "stale";
      text = formatRel(age);
    } else {
      status = "stale";
      text = formatRel(age);
    }
  }

  return (
    <span className={`dx-fresh is-${status}`} aria-live="polite">
      <span className="dx-fresh-dot" aria-hidden />
      <span>{label || text}</span>
    </span>
  );
}

function formatRel(ms) {
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}sn önce`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}dk önce`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}sa önce`;
  return `${Math.round(ms / 86_400_000)}g önce`;
}
