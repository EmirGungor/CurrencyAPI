import { useEffect, useRef, useState } from "react";

/**
 * TickValue — animates value changes with a brief background flash + count-up.
 *
 * Props:
 *   value     number — current value
 *   format    fn(num) → string (default: toLocaleString tr-TR with 2 decimals)
 *   prefix    string to prepend (e.g. "₺", "$")
 *   suffix    string to append (e.g. "%")
 *   threshold minimum relative change to trigger flash, default 0.0005 (0.05%)
 *   duration  count-up duration ms, default 380
 *   className extra classes
 */
export default function TickValue({
  value,
  format,
  prefix = "",
  suffix = "",
  threshold = 0,
  duration = 380,
  className = "",
}) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(null); // 'up' | 'down' | null
  const prevRef = useRef(value);
  const rafRef = useRef(null);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    if (!Number.isFinite(value)) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }
    const prev = prevRef.current;
    const start = Number.isFinite(prev) ? prev : value;
    const end = value;
    const delta = end - start;
    const rel = Math.abs(start) > 0 ? Math.abs(delta) / Math.abs(start) : Math.abs(delta);

    // Skip animation if change is too small (avoids jitter from WS sub-cent ticks)
    if (rel < threshold || start === end) {
      setDisplay(end);
      prevRef.current = end;
      return;
    }

    // Count-up
    const t0 = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = start + delta * eased;
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    // Flash
    setFlash(delta >= 0 ? "up" : "down");
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 900);

    prevRef.current = end;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [value, duration, threshold]);

  const fmt = format || defaultFormat;
  const text = Number.isFinite(display) ? `${prefix}${fmt(display)}${suffix}` : "—";

  return (
    <span
      className={[
        "dx-tick",
        flash === "up" && "is-flash-up",
        flash === "down" && "is-flash-down",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {text}
    </span>
  );
}

function defaultFormat(v) {
  return v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
