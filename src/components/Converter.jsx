import { useEffect, useState, useMemo } from "react";
import { fetchFxRate, FX_CURRENCIES } from "../lib/feeds";

export default function Converter() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("TRY");
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFxRate(from, to).then((r) => {
      if (!cancelled) {
        setRate(r);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [from, to]);

  const numericAmount = useMemo(() => {
    const n = Number(String(amount).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const result = useMemo(() => {
    if (rate == null) return null;
    return numericAmount * rate;
  }, [numericAmount, rate]);

  const fromCur = FX_CURRENCIES.find((c) => c.code === from);
  const toCur = FX_CURRENCIES.find((c) => c.code === to);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const fmtResult = (v) => {
    if (v == null) return "—";
    const dp = v >= 1000 ? 2 : v >= 1 ? 4 : 6;
    return v.toLocaleString("tr-TR", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  };

  return (
    <section className="converter glass" aria-label="Kur Çevirici">
      <div>
        <h2 className="converter-title">Kur Çevirici</h2>
        <p className="converter-sub">Anlık döviz kuru — Frankfurter (ECB)</p>

        <div className="cv-row">
          <div className="cv-field">
            <span className="cv-label">Miktar</span>
            <input
              className="cv-input"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder="0"
              aria-label="Miktar"
            />
          </div>

          <button className="cv-swap" type="button" onClick={swap} aria-label="Para birimlerini değiştir" title="Değiştir">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>

          <div className="cv-field">
            <span className="cv-label">Kime</span>
            <select className="cv-select" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Hedef para birimi">
              {FX_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cv-row" style={{ marginTop: 10 }}>
          <div className="cv-field">
            <span className="cv-label">Kimden</span>
            <select className="cv-select" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Kaynak para birimi">
              {FX_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <span style={{ width: 44 }} aria-hidden />
          <div className="cv-field" />
        </div>
      </div>

      <div className="cv-result">
        <span className="cv-result-label">Sonuç</span>
        <span className="cv-result-value">
          {loading && rate == null ? <span className="skel" style={{ width: 180, height: 28 }} /> : (
            <>
              {toCur?.flag} {fmtResult(result)} <span style={{ fontSize: 18, color: "var(--muted)" }}>{to}</span>
            </>
          )}
        </span>
        <span className="cv-result-rate">
          {rate != null && fromCur && toCur ? (
            <>1 {from} = {rate.toLocaleString("en-US", { maximumFractionDigits: 6 })} {to}</>
          ) : loading ? "Kur alınıyor…" : "Kur alınamadı"}
        </span>
      </div>
    </section>
  );
}
