import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Dev middleware mirroring Vercel /api/* functions so client uses same URL
// in both environments.
function devApi() {
  const ua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

  // In-memory cache for dev (Vercel uses Cache-Control headers in prod).
  // Stores last successful response per cache-key; serves stale on upstream error.
  const cache = new Map();
  const CACHE_TTL_MS = 60_000; // fresh window
  const STALE_MAX_MS = 24 * 60 * 60_000; // serve stale up to 24h on upstream errors

  function cacheGet(key) {
    return cache.get(key);
  }
  function cachePut(key, body, status, contentType) {
    cache.set(key, { body, status, contentType, ts: Date.now() });
  }

  async function passthrough(res, upstream, asText = false, cacheKey = upstream) {
    const cached = cacheGet(cacheKey);
    const now = Date.now();
    // Serve fresh cache without hitting upstream
    if (cached && now - cached.ts < CACHE_TTL_MS && cached.status >= 200 && cached.status < 300) {
      res.statusCode = cached.status;
      res.setHeader("content-type", cached.contentType);
      res.setHeader("X-Cache", "HIT");
      return res.end(cached.body);
    }
    try {
      const r = await fetch(upstream, {
        headers: { "User-Agent": ua, Accept: asText ? "text/csv,*/*" : "application/json" },
      });
      const body = await r.text();
      const ct = r.headers.get("content-type") || (asText ? "text/csv" : "application/json");
      if (r.ok) {
        cachePut(cacheKey, body, r.status, ct);
        res.statusCode = r.status;
        res.setHeader("content-type", ct);
        res.setHeader("X-Cache", "MISS");
        return res.end(body);
      }
      // Upstream error → serve stale if we have it within 24h
      if (cached && now - cached.ts < STALE_MAX_MS) {
        res.statusCode = cached.status;
        res.setHeader("content-type", cached.contentType);
        res.setHeader("X-Cache", "STALE");
        return res.end(cached.body);
      }
      res.statusCode = r.status;
      res.setHeader("content-type", ct);
      return res.end(body);
    } catch {
      if (cached && now - cached.ts < STALE_MAX_MS) {
        res.statusCode = cached.status;
        res.setHeader("content-type", cached.contentType);
        res.setHeader("X-Cache", "STALE-NET");
        return res.end(cached.body);
      }
      res.statusCode = 502;
      res.end(JSON.stringify({ error: "upstream fetch failed" }));
    }
  }

  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const u = new URL(req.url, "http://x");

        if (u.pathname === "/api/yfinance") {
          const symbols = u.searchParams.get("symbols") || "";
          if (!symbols) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbols" }));
          }
          return passthrough(
            res,
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
          );
        }
        if (u.pathname === "/api/yfinance-chart") {
          const symbol = u.searchParams.get("symbol") || "";
          const range = u.searchParams.get("range") || "5d";
          const interval = u.searchParams.get("interval") || "1d";
          if (!symbol) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbol" }));
          }
          return passthrough(
            res,
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`
          );
        }
        if (u.pathname === "/api/bist") {
          const symbols = (u.searchParams.get("symbols") || "")
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean);
          if (!symbols.length) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbols" }));
          }
          const today = new Date();
          const past = new Date(today);
          past.setDate(past.getDate() - 8);
          const fmt = (d) =>
            `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
          const start = fmt(past);
          const end = fmt(today);

          try {
            const results = await Promise.all(
              symbols.map(async (sym) => {
                const url = `https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/HisseTekil?hisse=${encodeURIComponent(sym)}&startdate=${start}&enddate=${end}`;
                const r = await fetch(url, { headers: { "User-Agent": ua, Accept: "application/json" } });
                if (!r.ok) return { symbol: sym, error: `upstream ${r.status}` };
                const data = await r.json();
                const rows = data?.value || [];
                if (!rows.length) return { symbol: sym, close: null };
                const last = rows[rows.length - 1];
                const prev = rows.length > 1 ? rows[rows.length - 2] : null;
                const close = Number(last?.HGDG_KAPANIS);
                const prevClose = prev ? Number(prev?.HGDG_KAPANIS) : null;
                const change = prevClose != null ? close - prevClose : null;
                const changePct =
                  prevClose != null && prevClose !== 0
                    ? ((close - prevClose) / prevClose) * 100
                    : null;
                return {
                  symbol: sym,
                  regularMarketPrice: close,
                  regularMarketChange: change,
                  regularMarketChangePercent: changePct,
                };
              })
            );
            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ quoteResponse: { result: results } }));
          } catch {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "upstream fetch failed" }));
          }
          return;
        }
        if (u.pathname === "/api/bist-history") {
          const symbol = (u.searchParams.get("symbol") || "").toUpperCase();
          const days = parseInt(u.searchParams.get("days") || "30", 10);
          if (!symbol) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbol" }));
          }
          const today = new Date();
          const past = new Date(today);
          past.setDate(past.getDate() - Math.max(2, days));
          const fmt = (d) =>
            `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
          const url = `https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/HisseTekil?hisse=${encodeURIComponent(symbol)}&startdate=${fmt(past)}&enddate=${fmt(today)}`;
          try {
            const r = await fetch(url, { headers: { "User-Agent": ua, Accept: "application/json" } });
            if (!r.ok) {
              res.statusCode = r.status;
              return res.end(JSON.stringify({ error: `upstream ${r.status}` }));
            }
            const data = await r.json();
            const rows = data?.value || [];
            // HGDG_TARIH is "DD-MM-YYYY"
            const points = rows.map((row) => {
              const [dd, mm, yyyy] = String(row.HGDG_TARIH || "").split("-");
              return {
                date: `${yyyy}-${mm}-${dd}`,
                value: Number(row.HGDG_KAPANIS),
              };
            }).filter((p) => Number.isFinite(p.value));
            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ symbol, points }));
          } catch {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "upstream fetch failed" }));
          }
          return;
        }
        if (u.pathname === "/api/tefas") {
          // GET /api/tefas?fonkod=AAK&days=30
          // POSTs to TEFAS BindHistoryInfo. Returns { points: [{date, value}] } or { error }.
          const fonkod = (u.searchParams.get("fonkod") || "").toUpperCase();
          const days = parseInt(u.searchParams.get("days") || "30", 10);
          if (!fonkod) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing fonkod" }));
          }
          const cacheKey = `tefas:${fonkod}:${days}`;
          const cached = cacheGet(cacheKey);
          const now = Date.now();
          if (cached && now - cached.ts < 10 * 60_000 && cached.status === 200) {
            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            res.setHeader("X-Cache", "HIT");
            return res.end(cached.body);
          }
          const today = new Date();
          const past = new Date(today);
          past.setDate(past.getDate() - days);
          const fmtTr = (d) =>
            `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
          try {
            const r = await fetch("https://www.tefas.gov.tr/api/DB/BindHistoryInfo", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": ua,
                "X-Requested-With": "XMLHttpRequest",
                Origin: "https://www.tefas.gov.tr",
                Referer: "https://www.tefas.gov.tr/TarihselVeriler.aspx",
                Accept: "application/json, text/javascript, */*; q=0.01",
              },
              body: `fontip=YAT&sfontur=&fonkod=${encodeURIComponent(fonkod)}&fongrup=&bastarih=${fmtTr(past)}&bittarih=${fmtTr(today)}`,
            });
            const text = await r.text();
            if (!r.ok || text.includes('"fault"')) {
              // Stale fallback if we have it
              if (cached && now - cached.ts < STALE_MAX_MS) {
                res.statusCode = 200;
                res.setHeader("content-type", "application/json");
                res.setHeader("X-Cache", "STALE");
                return res.end(cached.body);
              }
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              return res.end(JSON.stringify({ error: "tefas_unavailable", upstream: r.status }));
            }
            const data = JSON.parse(text);
            const rows = data?.data || [];
            const points = rows
              .map((row) => {
                const ms = Number(String(row.TARIH || "").replace(/[^0-9]/g, ""));
                const value = Number(row.FIYAT);
                if (!Number.isFinite(ms) || !Number.isFinite(value)) return null;
                return { date: new Date(ms).toISOString().slice(0, 10), value };
              })
              .filter(Boolean)
              .sort((a, b) => a.date.localeCompare(b.date));
            const body = JSON.stringify({ fonkod, points });
            cachePut(cacheKey, body, 200, "application/json");
            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            return res.end(body);
          } catch {
            if (cached && now - cached.ts < STALE_MAX_MS) {
              res.statusCode = 200;
              res.setHeader("content-type", "application/json");
              res.setHeader("X-Cache", "STALE-NET");
              return res.end(cached.body);
            }
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "tefas_unavailable" }));
          }
          return;
        }
        if (u.pathname === "/api/binance-24hr") {
          // GET /api/binance-24hr?symbols=BTCUSDT,ETHUSDT
          const symbols = (u.searchParams.get("symbols") || "").trim();
          if (!symbols) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbols" }));
          }
          const arr = symbols.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
          const param = encodeURIComponent(JSON.stringify(arr));
          return passthrough(
            res,
            `https://api.binance.com/api/v3/ticker/24hr?symbols=${param}`,
            false,
            `binance-24hr:${arr.join(",")}`
          );
        }
        if (u.pathname === "/api/binance-klines") {
          // GET /api/binance-klines?symbol=BTCUSDT&interval=1d&limit=30
          const symbol = (u.searchParams.get("symbol") || "").toUpperCase();
          const interval = u.searchParams.get("interval") || "1d";
          const limit = parseInt(u.searchParams.get("limit") || "30", 10);
          if (!symbol) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbol" }));
          }
          return passthrough(
            res,
            `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`,
            false,
            `binance-klines:${symbol}:${interval}:${limit}`
          );
        }
        if (u.pathname === "/api/nasdaq") {
          const symbol = (u.searchParams.get("symbol") || "").toUpperCase();
          const kind = u.searchParams.get("kind") || "quote";
          const days = parseInt(u.searchParams.get("days") || "30", 10);
          if (!symbol) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbol" }));
          }
          const norm = symbol.replace(/-/g, ".");
          let upstream;
          if (kind === "history") {
            const today = new Date();
            const past = new Date(today);
            past.setDate(past.getDate() - days);
            const fmt = (d) => d.toISOString().slice(0, 10);
            upstream = `https://api.nasdaq.com/api/quote/${encodeURIComponent(norm)}/historical?assetclass=stocks&fromdate=${fmt(past)}&todate=${fmt(today)}&limit=${days + 5}&timeframe=d1`;
          } else {
            upstream = `https://api.nasdaq.com/api/quote/${encodeURIComponent(norm)}/info?assetclass=stocks`;
          }
          return passthrough(res, upstream);
        }
        if (u.pathname === "/api/nasdaq-batch") {
          const symbols = (u.searchParams.get("symbols") || "")
            .split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
          if (!symbols.length) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbols" }));
          }
          const cacheKey = `nasdaq-batch:${symbols.join(",")}`;
          const cached = cacheGet(cacheKey);
          const now = Date.now();
          if (cached && now - cached.ts < CACHE_TTL_MS) {
            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            res.setHeader("X-Cache", "HIT");
            return res.end(cached.body);
          }
          // Per-symbol cache so successful symbols are reused even when others 403.
          const fetchOne = async (sym) => {
            const symKey = `nasdaq-quote:${sym}`;
            const c = cacheGet(symKey);
            if (c && now - c.ts < CACHE_TTL_MS && c.status === 200) {
              try { return JSON.parse(c.body); } catch { /* fallthrough */ }
            }
            try {
              const norm = sym.replace(/-/g, ".");
              const r = await fetch(`https://api.nasdaq.com/api/quote/${encodeURIComponent(norm)}/info?assetclass=stocks`, {
                headers: { "User-Agent": ua, Accept: "application/json" },
              });
              if (!r.ok) {
                // Stale-while-error: serve last known good per-symbol if we have one
                const stale = cacheGet(symKey);
                if (stale && Date.now() - stale.ts < STALE_MAX_MS && stale.status === 200) {
                  try { return JSON.parse(stale.body); } catch { /* ignore */ }
                }
                return { symbol: sym, error: r.status };
              }
              const data = await r.json();
              const p = data?.data?.primaryData || {};
              const parsePrice = (s) => {
                if (typeof s !== "string") return null;
                const n = parseFloat(s.replace(/[$,]/g, ""));
                return Number.isFinite(n) ? n : null;
              };
              const parsePct = (s) => {
                if (typeof s !== "string") return null;
                const n = parseFloat(s.replace(/[%+,]/g, ""));
                return Number.isFinite(n) ? n : null;
              };
              const out = {
                symbol: sym,
                close: parsePrice(p.lastSalePrice),
                change: parsePrice(p.netChange),
                changePct: parsePct(p.percentageChange),
                name: data?.data?.companyName || null,
              };
              if (out.close != null) {
                cachePut(symKey, JSON.stringify(out), 200, "application/json");
              }
              return out;
            } catch {
              const stale = cacheGet(symKey);
              if (stale && Date.now() - stale.ts < STALE_MAX_MS && stale.status === 200) {
                try { return JSON.parse(stale.body); } catch { /* ignore */ }
              }
              return { symbol: sym, error: "fetch_failed" };
            }
          };
          try {
            const results = await Promise.all(symbols.map(fetchOne));
            const okCount = results.filter((r) => r && r.close != null).length;
            const body = JSON.stringify({ results });
            // Cache only if at least half succeeded — avoid caching mass failures
            if (okCount >= Math.max(1, Math.floor(symbols.length / 2))) {
              cachePut(cacheKey, body, 200, "application/json");
            }
            res.statusCode = 200;
            res.setHeader("content-type", "application/json");
            res.setHeader("X-Cache", "MISS");
            res.end(body);
          } catch {
            // Stale-while-error for batch
            const stale = cacheGet(cacheKey);
            if (stale && Date.now() - stale.ts < STALE_MAX_MS) {
              res.statusCode = 200;
              res.setHeader("content-type", "application/json");
              res.setHeader("X-Cache", "STALE-NET");
              return res.end(stale.body);
            }
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "batch failed" }));
          }
          return;
        }
        if (u.pathname === "/api/stooq") {
          const symbols = u.searchParams.get("symbols") || "";
          if (!symbols) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: "missing symbols" }));
          }
          // Stooq expects `+` as literal separator in the query string.
          // Do NOT URL-encode the joined value — the `+` must reach Stooq raw.
          const list = symbols.split(",").map((s) => s.trim()).join("+");
          return passthrough(
            res,
            `https://stooq.com/q/l/?s=${list}&f=sd2t2ohlcvn&h&e=csv`,
            true
          );
        }

        return next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devApi(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "og-image.svg"],
      manifest: {
        name: "Crental — Döviz · Kripto · Altın · BIST",
        short_name: "Crental",
        description:
          "Canlı döviz, kripto, altın (gram/çeyrek/yarım/tam/cumhuriyet) ve TRY pariteleri.",
        lang: "tr",
        start_url: "/",
        display: "standalone",
        background_color: "#060914",
        theme_color: "#0b1126",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === "finans.truncgil.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "truncgil-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === "api.coingecko.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "coingecko-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname === "api.freecurrencyapi.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fx-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
