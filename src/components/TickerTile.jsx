import { useEffect, useRef, useState } from "react";
import { seedOrSnapshot } from "../lib/feeds";

/**
 * Single ticker tile. Subscribes to a feed (provided as `subscribe` prop)
 * and renders price + change% + sparkline. Briefly flashes on price change.
 *
 * Props:
 *   sym, name, icon, gradient        — display identity
 *   currency                         — "$" "₺" "€" "" — prefix on price
 *   decimals                         — number of decimals to format
 *   subscribe(cb)                    — fn that returns an unsubscribe
 *   cacheKey                         — localStorage snapshot key (instant seed on mount)
 *   alwaysLive                       — bool: render LIVE dot regardless of market hours
 *   isOpen                           — bool: market is open right now (drives LIVE/closed pill when not alwaysLive)
 *   staleMs                          — age after which a value is considered stale (default 120s)
 */
export default function TickerTile({
  sym,
  name,
  icon,
  gradient = "linear-gradient(135deg, #7c5cff, #2cc6ff)",
  currency = "",
  decimals = 2,
  subscribe,
  cacheKey,
  alwaysLive = false,
  isOpen = true,
  staleMs = 120_000,
}) {
  // Seed synchronously from the persisted snapshot so the tile paints a real
  // price on the very first render — never an empty skeleton if we've ever
  // seen this ticker before.
  const seed = cacheKey ? seedOrSnapshot(cacheKey) : null;
  const [price, setPrice] = useState(seed?.price ?? null);
  const [changePct, setChangePct] = useState(seed?.changePct ?? null);
  const [sparkline, setSparkline] = useState(null);
  const [ts, setTs] = useState(seed?.ts ?? null);
  const [flash, setFlash] = useState(null);
  const prevPriceRef = useRef(seed?.price ?? null);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    if (!subscribe) return;
    const un = subscribe((data) => {
      if (data.sparkline) setSparkline(data.sparkline);
      if (Number.isFinite(data.price)) {
        const prev = prevPriceRef.current;
        setPrice(data.price);
        if (prev != null && prev !== data.price) {
          setFlash(data.price > prev ? "up" : "down");
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
          flashTimerRef.current = setTimeout(() => setFlash(null), 900);
        }
        prevPriceRef.current = data.price;
      }
      if (Number.isFinite(data.changePct)) setChangePct(data.changePct);
      if (data.ts) setTs(data.ts);
    });
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      un?.();
    };
  }, [subscribe]);

  const hasData = Number.isFinite(price);
  const isStale = ts != null && Date.now() - ts > staleMs;
  // Live dot:
  //   crypto (alwaysLive): live unless data is stale
  //   markets: open → live (or stale if data old); closed → "Kapalı" w/ last close
  const liveCls = alwaysLive
    ? isStale
      ? "is-stale"
      : "is-live"
    : !isOpen
    ? ""
    : isStale
    ? "is-stale"
    : "is-live";
  const liveLabel = alwaysLive
    ? isStale
      ? "Gecikmeli"
      : "Canlı"
    : !isOpen
    ? "Kapalı"
    : isStale
    ? "Gecikmeli"
    : "Canlı";

  const fmtPrice = (v) => {
    if (v == null) return null;
    return v.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const up = (changePct ?? 0) > 0;
  const down = (changePct ?? 0) < 0;
  const changeCls = changePct == null ? "flat" : up ? "up" : down ? "down" : "flat";

  return (
    <article className="tile glass">
      <div className="tile-head">
        <div className="tile-id">
          <span className="tile-icon" style={{ background: gradient }}>
            {icon}
          </span>
          <span className="tile-meta">
            <span className="tile-sym">{sym}</span>
            <span className="tile-name">{name}</span>
          </span>
        </div>
        <span className={`live-dot ${liveCls}`}>{liveLabel}</span>
      </div>

      <div className={`tile-price ${flash ? `flash-${flash}` : ""} ${!hasData ? "is-placeholder" : ""}`}>
        {!hasData ? (
          <span className="skel" style={{ width: 110, height: 24 }} />
        ) : (
          <>{currency}{fmtPrice(price)}</>
        )}
      </div>

      <div className="tile-row">
        <span className={`tile-change ${changeCls}`}>
          {changePct == null ? "—" : `${up ? "+" : ""}${changePct.toFixed(2)}%`}
        </span>
        {sparkline && sparkline.length > 1 && (
          <Sparkline values={sparkline} up={up} down={down} />
        )}
      </div>
    </article>
  );
}

/* --------- inline sparkline (no library) ---------- */
function Sparkline({ values, up, down }) {
  const W = 80;
  const H = 26;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = W / (values.length - 1);
  const d = values
    .map((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = up ? "var(--up)" : down ? "var(--down)" : "var(--muted)";
  return (
    <svg className="tile-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
