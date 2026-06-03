import { useMemo, useState } from "react";
import {
  FaSearch,
  FaBitcoin,
  FaChartLine,
  FaCoins,
  FaGlobe,
  FaLandmark,
  FaCheck,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";
import Modal from "./Modal";
import AssetIcon from "./AssetIcon";
import TypePill from "./TypePill";
import { CRYPTO_GROUPS } from "../lib/cryptoList";
import { BIST_TOP, NASDAQ_TOP, SP500_TOP } from "../lib/stocks";
import { FUND_LIST, MANAGER_NAMES, getFundLastPrice } from "../lib/funds";
import { resolveAssetPrice, addTransaction } from "../lib/portfolio";

/* Asset universe per kind — picker source data */
function flattenCrypto() {
  const seen = new Set();
  const all = [];
  for (const group of Object.values(CRYPTO_GROUPS)) {
    for (const c of group) {
      if (!seen.has(c.symbol)) {
        seen.add(c.symbol);
        all.push({ kind: "crypto", symbol: c.symbol, name: c.name, coinId: c.coinId, binance: c.binance });
      }
    }
  }
  return all;
}

const KIND_TABS = [
  { id: "crypto", label: "Kripto", icon: <FaBitcoin /> },
  { id: "stock-bist", label: "BIST Hissesi", icon: <FaChartLine /> },
  { id: "stock-us", label: "ABD Hissesi", icon: <FaGlobe /> },
  { id: "fund", label: "Fon", icon: <FaLandmark /> },
  { id: "metal", label: "Altın & Metal", icon: <FaCoins /> },
];

const METAL_OPTS = [
  { symbol: "XAU", name: "Altın (Gram)", vs: "TRY", unit: "gram" },
  { symbol: "XAU-OZ", name: "Altın (Ons)", vs: "USD", unit: "oz" },
  { symbol: "XAG", name: "Gümüş (Gram)", vs: "TRY", unit: "gram" },
];

export default function AddTransactionModal({ open, onClose, portfolioId, onSaved }) {
  const [tab, setTab] = useState("crypto");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(null);
  const [type, setType] = useState("buy");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset state on close
  const close = () => {
    setSearch("");
    setPicked(null);
    setType("buy");
    setQty("");
    setPrice("");
    setNote("");
    onClose?.();
  };

  const universe = useMemo(() => {
    if (tab === "crypto") return flattenCrypto();
    if (tab === "stock-bist") return BIST_TOP.map((s) => ({ kind: "stock", market: "bist", symbol: s.symbol, name: s.name, vs: "TRY" }));
    if (tab === "stock-us") return [...NASDAQ_TOP, ...SP500_TOP].map((s) => ({ kind: "stock", market: "us", symbol: s.symbol, name: s.name, vs: "USD" }));
    if (tab === "fund") return FUND_LIST.map((f) => ({ kind: "fund", symbol: f.code, name: f.name, manager: MANAGER_NAMES[f.managerCode], category: f.category, vs: "TRY" }));
    if (tab === "metal") return METAL_OPTS.map((m) => ({ kind: "metal", symbol: m.symbol, name: m.name, vs: m.vs, unit: m.unit }));
    return [];
  }, [tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universe.slice(0, 50);
    return universe.filter((a) =>
      a.symbol.toLowerCase().includes(q) || (a.name || "").toLowerCase().includes(q)
    ).slice(0, 50);
  }, [search, universe]);

  // When asset picked, prefill price with live price
  const pickAsset = (a) => {
    setPicked(a);
    const live = resolveAssetPrice(a);
    if (a.kind === "fund") {
      const f = FUND_LIST.find((x) => x.code === a.symbol);
      if (f) setPrice(String(getFundLastPrice(f)));
    } else if (Number.isFinite(live)) {
      setPrice(String(live));
    }
  };

  const canSave = picked && Number(qty) > 0 && Number(price) > 0 && !submitting;

  const save = () => {
    if (!canSave) return;
    setSubmitting(true);
    try {
      addTransaction(portfolioId, {
        type,
        kind: picked.kind,
        symbol: picked.symbol,
        market: picked.market,
        vs: picked.vs,
        qty: Number(qty),
        price: Number(price),
        date,
        note,
      });
      onSaved?.();
      close();
    } finally {
      setSubmitting(false);
    }
  };

  const totalCost = (Number(qty) || 0) * (Number(price) || 0);
  const currencySym = picked?.vs === "USD" ? "$" : picked?.vs === "EUR" ? "€" : "₺";

  return (
    <Modal
      open={open}
      onClose={close}
      title="Yeni İşlem Ekle"
      width={680}
      footer={
        <>
          <button
            type="button"
            onClick={close}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: canSave ? "var(--primary)" : "var(--panel-2)",
              color: canSave ? "#fff" : "var(--muted)",
              fontSize: 13,
              fontWeight: 700,
              cursor: canSave ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaCheck /> {submitting ? "Kaydediliyor…" : "İşlemi Kaydet"}
          </button>
        </>
      }
    >
      {/* Step 1: Pick asset (only if not picked yet) */}
      {!picked && (
        <>
          {/* Kind tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
            {KIND_TABS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => { setTab(k.id); setSearch(""); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: tab === k.id ? "var(--primary)" : "var(--border)",
                  background: tab === k.id ? "rgba(124,92,255,0.12)" : "var(--panel-2)",
                  color: tab === k.id ? "var(--primary)" : "var(--text)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {k.icon} {k.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <FaSearch
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                fontSize: 12,
              }}
            />
            <input
              type="text"
              autoFocus
              placeholder={`${tab === "crypto" ? "BTC, ETH..." : tab === "fund" ? "Fon kodu veya adı..." : "Sembol veya isim..."}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 34px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--panel-2)",
                color: "var(--text)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Results list */}
          <div style={{ maxHeight: 360, overflowY: "auto", display: "grid", gap: 4 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                Sonuç yok
              </div>
            ) : filtered.map((a) => (
              <button
                key={`${a.kind}-${a.market || ""}-${a.symbol}`}
                type="button"
                onClick={() => pickAsset(a)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  background: "transparent",
                  color: "var(--text)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--panel-2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
              >
                <AssetIcon kind={a.kind} symbol={a.symbol} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <strong style={{ fontSize: 14 }}>{a.symbol}</strong>
                    <TypePill kind={a.kind} market={a.market} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.name}{a.manager ? ` · ${a.manager}` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Transaction form */}
      {picked && (
        <>
          {/* Picked asset header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              background: "var(--panel-2)",
              border: "1px solid var(--border)",
              marginBottom: 18,
            }}
          >
            <AssetIcon kind={picked.kind} symbol={picked.symbol} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong style={{ fontSize: 16 }}>{picked.symbol}</strong>
                <TypePill kind={picked.kind} market={picked.market} />
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{picked.name}</div>
            </div>
            <button
              type="button"
              onClick={() => setPicked(null)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--muted)",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Değiştir
            </button>
          </div>

          {/* Buy / Sell toggle */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setType("buy")}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: type === "buy" ? "#22c55e" : "var(--border)",
                background: type === "buy" ? "rgba(34,197,94,0.12)" : "var(--panel-2)",
                color: type === "buy" ? "#22c55e" : "var(--muted)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <FaArrowDown /> ALIŞ
            </button>
            <button
              type="button"
              onClick={() => setType("sell")}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: type === "sell" ? "#ef4444" : "var(--border)",
                background: type === "sell" ? "rgba(239,68,68,0.12)" : "var(--panel-2)",
                color: type === "sell" ? "#ef4444" : "var(--muted)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <FaArrowUp /> SATIŞ
            </button>
          </div>

          {/* Qty + Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Miktar (adet)" required>
              <NumInput value={qty} onChange={setQty} placeholder="0" autoFocus />
            </Field>
            <Field label={`Birim Fiyat (${currencySym})`} required hint={picked && Number(price) > 0 ? "Canlı fiyat yüklendi" : null}>
              <NumInput value={price} onChange={setPrice} placeholder="0.00" />
            </Field>
          </div>

          {/* Date + note */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Tarih">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Not (opsiyonel)">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="…"
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Total preview */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: 10,
              background: "var(--panel-2)",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--muted)" }}>Toplam {type === "buy" ? "Maliyet" : "Tutar"}</span>
            <strong
              className="num"
              style={{ fontSize: 18, color: type === "buy" ? "#22c55e" : "#ef4444" }}
            >
              {currencySym}{totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ---- small helpers ---- */
function Field({ label, required, hint, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 10, color: "#22c55e", marginTop: 2 }}>✓ {hint}</span>}
    </label>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--panel-2)",
  color: "var(--text)",
  fontSize: 13,
  boxSizing: "border-box",
  width: "100%",
  fontFamily: "inherit",
};

function NumInput({ value, onChange, placeholder, autoFocus }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => {
        // accept only digits, comma, dot, minus
        const v = e.target.value.replace(/[^\d.,\-]/g, "").replace(",", ".");
        onChange(v);
      }}
      placeholder={placeholder}
      className="num"
      style={inputStyle}
    />
  );
}
