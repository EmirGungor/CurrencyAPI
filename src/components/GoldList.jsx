import { useCallback, useState } from "react";
import { FaCoins } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isForexOpen } from "../lib/marketHours";
import { useSelection } from "../lib/selection";
import { useRoute } from "../lib/router";

const TR_URL = "https://finans.truncgil.com/today.json";

// All TRY-priced gold variants chart on per-gram (₺) basis.
// ONS Altın chart in USD per troy ounce.
const GOLD_KEYS = [
  { key: "gram-altin", labelTr: "Gram Altın", labelEn: "Gram Gold", chart: { unit: "gram", vs: "TRY" } },
  { key: "ceyrek-altin", labelTr: "Çeyrek Altın", labelEn: "Quarter Gold", chart: { unit: "gram", vs: "TRY" } },
  { key: "yarim-altin", labelTr: "Yarım Altın", labelEn: "Half Gold", chart: { unit: "gram", vs: "TRY" } },
  { key: "tam-altin", labelTr: "Tam Altın", labelEn: "Full Gold", chart: { unit: "gram", vs: "TRY" } },
  { key: "cumhuriyet-altini", labelTr: "Cumhuriyet Altını", labelEn: "Republic Gold", chart: { unit: "gram", vs: "TRY" } },
  { key: "22-ayar-bilezik", labelTr: "22 Ayar Bilezik", labelEn: "22K Bracelet", chart: { unit: "gram", vs: "TRY" } },
  { key: "gumus", labelTr: "Gümüş (gr)", labelEn: "Silver (gr)", chart: { unit: "gram", vs: "TRY" } },
  { key: "ons", labelTr: "ONS Altın", labelEn: "Gold (oz)", chart: { unit: "oz", vs: "USD" } },
];

const parseTr = (s) => {
  if (typeof s !== "string") return null;
  let c = s.replace(/[^\d.,\-]/g, "");
  if (!c) return null;
  const lastComma = c.lastIndexOf(",");
  const lastDot = c.lastIndexOf(".");
  if (lastComma > lastDot) c = c.replace(/\./g, "").replace(",", ".");
  else c = c.replace(/,/g, "");
  const n = parseFloat(c);
  return Number.isFinite(n) ? n : null;
};
const parsePct = (s) => parseTr(s);

export default function GoldList() {
  const { t, lang } = useI18n();
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const [data, setData] = useState({});

  const load = useCallback(async () => {
    try {
      const r = await fetch(TR_URL);
      if (!r.ok) return;
      const json = await r.json();
      setData(json);
    } catch {}
  }, []);

  useSmartPoll(load, { isOpen: isForexOpen, openMs: 60_000, closedMs: 5 * 60_000 });

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const fmt = (v, decimals = 2) =>
    v == null ? "—" : v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">
          <FaCoins />
          {t("gold.title")}
        </span>
      </div>
      <div className="panel-body no-pad">
        <ul className="gold-list">
          {GOLD_KEYS.map((g) => {
            const row = data[g.key];
            const v = parseTr(row?.["Satış"]);
            const pct = parsePct(row?.["Değişim"]);
            const up = (pct ?? 0) >= 0;
            const isOz = g.key === "ons";
            const prefix = isOz ? "$" : "₺";
            const name = lang === "tr" ? g.labelTr : g.labelEn;
            const onClick = () => {
              setSelection({
                kind: "metal",
                unit: g.chart.unit,
                vs: g.chart.vs,
                label: name,
              });
              setRoute("gold-fx");
            };
            return (
              <li key={g.key}>
                <button type="button" className="gold-item is-clickable" onClick={onClick} title={name}>
                  <span className="gold-dot" aria-hidden />
                  <span className="gold-name">{name}</span>
                  <span className="gold-price">
                    {prefix}{fmt(v, 2)}
                  </span>
                  <span className={`gold-pct ${up ? "up" : "down"}`}>
                    {pct == null ? "—" : `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}%`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
