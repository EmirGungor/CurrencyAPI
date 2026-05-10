// Tracks which asset BigChart is currently displaying.
// Two kinds: forex (Frankfurter) and crypto (CoinGecko). Persisted to localStorage.
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";

const SelectionContext = createContext(null);

const DEFAULT = { kind: "forex", from: "USD", to: "TRY", label: "USD/TRY" };
const KEY = "crental:selection:v1";

function loadInitial() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return { ...DEFAULT, ...parsed };
  } catch {}
  return DEFAULT;
}

export function SelectionProvider({ children }) {
  const [selection, setSelectionState] = useState(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(selection));
    } catch {}
  }, [selection]);

  const setSelection = useCallback((sel) => {
    if (!sel) return;
    setSelectionState({ ...DEFAULT, ...sel });
  }, []);

  const value = useMemo(() => ({ selection, setSelection }), [selection, setSelection]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  return useContext(SelectionContext);
}
