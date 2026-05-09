import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FaExchangeAlt, FaHistory, FaTrash, FaSearch } from "react-icons/fa";
import axios from "axios";
import { FREECURRENCY_API_KEY, FREECURRENCY_BASE } from "../config";
import { loadHistory, pushHistory, clearHistory } from "../lib/storage";
import { useI18n } from "../i18n";
import { useSmartPoll } from "../lib/useSmartPoll";
import { isForexOpen } from "../lib/marketHours";

const FALLBACK_CURRENCIES = ["USD", "EUR", "TRY", "PLN", "GBP", "AUD", "CAD", "JPY", "CHF", "CNY"];

function CurrencyCombo({ value, onChange, options, label, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return options;
    return options.filter((o) => o.code.includes(q) || (o.name || "").toUpperCase().includes(q));
  }, [query, options]);

  const current = options.find((o) => o.code === value);

  return (
    <div className="combo" ref={ref}>
      <button
        type="button"
        className="select combo-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="combo-code">{current?.code || value}</span>
        {current?.name && <span className="combo-name">{current.name}</span>}
      </button>
      {open && (
        <div className="combo-popup" role="listbox">
          <div className="combo-search">
            <FaSearch aria-hidden="true" />
            <input
              autoFocus
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="combo-input"
            />
          </div>
          <ul className="combo-list">
            {filtered.length === 0 && (
              <li className="combo-empty">—</li>
            )}
            {filtered.map((o) => (
              <li
                key={o.code}
                role="option"
                aria-selected={o.code === value}
                className={`combo-option ${o.code === value ? "is-active" : ""}`}
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="combo-code">{o.code}</span>
                {o.name && <span className="combo-name">{o.name}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Currency() {
  const { t, lang } = useI18n();

  const [amount, setAmount] = useState("100");
  const [reverseAmount, setReverseAmount] = useState("");
  const [editing, setEditing] = useState("from"); // "from" | "to"
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("TRY");

  const [rates, setRates] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [history, setHistory] = useState(() => loadHistory());

  // Fetch full currency list once
  useEffect(() => {
    let cancelled = false;
    async function loadCurrencies() {
      try {
        const { data } = await axios.get(
          `${FREECURRENCY_BASE}/currencies?apikey=${FREECURRENCY_API_KEY}`
        );
        if (cancelled) return;
        const map = data?.data || {};
        const list = Object.entries(map)
          .map(([code, meta]) => ({ code, name: meta?.name || meta?.name_plural || "" }))
          .sort((a, b) => a.code.localeCompare(b.code));
        if (list.length) setCurrencies(list);
        else setCurrencies(FALLBACK_CURRENCIES.map((c) => ({ code: c })));
      } catch {
        if (!cancelled) setCurrencies(FALLBACK_CURRENCIES.map((c) => ({ code: c })));
      }
    }
    loadCurrencies();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(
        `${FREECURRENCY_BASE}/latest?apikey=${FREECURRENCY_API_KEY}&base_currency=${fromCurrency}`
      );
      setRates(data?.data || null);
      setLastUpdated(new Date());
    } catch (e) {
      setError(t("common.error.fx"));
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, t]);

  // Auto-refresh FX rates every 5 min while forex is open, hourly otherwise.
  useSmartPoll(fetchRates, {
    isOpen: isForexOpen,
    openMs: 5 * 60_000,
    closedMs: 60 * 60_000,
    deps: [fromCurrency],
  });

  // Forward calc: amount (from) → result (to)
  const result = useMemo(() => {
    if (editing !== "from") return reverseAmount; // hold the typed value
    const amt = parseFloat(String(amount).replace(",", "."));
    if (!rates || !toCurrency || Number.isNaN(amt)) return "";
    const out = (rates[toCurrency] || 0) * amt;
    if (!Number.isFinite(out)) return "";
    return out.toFixed(2);
  }, [amount, toCurrency, rates, editing, reverseAmount]);

  // Reverse calc: reverseAmount (to) → amount (from)
  const reverseResult = useMemo(() => {
    if (editing !== "to") return amount;
    const amt = parseFloat(String(reverseAmount).replace(",", "."));
    if (!rates || !toCurrency || Number.isNaN(amt)) return "";
    const rate = rates[toCurrency] || 0;
    if (!rate) return "";
    const out = amt / rate;
    if (!Number.isFinite(out)) return "";
    return out.toFixed(2);
  }, [reverseAmount, toCurrency, rates, editing, amount]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setEditing("from");
  };

  const baseInfo = useMemo(() => {
    if (!rates) return "";
    return `1 ${fromCurrency} = ${rates[toCurrency]?.toFixed?.(4) ?? "-"} ${toCurrency}`;
  }, [rates, fromCurrency, toCurrency]);

  const onSubmit = (e) => {
    e.preventDefault();
    const amt = editing === "from" ? amount : reverseResult;
    const out = editing === "from" ? result : reverseAmount;
    if (!amt || !out) return;
    const next = pushHistory({
      from: fromCurrency,
      to: toCurrency,
      amount: String(amt),
      result: String(out),
    });
    setHistory(next);
  };

  const restoreHistory = (h) => {
    setFromCurrency(h.from);
    setToCurrency(h.to);
    setAmount(h.amount);
    setEditing("from");
  };

  const onClearHistory = () => setHistory(clearHistory());

  return (
    <div className="currency-page">
      <div className="currency-card" role="region" aria-label={t("currency.title")}>
        <h3 className="title">{t("currency.title")}</h3>

        <form className="form" onSubmit={onSubmit}>
          <div className="row">
            <label className="field">
              <span className="label-text">{t("currency.amount")}</span>
              <input
                inputMode="decimal"
                className="input"
                value={editing === "from" ? amount : reverseResult}
                onChange={(e) => {
                  setEditing("from");
                  setAmount(e.target.value);
                }}
                placeholder="0.00"
                aria-label={t("currency.amount")}
              />
            </label>

            <div className="field">
              <span className="label-text">{t("currency.from")}</span>
              <CurrencyCombo
                value={fromCurrency}
                onChange={setFromCurrency}
                options={currencies}
                label={t("currency.from")}
                placeholder={t("currency.search")}
              />
            </div>
          </div>

          <div className="swap-row">
            <button
              type="button"
              className="swapBtn"
              onClick={swap}
              aria-label={t("currency.swap")}
              title={t("currency.swap")}
            >
              <FaExchangeAlt />
            </button>
            <span className="rate-text">
              {loading ? t("common.loading") : baseInfo}
            </span>
          </div>

          <div className="row">
            <div className="field">
              <span className="label-text">{t("currency.to")}</span>
              <CurrencyCombo
                value={toCurrency}
                onChange={setToCurrency}
                options={currencies}
                label={t("currency.to")}
                placeholder={t("currency.search")}
              />
            </div>

            <label className="field">
              <span className="label-text">{t("currency.result")}</span>
              <input
                inputMode="decimal"
                className="input"
                value={editing === "from" ? result : reverseAmount}
                onChange={(e) => {
                  setEditing("to");
                  setReverseAmount(e.target.value);
                }}
                placeholder="—"
                aria-label={t("currency.result")}
              />
            </label>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? t("currency.updating") : t("currency.convert")}
          </button>

          {error && (
            <div className="error-row">
              <p className="error-text">{error}</p>
              <button type="button" className="retry-btn" onClick={fetchRates}>
                {t("common.retry")}
              </button>
            </div>
          )}

          {lastUpdated && (
            <p className="meta-text">
              {t("currency.updated", { time: lastUpdated.toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US") })}
            </p>
          )}
        </form>

        <div className="history">
          <div className="history-head">
            <span className="history-title">
              <FaHistory aria-hidden="true" />
              {t("history.title")}
            </span>
            {history.length > 0 && (
              <button type="button" className="history-clear" onClick={onClearHistory}>
                <FaTrash aria-hidden="true" />
                <span>{t("history.clear")}</span>
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="history-empty">{t("history.empty")}</p>
          ) : (
            <ul className="history-list">
              {history.map((h) => (
                <li key={h.ts}>
                  <button
                    type="button"
                    className="history-item"
                    onClick={() => restoreHistory(h)}
                    title={t("history.restore")}
                  >
                    <span className="hi-amount">
                      {h.amount} <strong>{h.from}</strong>
                    </span>
                    <span className="hi-arrow">→</span>
                    <span className="hi-result">
                      {h.result} <strong>{h.to}</strong>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
