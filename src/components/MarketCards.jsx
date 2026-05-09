import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { GiGoldBar } from "react-icons/gi";
import { COINGECKO_BASE } from "../config";
import { useI18n } from "../i18n";
import Sparkline from "./Sparkline";

const ASSETS = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    pair: "BTC/USDT",
    icon: <FaBitcoin />,
    accent: "#f7931a",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    pair: "ETH/USDT",
    icon: <FaEthereum />,
    accent: "#627eea",
  },
  {
    id: "pax-gold",
    symbol: "XAU",
    name: "Gold (oz)",
    pair: "XAU/USDT",
    icon: <GiGoldBar />,
    accent: "#d4af37",
  },
];

const formatPrice = (v) => {
  if (v == null || Number.isNaN(v)) return "—";
  if (v >= 1000)
    return v.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  return v.toLocaleString("en-US", { maximumFractionDigits: 4 });
};

export default function MarketCards() {
  const { t } = useI18n();
  const [data, setData] = useState({});
  const [sparks, setSparks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const ids = ASSETS.map((a) => a.id).join(",");
      const { data } = await axios.get(
        `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`
      );
      setData(data || {});
    } catch (e) {
      setError(t("common.error.market"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadSparks = useCallback(async () => {
    try {
      const results = await Promise.all(
        ASSETS.map((a) =>
          axios
            .get(`${COINGECKO_BASE}/coins/${a.id}/market_chart?vs_currency=usd&days=7&interval=daily`)
            .then((r) => [a.id, r.data?.prices?.map((p) => p[1]) || []])
            .catch(() => [a.id, []])
        )
      );
      const map = Object.fromEntries(results);
      setSparks(map);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
    loadSparks();
    const iv = setInterval(load, 45_000);
    return () => clearInterval(iv);
  }, [load, loadSparks]);

  return (
    <section className="bist-section">
      <div className="section-head">
        <h2 className="section-title">
          <span>{t("section.crypto")}</span>
        </h2>
        {error ? (
          <button className="retry-btn" onClick={load} type="button">
            {t("common.retry")}
          </button>
        ) : (
          <span className="section-meta">
            {loading ? t("common.loading") : t("section.refresh", { n: 45 })}
          </span>
        )}
      </div>

      <div className="market-cards" aria-label={t("section.crypto")}>
        {ASSETS.map((a) => {
          const row = data[a.id];
          const price = row?.usd;
          const change = row?.usd_24h_change;
          const up = (change ?? 0) >= 0;
          const series = sparks[a.id] || [];
          return (
            <div
              key={a.id}
              className="market-card"
              style={{ "--accent": a.accent }}
            >
              <div className="mc-head">
                <div className="mc-icon">{a.icon}</div>
                <div className="mc-names">
                  <span className="mc-pair">{a.pair}</span>
                  <span className="mc-name">{a.name}</span>
                </div>
              </div>
              <div className="mc-price">
                {loading && price == null ? (
                  <span className="mc-skeleton" />
                ) : (
                  <span className="mc-price-value">${formatPrice(price)}</span>
                )}
              </div>
              <div className="mc-foot">
                <div className={`mc-change ${up ? "up" : "down"}`}>
                  {change == null ? (
                    <span className="mc-dim">{t("common.day24")} —</span>
                  ) : (
                    <>
                      <span className="mc-arrow">{up ? "▲" : "▼"}</span>
                      <span>{Math.abs(change).toFixed(2)}%</span>
                      <span className="mc-dim">{t("common.day24")}</span>
                    </>
                  )}
                </div>
                <Sparkline data={series} color={a.accent} up={up} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
