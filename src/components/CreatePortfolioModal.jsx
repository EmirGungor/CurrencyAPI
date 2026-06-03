import { useState } from "react";
import {
  FaCheck,
  FaDollarSign,
  FaBriefcase,
  FaGraduationCap,
  FaHome,
  FaPlane,
  FaHeart,
  FaPiggyBank,
  FaChartLine,
  FaBullseye,
} from "react-icons/fa";
import Modal from "./Modal";
import { getPortfolios, savePortfolios } from "../lib/portfolio";

const GOAL_PRESETS = [
  { id: "Genel", label: "Genel", icon: <FaBriefcase /> },
  { id: "Emeklilik", label: "Emeklilik", icon: <FaPiggyBank /> },
  { id: "Acil", label: "Acil Fon", icon: <FaHeart /> },
  { id: "Eğitim", label: "Eğitim", icon: <FaGraduationCap /> },
  { id: "Ev", label: "Ev Birikimi", icon: <FaHome /> },
  { id: "Tatil", label: "Tatil", icon: <FaPlane /> },
  { id: "Yatırım", label: "Yatırım", icon: <FaChartLine /> },
];

const COLORS = [
  "#10b981", // emerald
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#14b8a6", // teal
];

const PRESET_AMOUNTS = [50_000, 100_000, 250_000, 500_000, 1_000_000, 5_000_000];

export default function CreatePortfolioModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("Genel");
  const [hedef, setHedef] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("Genel");

  const reset = () => {
    setName("");
    setTarget("Genel");
    setHedef("");
    setColor(COLORS[0]);
    setIcon("Genel");
  };

  const close = () => {
    reset();
    onClose?.();
  };

  const parsedHedef = Number(String(hedef).replace(/[^\d.]/g, "")) || 0;
  const canSave = name.trim().length >= 2 && parsedHedef > 0;

  const save = () => {
    if (!canSave) return;
    const list = getPortfolios();
    const id = `p-${Date.now().toString(36)}`;
    const preset = GOAL_PRESETS.find((g) => g.id === icon) || GOAL_PRESETS[0];
    list.push({
      id,
      name: name.trim(),
      target: preset.label,
      hedef: parsedHedef,
      createdAt: new Date().toISOString().slice(0, 10),
      color,
      icon: preset.id.slice(0, 1).toUpperCase(),
      assets: [],
    });
    savePortfolios(list);
    onCreated?.(id);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Yeni Portföy Oluştur"
      width={560}
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
            <FaCheck /> Portföy Oluştur
          </button>
        </>
      }
    >
      {/* Live preview */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          borderRadius: 12,
          background: "var(--panel-2)",
          border: "1px solid var(--border)",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: `${color}22`,
            boxShadow: `0 0 0 2px ${color}33`,
            color: color,
            flexShrink: 0,
            fontSize: 16,
          }}
        >
          {(GOAL_PRESETS.find((g) => g.id === icon) || GOAL_PRESETS[0]).icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name || "Portföy Adı"}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Hedef : {(GOAL_PRESETS.find((g) => g.id === icon) || GOAL_PRESETS[0]).label}
            {parsedHedef > 0 && ` · ₺${parsedHedef.toLocaleString("tr-TR")}`}
          </div>
        </div>
      </div>

      {/* Name */}
      <FormRow label="PORTFÖY ADI" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Örn: Emeklilik Portföyüm"
          style={inputStyle}
        />
      </FormRow>

      {/* Goal category */}
      <FormRow label="HEDEF KATEGORİSİ">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 6 }}>
          {GOAL_PRESETS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => { setIcon(g.id); setTarget(g.label); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: icon === g.id ? "var(--primary)" : "var(--border)",
                background: icon === g.id ? "rgba(124,92,255,0.12)" : "var(--panel-2)",
                color: icon === g.id ? "var(--primary)" : "var(--text)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </FormRow>

      {/* Hedef tutar */}
      <FormRow label="HEDEF TUTAR (₺)" required>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                fontWeight: 700,
              }}
            >
              ₺
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={hedef}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d.]/g, "");
                setHedef(v);
              }}
              placeholder="1.000.000"
              className="num"
              style={{ ...inputStyle, paddingLeft: 30 }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setHedef(String(amount))}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: parsedHedef === amount ? "rgba(124,92,255,0.12)" : "transparent",
                  color: parsedHedef === amount ? "var(--primary)" : "var(--muted)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ₺{(amount / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}{amount >= 1_000_000 ? "M" : "K"}
              </button>
            ))}
          </div>
        </div>
      </FormRow>

      {/* Color */}
      <FormRow label="RENK">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Renk ${c}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: color === c ? "2px solid var(--text)" : "2px solid transparent",
                background: c,
                cursor: "pointer",
                outline: color === c ? `2px solid ${c}55` : "none",
                outlineOffset: 2,
                transition: "transform 0.15s",
                transform: color === c ? "scale(1.05)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </FormRow>
    </Modal>
  );
}

function FormRow({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
      </span>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--panel-2)",
  color: "var(--text)",
  fontSize: 13,
  boxSizing: "border-box",
  width: "100%",
  fontFamily: "inherit",
};
