/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import axios from "axios";

const BASE_URL = "https://api.freecurrencyapi.com/v1/latest";
const API_KEY = "fca_live_eG1QfuVZDcMeBxhjgW7BaqPU3ieBFBAuhtWPASII"; // ⚠️ Prod için .env + backend proxy önerilir

const CURRENCIES = ["USD", "EUR", "TRY", "PLN", "GBP", "AUD", "CAD"];

export default function Currency() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("TRY");

  const [rates, setRates] = useState(null); // { USD:1, TRY: 34.2, ... }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch rates when `fromCurrency` changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(
          `${BASE_URL}?apikey=${API_KEY}&base_currency=${fromCurrency}`
        );
        if (cancelled) return;
        setRates(data?.data || null);
        setLastUpdated(new Date());
      } catch (e) {
        setError("Kur bilgileri alınamadı. Lütfen tekrar deneyin.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fromCurrency]);

  const result = useMemo(() => {
    const amt = parseFloat(String(amount).replace(",", "."));
    if (!rates || !toCurrency || Number.isNaN(amt)) return "";
    const out = (rates[toCurrency] || 0) * amt;
    if (!Number.isFinite(out)) return "";
    return out.toFixed(2);
  }, [amount, toCurrency, rates]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const baseInfo = useMemo(() => {
    if (!rates) return "";
    return `1 ${fromCurrency} = ${
      rates[toCurrency]?.toFixed?.(4) ?? "-"
    } ${toCurrency}`;
  }, [rates, fromCurrency, toCurrency]);

  return (
    <div className="currency-page">
      <div className="currency-card" role="region" aria-label="Döviz çevirici">
        <h3 className="title">Crental Currency</h3>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="row">
            <label className="field" aria-label="Miktar">
              <span className="label-text">Miktar</span>
              <input
                inputMode="decimal"
                min="0"
                step="0.01"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </label>

            <label className="field" aria-label="Kaynak para birimi">
              <span className="label-text">Kimden</span>
              <select
                className="select"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="swap-row">
            <button
              type="button"
              className="swapBtn"
              onClick={swap}
              aria-label="Para birimlerini değiştir"
              title="Para birimlerini değiştir"
            >
              <FaExchangeAlt />
            </button>
            <span className="rate-text">
              {loading ? "Kurlar yükleniyor…" : baseInfo}
            </span>
          </div>

          <div className="row">
            <label className="field" aria-label="Hedef para birimi">
              <span className="label-text">Kime</span>
              <select
                className="select"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="field" aria-label="Sonuç">
              <span className="label-text">Sonuç</span>
              <input
                className="input"
                value={result}
                readOnly
                placeholder="—"
              />
            </label>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Güncelleniyor…" : "Convert"}
          </button>

          {error && <p className="error-text">{error}</p>}

          {lastUpdated && (
            <p className="meta-text">
              Güncelleme: {lastUpdated.toLocaleString()}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
