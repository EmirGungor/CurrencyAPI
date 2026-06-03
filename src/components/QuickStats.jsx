import { useState, useCallback, useEffect } from "react";
import { useI18n } from "../i18n";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isForexOpen, isCryptoOpen, isBistOpen } from "../lib/marketHours";
import { useSearch } from "../lib/search";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";
import { subscribeTicker } from "../lib/binanceWs";
import AssetIcon from "./AssetIcon";
import TickValue from "./TickValue";

const TR_URL = "https://finans.truncgil.com/today.json";

// Robust money parser — handles "$4,715.44" (US), "4.715,44" (TR), "₺6.875,62", "-1,23" etc.
const parseTr = (s) => {
  if (typeof s !== "string") return null;
  let c = s.replace(/[^\d.,\-]/g, ""); // strip $, ₺, %, € etc.
  if (!c) return null;
  const lastComma = c.lastIndexOf(",");
  const lastDot = c.lastIndexOf(".");
  if (lastComma > lastDot) {
    // TR style: "4.715,44" → thousands="." decimal=","
    c = c.replace(/\./g, "").replace(",", ".");
  } else {
    // US style: "4,715.44" → thousands="," decimal="."
    c = c.replace(/,/g, "");
  }
  const n = parseFloat(c);
  return Number.isFinite(n) ? n : null;
};
const parsePct = (s) => parseTr(s);

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
  const [bist, setBist] = useState({});

  const loadTr = useCallback(async () => {
    try {
      const r = await fetch(TR_URL);
      if (!r.ok) return;
      const data = await r.json();
      setTr(data);
    } catch {}
  }, []);

  const loadBist = useCallback(async () => {
    try {
      const r = await fetch("/api/yfinance?symbols=XU100.IS,XU030.IS");
      if (!r.ok) return;
      const data = await r.json();
      const result = data?.quoteResponse?.result || [];
      const map = {};
      for (const q of result) {
        if (q.symbol === "XU100.IS") map.xu100 = { value: q.regularMarketPrice, pct: q.regularMarketChangePercent };
        if (q.symbol === "XU030.IS") map.xu030 = { value: q.regularMarketPrice, pct: q.regularMarketChangePercent };
      }
      setBist(map);
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
  useSmartPoll(loadBist, { isOpen: isBistOpen, openMs: 30_000, closedMs: 5 * 60_000 });

  // Live WebSocket ticks for BTC and ETH — overrides REST values per second.
  useEffect(() => {
    const unBtc = subscribeTicker("BTCUSDT", (t) => {
      setCrypto((prev) => ({ ...prev, bitcoin: { usd: t.close, usd_24h_change: t.changePct } }));
    });
    const unEth = subscribeTicker("ETHUSDT", (t) => {
      setCrypto((prev) => ({ ...prev, ethereum: { usd: t.close, usd_24h_change: t.changePct } }));
    });
    return () => { unBtc(); unEth(); };
  }, []);

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
      key: "xu100",
      label: lang === "tr" ? "BIST 100" : "BIST 100",
      value: bist?.xu100?.value,
      pct: bist?.xu100?.pct,
      decimals: 2,
      prefix: "",
      icon: { kind: "metal", symbol: "BIST" },
      primary: true,
      target: { route: "indices", selection: { kind: "stock", market: "bist", symbol: "XU100.IS", label: "BIST 100" } },
    },
    {
      key: "xu030",
      label: lang === "tr" ? "BIST 30" : "BIST 30",
      value: bist?.xu030?.value,
      pct: bist?.xu030?.pct,
      decimals: 2,
      prefix: "",
      icon: { kind: "metal", symbol: "BIST" },
      target: { route: "indices", selection: { kind: "stock", market: "bist", symbol: "XU030.IS", label: "BIST 30" } },
    },
    {
      key: "usd",
      label: labels.usd,
      value: parseTr(tr?.USD?.["Satış"]),
      pct: parsePct(tr?.USD?.["Değişim"]),
      decimals: 4,
      prefix: "₺",
      icon: { kind: "forex", from: "USD" },
      target: { route: "gold-fx", selection: { kind: "forex", from: "USD", to: "TRY", label: "USD/TRY" } },
    },
    {
      key: "eur",
      label: labels.eur,
      value: parseTr(tr?.EUR?.["Satış"]),
      pct: parsePct(tr?.EUR?.["Değişim"]),
      decimals: 4,
      prefix: "₺",
      icon: { kind: "forex", from: "EUR" },
      target: { route: "gold-fx", selection: { kind: "forex", from: "EUR", to: "TRY", label: "EUR/TRY" } },
    },
    {
      key: "gbp",
      label: labels.gbp,
      value: parseTr(tr?.GBP?.["Satış"]),
      pct: parsePct(tr?.GBP?.["Değişim"]),
      decimals: 4,
      prefix: "₺",
      icon: { kind: "forex", from: "GBP" },
      target: { route: "gold-fx", selection: { kind: "forex", from: "GBP", to: "TRY", label: "GBP/TRY" } },
    },
    {
      key: "gram",
      label: labels.gram,
      value: parseTr(tr?.["gram-altin"]?.["Satış"]),
      pct: parsePct(tr?.["gram-altin"]?.["Değişim"]),
      decimals: 2,
      prefix: "₺",
      icon: { kind: "metal", symbol: "GOLD" },
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
      icon: { kind: "metal", symbol: "GOLD" },
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
      icon: { kind: "metal", symbol: "SILVER" },
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
      icon: { kind: "crypto", symbol: "BTC" },
      target: { route: "crypto", selection: { kind: "crypto", coinId: "bitcoin", symbol: "BTC", vs: "USD", label: "BTC/USD" } },
    },
    {
      key: "eth",
      label: labels.eth,
      value: crypto?.ethereum?.usd,
      pct: crypto?.ethereum?.usd_24h_change,
      decimals: 2,
      prefix: "$",
      icon: { kind: "crypto", symbol: "ETH" },
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
              <div className="qs-row" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {it.icon && (
                  <AssetIcon kind={it.icon.kind} symbol={it.icon.symbol} from={it.icon.from} size={16} />
                )}
                <span className="qs-label">{it.label}</span>
              </div>
              <div className="qs-value-row">
                <span className="qs-value num">
                  {it.value == null ? "—" : (
                    <TickValue
                      value={it.value}
                      prefix={it.prefix || ""}
                      format={(v) => v.toLocaleString(locale, { minimumFractionDigits: it.decimals, maximumFractionDigits: it.decimals })}
                    />
                  )}
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
