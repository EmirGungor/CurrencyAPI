import { useState, useCallback } from "react";
import { useI18n } from "../i18n";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isForexOpen, isCryptoOpen } from "../lib/marketHours";
import { useSearch } from "../lib/search";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";

const TR_URL = "https://finans.truncgil.com/today.json";

const parseTr = (s) => {
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const parsePct = (s) => {
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace("%", "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const fmt = (v, decimals, locale = "tr-TR") => {
  if (v == null) return "—";
  return v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export default function QuickStats() {
  const { t, lang } = useI18n();
  const { matches } = useSearch();
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const [tr, setTr] = useState(null);
  const [crypto, setCrypto] = useState({});

  const loadTr = useCallback(async () => {
    try {
      const r = await fetch(TR_URL);
      if (!r.ok) return;
      const data = await r.json();
      setTr(data);
    } catch {}
  }, []);

  // Binance — free, CORS, high rate-limit. /api/binance-24hr proxies it (with cache).
  const loadCrypto = useCallback(async () => {
    try {
      const r = await fetch(`/api/binance-24hr?symbols=BTCUSDT,ETHUSDT`);
      if (!r.ok) return;
      const data = await r.json();
      const byKey = {};
      for (const t of Array.isArray(data) ? data : []) {
        const last = parseFloat(t.lastPrice);
        const pct = parseFloat(t.priceChangePercent);
        if (!Number.isFinite(last)) continue;
        if (t.symbol === "BTCUSDT") byKey.bitcoin = { usd: last, usd_24h_change: pct };
        if (t.symbol === "ETHUSDT") byKey.ethereum = { usd: last, usd_24h_change: pct };
      }
      setCrypto(byKey);
    } catch {}
  }, []);

  useSmartPoll(loadTr, { isOpen: isForexOpen, openMs: 60_000, closedMs: 5 * 60_000 });
  useSmartPoll(loadCrypto, { isOpen: isCryptoOpen, openMs: 30_000 });

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const labels = {
    tr: {
      usd: "Dolar",
      eur: "Euro",
      gbp: "Sterlin",
      gram: "Gram Altın",
      ons: "ONS Altın",
      gumus: "Gümüş",
      btc: "Bitcoin",
      eth: "Ethereum",
    },
    en: {
      usd: "USD",
      eur: "EUR",
      gbp: "GBP",
      gram: "Gold (gr)",
      ons: "Gold oz",
      gumus: "Silver",
      btc: "Bitcoin",
      eth: "Ethereum",
    },
  }[lang] || {};

  const items = [
    {
      key: "usd",
      label: labels.usd,
      value: parseTr(tr?.USD?.["Satış"]),
      pct: parsePct(tr?.USD?.["Değişim"]),
      decimals: 4,
      prefix: "₺",
      primary: true,
      target: { route: "gold-fx", selection: { kind: "forex", from: "USD", to: "TRY", label: "USD/TRY" } },
    },
    {
      key: "eur",
      label: labels.eur,
      value: parseTr(tr?.EUR?.["Satış"]),
      pct: parsePct(tr?.EUR?.["Değişim"]),
      decimals: 4,
      prefix: "₺",
      target: { route: "gold-fx", selection: { kind: "forex", from: "EUR", to: "TRY", label: "EUR/TRY" } },
    },
    {
      key: "gbp",
      label: labels.gbp,
      value: parseTr(tr?.GBP?.["Satış"]),
      pct: parsePct(tr?.GBP?.["Değişim"]),
      decimals: 4,
      prefix: "₺",
      target: { route: "gold-fx", selection: { kind: "forex", from: "GBP", to: "TRY", label: "GBP/TRY" } },
    },
    {
      key: "gram",
      label: labels.gram,
      value: parseTr(tr?.["gram-altin"]?.["Satış"]),
      pct: parsePct(tr?.["gram-altin"]?.["Değişim"]),
      decimals: 2,
      prefix: "₺",
      target: {
        route: "gold-fx",
        selection: { kind: "metal", unit: "gram", vs: "TRY", label: lang === "tr" ? "Gram Altın (₺)" : "Gold (gr, ₺)" },
      },
    },
    {
      key: "ons",
      label: labels.ons,
      value: parseTr(tr?.["ons"]?.["Satış"]),
      pct: parsePct(tr?.["ons"]?.["Değişim"]),
      decimals: 2,
      prefix: "$",
      target: {
        route: "gold-fx",
        selection: { kind: "metal", unit: "oz", vs: "USD", label: "XAU/USD" },
      },
    },
    {
      key: "gumus",
      label: labels.gumus,
      value: parseTr(tr?.gumus?.["Satış"]),
      pct: parsePct(tr?.gumus?.["Değişim"]),
      decimals: 2,
      prefix: "₺",
      // Silver: no reliable free history source; falls back to gold per-gram TRY chart as nearest correlated metal.
      target: {
        route: "gold-fx",
        selection: { kind: "metal", unit: "gram", vs: "TRY", label: lang === "tr" ? "Altın (₺/gr) — Gümüş için yakın varlık" : "Gold (₺/gr) — silver proxy" },
      },
    },
    {
      key: "btc",
      label: labels.btc,
      value: crypto?.bitcoin?.usd,
      pct: crypto?.bitcoin?.usd_24h_change,
      decimals: 0,
      prefix: "$",
      target: { route: "crypto", selection: { kind: "crypto", coinId: "bitcoin", symbol: "BTC", vs: "USD", label: "BTC/USD" } },
    },
    {
      key: "eth",
      label: labels.eth,
      value: crypto?.ethereum?.usd,
      pct: crypto?.ethereum?.usd_24h_change,
      decimals: 2,
      prefix: "$",
      target: { route: "crypto", selection: { kind: "crypto", coinId: "ethereum", symbol: "ETH", vs: "USD", label: "ETH/USD" } },
    },
  ];

  const onClickItem = (it) => {
    if (it.target?.selection) setSelection(it.target.selection);
    if (it.target?.route) setRoute(it.target.route);
  };

  const filtered = items.filter((it) => matches(it.key, it.label));

  return (
    <div className="quickstats" role="list" aria-label={t("quickstats.label")}>
      {filtered.length === 0 ? (
        <div className="qs-item" style={{ color: "var(--muted)", fontSize: 13 }}>
          {t("search.noResults")}
        </div>
      ) : (
        filtered.map((it) => {
          const up = (it.pct ?? 0) >= 0;
          return (
            <button
              key={it.key}
              type="button"
              role="listitem"
              className={`qs-item is-clickable ${it.primary ? "is-primary" : ""}`}
              onClick={() => onClickItem(it)}
              title={`${it.label} →`}
            >
              <div className="qs-row">
                <span className="qs-label">{it.label}</span>
              </div>
              <div className="qs-value-row">
                <span className="qs-value">
                  {it.prefix || ""}
                  {fmt(it.value, it.decimals, locale)}
                </span>
                <span className={`qs-pct ${up ? "up" : "down"}`}>
                  {it.pct == null ? "—" : `${up ? "+" : ""}${it.pct.toFixed(2)}%`}
                </span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
