// Lightweight global search query — TopBar input writes, market panels filter on it.
import { createContext, useContext, useMemo, useState, useCallback } from "react";

const SearchContext = createContext({ query: "", setQuery: () => {}, matches: () => true });

export function SearchProvider({ children }) {
  const [query, setQueryState] = useState("");
  const setQuery = useCallback((v) => setQueryState(v || ""), []);

  const matches = useCallback(
    (...fields) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      for (const f of fields) {
        if (f && String(f).toLowerCase().includes(q)) return true;
      }
      return false;
    },
    [query]
  );

  const value = useMemo(() => ({ query, setQuery, matches }), [query, setQuery, matches]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  return useContext(SearchContext);
}
