import { useState } from "react";

// Country flags via Unicode regional indicator pairs.
const FLAGS = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  TRY: "🇹🇷",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  CNY: "🇨🇳",
  SEK: "🇸🇪",
  NOK: "🇳🇴",
  DKK: "🇩🇰",
  RUB: "🇷🇺",
};

const METAL_ICONS = {
  gold: "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/xau.svg",
  silver: "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/xag.svg",
};

function cryptoUrls(symbol) {
  const upper = String(symbol || "").toUpperCase().replace(/USDT?$/, "");
  const lower = upper.toLowerCase();
  return [
    `https://bin.bnbstatic.com/static/assets/logos/${upper}.png`,
    `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${lower}.svg`,
  ];
}

function FlagBubble({ code }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.4em",
        height: "1.4em",
        borderRadius: "50%",
        background: "var(--panel-2, rgba(255,255,255,0.06))",
        fontSize: "0.95em",
        lineHeight: 1,
      }}
    >
      {FLAGS[code] || "💱"}
    </span>
  );
}

export default function AssetIcon({ kind, symbol, vs, from, to, size = 20, alt }) {
  const [errIdx, setErrIdx] = useState(0);

  // Forex: show flag of the base currency
  if (kind === "forex") {
    return <FlagBubble code={(from || "USD").toUpperCase()} />;
  }

  // Metal: gold/silver SVG, falls back to emoji
  if (kind === "metal") {
    const url = METAL_ICONS.gold;
    return (
      <img
        src={url}
        alt={alt || "Gold"}
        width={size}
        height={size}
        style={{ display: "inline-block", borderRadius: "50%", verticalAlign: "middle" }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }

  // Crypto: cascade through CDNs on error
  if (kind === "crypto" || symbol) {
    const urls = cryptoUrls(symbol);
    const url = urls[errIdx];
    if (!url) {
      const upper = String(symbol).toUpperCase().slice(0, 3);
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: size,
            height: size,
            borderRadius: "50%",
            background: "var(--panel-2, rgba(255,255,255,0.08))",
            color: "var(--muted)",
            fontSize: size * 0.42,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {upper}
        </span>
      );
    }
    return (
      <img
        src={url}
        alt={alt || symbol}
        width={size}
        height={size}
        loading="lazy"
        style={{
          display: "inline-block",
          borderRadius: "50%",
          verticalAlign: "middle",
          background: "var(--panel-2, rgba(255,255,255,0.04))",
        }}
        onError={() => setErrIdx((i) => i + 1)}
      />
    );
  }

  // Stock / other → text bubble
  const upper = String(symbol || "").toUpperCase().slice(0, 3);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--panel-2, rgba(255,255,255,0.08))",
        color: "var(--muted)",
        fontSize: size * 0.42,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {upper}
    </span>
  );
}
