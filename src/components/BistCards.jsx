import { useEffect, useState, useCallback } from "react";
import { FaLiraSign, FaEuroSign, FaCoins } from "react-icons/fa";
import { GiGoldBar, GiSilverBullet } from "react-icons/gi";
import { useI18n } from "../i18n";

const TR_DATA_URL = "https://finans.truncgil.com/today.json";

// Order matters — first 6 shown by default. Each item maps a key in the truncgil response.
const TR_ASSETS = [
  {
    key: "USD",
    pair: "USD/TRY",
    nameKey: "tr.usd",
    icon: <FaLiraSign />,
    accent: "#26d07c",
    decimals: 4,
  },
  {
    key: "EUR",
    pair: "EUR/TRY",
    nameKey: "tr.eur",
    icon: <FaEuroSign />,
    accent: "#4a7dff",
    decimals: 4,
  },
  {
    key: "gram-altin",
    pair: "GRAM ALTIN",
    nameKey: "tr.gram",
    icon: <GiGoldBar />,
    accent: "#d4af37",
    decimals: 2,
  },
  {
    key: "ceyrek-altin",
    pair: "ÇEYREK",
    nameKey: "tr.ceyrek",
    icon: <FaCoins />,
    accent: "#d4af37",
    decimals: 2,
  },
  {
    key: "yarim-altin",
    pair: "YARIM",
    nameKey: "tr.yarim",
    icon: <FaCoins />,
    accent: "#e9c656",
    decimals: 2,
  },
  {
    key: "tam-altin",
    pair: "TAM",
    nameKey: "tr.tam",
    icon: <FaCoins />,
    accent: "#f0d36b",
    decimals: 2,
  },
  {
    key: "cumhuriyet-altini",
    pair: "CUMHURİYET",
    nameKey: "tr.cumhuriyet",
    icon: <FaCoins />,
    accent: "#c89b1e",
    decimals: 2,
  },
  {
    key: "gumus",
    pair: "GÜMÜŞ",
    nameKey: "tr.gumus",
    icon: <GiSilverBullet />,
    accent: "#c0c0c8",
    decimals: 2,
  },
];

const ASSET_NAMES = {
  tr: {
    "tr.usd": "Dolar",
    "tr.eur": "Euro",
    "tr.gram": "Gram Altın",
    "tr.ceyrek": "Çeyrek Altın",
    "tr.yarim": "Yarım Altın",
    "tr.tam": "Tam Altın",
    "tr.cumhuriyet": "Cumhuriyet Altını",
    "tr.gumus": "Gümüş (Gram)",
  },
  en: {
    "tr.usd": "US Dollar",
    "tr.eur": "Euro",
    "tr.gram": "Gold (Gram)",
    "tr.ceyrek": "Quarter Gold",
    "tr.yarim": "Half Gold",
    "tr.tam": "Full Gold",
    "tr.cumhuriyet": "Republic Gold",
    "tr.gumus": "Silver (Gram)",
  },
};

// truncgil returns numbers like "45,2968" (TR locale, comma decimal)
const parseTr = (s) => {
  if (typeof s !== "string") return null;
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const parsePct = (s) => {
  if (typeof s !== "string") return null;
  // formats like "%0,24" or "%-0,12"
  const cleaned = s.replace("%", "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

const formatNumber = (v, decimals = 2, locale = "tr-TR") => {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export default function BistCards() {
  const { t, lang } = useI18n();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const r = await fetch(TR_DATA_URL);
      if (!r.ok) throw new Error("upstream " + r.status);
      const json = await r.json();
      setData(json);
      setUpdatedAt(json?.Update_Date || null);
    } catch (e) {
      setError(t("common.error.bist"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, [load]);

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const names = ASSET_NAMES[lang] || ASSET_NAMES.tr;

  return (
    <section className="bist-section" aria-label={t("section.bist")}>
      <div className="section-head">
        <h2 className="section-title">
          <span>{t("section.bist")}</span>
        </h2>
        {error ? (
          <button className="retry-btn" onClick={load} type="button">
            {t("common.retry")}
          </button>
        ) : (
          <span className="section-meta">
            {loading
              ? t("common.loading")
              : updatedAt
              ? `${updatedAt} · ${t("section.refresh", { n: 60 })}`
              : t("section.refresh", { n: 60 })}
          </span>
        )}
      </div>

      <div className="market-cards bist-grid">
        {TR_ASSETS.map((a) => {
          const row = data[a.key];
          const price = parseTr(row?.["Satış"] || row?.Satis);
          const change = parsePct(row?.["Değişim"] || row?.Degisim);
          const up = (change ?? 0) >= 0;
          return (
            <div
              key={a.key}
              className="market-card"
              style={{ "--accent": a.accent }}
            >
              <div className="mc-head">
                <div className="mc-icon">{a.icon}</div>
                <div className="mc-names">
                  <span className="mc-pair">{a.pair}</span>
                  <span className="mc-name">{names[a.nameKey]}</span>
                </div>
              </div>
              <div className="mc-price">
                {loading && price == null ? (
                  <span className="mc-skeleton" />
                ) : price == null ? (
                  <span className="mc-price-value mc-dim">—</span>
                ) : (
                  <span className="mc-price-value">
                    ₺{formatNumber(price, a.decimals, locale)}
                  </span>
                )}
              </div>
              <div className="mc-foot">
                <div className={`mc-change ${up ? "up" : "down"}`}>
                  {change == null ? (
                    <span className="mc-dim">{t("common.day")} —</span>
                  ) : (
                    <>
                      <span className="mc-arrow">{up ? "▲" : "▼"}</span>
                      <span>{Math.abs(change).toFixed(2)}%</span>
                      <span className="mc-dim">{t("common.day")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
