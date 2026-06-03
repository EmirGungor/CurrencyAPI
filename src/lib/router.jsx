// Lightweight in-memory router with hash sync. No deps.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const RouteContext = createContext({ route: "dashboard", setRoute: () => {} });

const VALID = new Set([
  // existing
  "dashboard",
  "portfolio",
  "terminal",
  "indices",
  "funds",
  "stocks",
  "etf",
  "crypto",
  "gold-fx",
  "futures",
  "technical",
  "live",
  "tchat",
  "community",
  "news",
  "posts",
  // account / monetization
  "favorites",
  "support",
  "pro",
  "revenue-program",
  // markets extras
  "foreign-stocks",
  "ipo",
  "dividends",
  // canli-yayin sub
  "live-archive",
  "live-calendar",
  // fonlar sub (12)
  "funds-investment",
  "funds-bes",
  "funds-byf",
  "funds-league",
  "funds-glance",
  "funds-companies",
  "funds-compare",
  "funds-sim",
  "funds-smart",
  "funds-reverse",
  "funds-overlap",
  "funds-rotation",
  // meta
  "contact",
  "changelog",
  "about",
  "disclaimer",
  "tos",
  "kvkk",
  "privacy",
]);

function readHash() {
  if (typeof window === "undefined") return "dashboard";
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  return VALID.has(h) ? h : "dashboard";
}

export function RouteProvider({ children }) {
  const [route, setRouteState] = useState(() => readHash());

  useEffect(() => {
    const onHashChange = () => setRouteState(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setRoute = useCallback((next) => {
    if (!VALID.has(next)) return;
    window.location.hash = `#/${next}`;
    setRouteState(next);
  }, []);

  const value = useMemo(() => ({ route, setRoute }), [route, setRoute]);
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  return useContext(RouteContext);
}
