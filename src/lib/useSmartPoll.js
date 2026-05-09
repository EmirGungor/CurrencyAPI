import { useEffect, useRef, useState } from "react";

/**
 * Polls `fn` on an interval that depends on whether the relevant market is
 * "open". Pauses when the document is hidden, resumes on visibility return.
 *
 * @param {() => unknown} fn - data loader
 * @param {object} opts
 * @param {() => boolean} opts.isOpen - market-open predicate
 * @param {number} opts.openMs - poll interval when open (ms)
 * @param {number} [opts.closedMs] - poll interval when closed (ms). 0/undefined => paused
 * @param {ReadonlyArray<unknown>} [opts.deps] - extra deps to re-arm the poll
 */
export function useSmartPoll(fn, { isOpen, openMs, closedMs = 0, deps = [] }) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [open, setOpen] = useState(() => !!isOpen());
  const [hidden, setHidden] = useState(() =>
    typeof document !== "undefined" ? document.hidden : false
  );

  // Track market-open status (re-evaluated every minute)
  useEffect(() => {
    const tick = () => setOpen(!!isOpen());
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, [isOpen]);

  // Track tab visibility
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Run loader + (re-)arm interval whenever active conditions change
  useEffect(() => {
    fnRef.current?.();
    if (hidden) return;
    const interval = open ? openMs : closedMs;
    if (!interval || interval <= 0) return; // paused
    const iv = setInterval(() => fnRef.current?.(), interval);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hidden, openMs, closedMs, ...deps]);

  return { open, hidden };
}
