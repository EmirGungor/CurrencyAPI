import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Dev middleware mirroring Vercel /api/* functions so client uses same URL
// in both environments.
function devApi() {
  const ua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

  async function passthrough(res, upstream, asText = false) {
    try {
      const r = await fetch(upstream, {
        headers: { "User-Agent": ua, Accept: asText ? "text/csv,*/*" : "application/json" },
      });
      const body = await r.text();
      res.statusCode = r.status;
      res.setHeader("content-type", r.headers.get("content-type") || (asText ? "text/csv" : "application/json"));
      res.end(body);
    } catch {
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
