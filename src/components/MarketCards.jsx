import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { GiGoldBar } from "react-icons/gi";

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
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const ids = ASSETS.map((a) => a.id).join(",");
        const { data } = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        if (!cancelled) setData(data || {});
      } catch (e) {
        // sessiz hata — kartlar "—" gösterecek
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const iv = setInterval(load, 45_000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="market-cards" aria-label="Piyasa fiyatları">
      {ASSETS.map((a) => {
        const row = data[a.id];
        const price = row?.usd;
        const change = row?.usd_24h_change;
        const up = (change ?? 0) >= 0;
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
                <>
                  <span className="mc-price-value">${formatPrice(price)}</span>
                </>
              )}
            </div>
            <div className={`mc-change ${up ? "up" : "down"}`}>
              {change == null ? (
                <span className="mc-dim">24h —</span>
              ) : (
                <>
                  <span className="mc-arrow">{up ? "▲" : "▼"}</span>
                  <span>{Math.abs(change).toFixed(2)}%</span>
                  <span className="mc-dim">24h</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
