import { useState } from "react";
import {
  FaStar,
  FaCrown,
  FaCheck,
  FaEnvelope,
  FaGlobe,
  FaHeadset,
  FaCalendarAlt,
  FaHistory,
  FaBuilding,
  FaBalanceScale,
  FaFlask,
  FaSearch,
  FaSyncAlt,
  FaSitemap,
  FaArrowUp,
  FaArrowDown,
  FaShieldAlt,
  FaFileContract,
  FaUserShield,
  FaInfoCircle,
  FaBullhorn,
  FaMoneyBillWave,
  FaChartPie,
  FaTrophy,
  FaListAlt,
  FaExchangeAlt,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import { useRoute } from "../lib/router";
import { useSelection } from "../lib/selection";

function PageShell({ title, subtitle, children, head }) {
  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && (
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{subtitle}</p>
          )}
        </div>
        {head}
      </div>
      {children}
    </>
  );
}

function Panel({ title, icon, children, right }) {
  return (
    <div className="panel">
      <div className="panel-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ color: "var(--primary)" }}>{icon}</span>}
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}>{title}</h3>
        </div>
        {right}
      </div>
      <div className="panel-body" style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

/* ------------ IPO (Halka Arz) ------------ */
const IPO_ROWS = [
  { code: "AKDMR", name: "Akademi Demir Çelik A.Ş.", date: "2026-05-15", price: "₺42,50 - ₺48,00", lot: "1.250.000.000 TL", advisor: "Yatırım Finansman", status: "active" },
  { code: "TKNLJ", name: "Teknoloji Holdings A.Ş.", date: "2026-05-22", price: "₺16,80 - ₺19,40", lot: "850.000.000 TL", advisor: "Ak Yatırım", status: "upcoming" },
  { code: "TARMK", name: "Tarımak Tarım Sanayi A.Ş.", date: "2026-06-03", price: "₺28,00 - ₺32,00", lot: "560.000.000 TL", advisor: "İş Yatırım", status: "upcoming" },
  { code: "ENRJX", name: "EnerjiX Yenilenebilir A.Ş.", date: "2026-04-28", price: "₺54,00", lot: "2.100.000.000 TL", advisor: "Garanti BBVA", status: "closed" },
  { code: "MEDPLS", name: "Medya Plus İletişim A.Ş.", date: "2026-04-12", price: "₺11,20", lot: "320.000.000 TL", advisor: "Ziraat Yatırım", status: "closed" },
];
export function IpoPage() {
  const labels = { active: "Aktif", upcoming: "Yakında", closed: "Kapandı" };
  return (
    <PageShell title="Halka Arz Takvimi" subtitle="Yaklaşan, aktif ve kapanan halka arzları takip edin.">
      <Panel title="Halka Arz Listesi" icon={<FaCalendarAlt />}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Kod</th>
                <th style={{ padding: "10px 12px" }}>Şirket</th>
                <th style={{ padding: "10px 12px" }}>Arz Tarihi</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Fiyat Aralığı</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Büyüklük</th>
                <th style={{ padding: "10px 12px" }}>Aracı Kurum</th>
                <th style={{ padding: "10px 12px" }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {IPO_ROWS.map((r) => (
                <tr key={r.code} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{r.code}</td>
                  <td style={{ padding: "10px 12px" }}>{r.name}</td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{r.date}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.price}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.lot}</td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{r.advisor}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: r.status === "active" ? "rgba(34,197,94,0.15)" : r.status === "upcoming" ? "rgba(234,179,8,0.15)" : "rgba(148,163,184,0.15)",
                      color: r.status === "active" ? "#22c55e" : r.status === "upcoming" ? "#eab308" : "#94a3b8",
                    }}>
                      {labels[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
}

/* ------------ Dividends (Sermaye & Temettü) ------------ */
const DIV_ROWS = [
  { code: "AKBNK", name: "Akbank T.A.Ş.", type: "Nakit", rate: "%34,5", amount: "₺1,7250", exDate: "2026-05-14", payDate: "2026-05-21" },
  { code: "EREGL", name: "Ereğli Demir Çelik", type: "Nakit", rate: "%18,2", amount: "₺0,9100", exDate: "2026-05-16", payDate: "2026-05-23" },
  { code: "GARAN", name: "Garanti Bankası", type: "Nakit", rate: "%41,0", amount: "₺2,0500", exDate: "2026-05-19", payDate: "2026-05-26" },
  { code: "THYAO", name: "Türk Hava Yolları", type: "Bedelsiz", rate: "%100", amount: "—", exDate: "2026-05-22", payDate: "2026-05-22" },
  { code: "SISE", name: "Şişe Cam", type: "Nakit", rate: "%22,4", amount: "₺1,1200", exDate: "2026-05-27", payDate: "2026-06-03" },
  { code: "TUPRS", name: "Tüpraş", type: "Nakit", rate: "%67,8", amount: "₺6,7800", exDate: "2026-06-02", payDate: "2026-06-09" },
];
export function DividendsPage() {
  return (
    <PageShell title="Sermaye Artırımı & Temettü" subtitle="Yaklaşan nakit, bedelsiz temettüler ve sermaye artırımları.">
      <Panel title="Yaklaşan Dağıtımlar" icon={<FaMoneyBillWave />}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Kod</th>
                <th style={{ padding: "10px 12px" }}>Şirket</th>
                <th style={{ padding: "10px 12px" }}>Tür</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Oran</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Tutar (1 Lot)</th>
                <th style={{ padding: "10px 12px" }}>Ex-Date</th>
                <th style={{ padding: "10px 12px" }}>Ödeme</th>
              </tr>
            </thead>
            <tbody>
              {DIV_ROWS.map((r) => (
                <tr key={r.code} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{r.code}</td>
                  <td style={{ padding: "10px 12px" }}>{r.name}</td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{r.type}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "#22c55e", fontWeight: 700 }}>{r.rate}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.amount}</td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{r.exDate}</td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{r.payDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
}

/* ------------ Foreign Stocks ------------ */
const FOREIGN_STOCKS = [
  { sym: "AAPL", name: "Apple Inc.", market: "NASDAQ", country: "🇺🇸" },
  { sym: "MSFT", name: "Microsoft Corp.", market: "NASDAQ", country: "🇺🇸" },
  { sym: "NVDA", name: "NVIDIA Corp.", market: "NASDAQ", country: "🇺🇸" },
  { sym: "GOOGL", name: "Alphabet Inc.", market: "NASDAQ", country: "🇺🇸" },
  { sym: "AMZN", name: "Amazon.com Inc.", market: "NASDAQ", country: "🇺🇸" },
  { sym: "META", name: "Meta Platforms", market: "NASDAQ", country: "🇺🇸" },
  { sym: "TSLA", name: "Tesla Inc.", market: "NASDAQ", country: "🇺🇸" },
  { sym: "ASML", name: "ASML Holding", market: "AEX", country: "🇳🇱" },
  { sym: "SAP", name: "SAP SE", market: "Xetra", country: "🇩🇪" },
  { sym: "TSM", name: "Taiwan Semiconductor", market: "NYSE", country: "🇹🇼" },
];
export function ForeignStocksPage() {
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  const [q, setQ] = useState("");
  const filtered = FOREIGN_STOCKS.filter((s) => (s.sym + s.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <PageShell title="Yabancı Hisseler" subtitle="Global piyasalardaki popüler hisseler.">
      <Panel
        title="Hisse Listesi"
        icon={<FaGlobe />}
        right={
          <input
            placeholder="Sembol veya isim ara…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--panel-2)",
              color: "var(--text)",
              fontSize: 13,
            }}
          />
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {filtered.map((s) => (
            <button
              key={s.sym}
              type="button"
              onClick={() => {
                setSelection({ kind: "stock", market: "us", symbol: s.sym, label: s.sym });
                setRoute("dashboard");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--panel-2)",
                color: "var(--text)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.sym}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 18 }}>{s.country}</div>
            </button>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}

/* ------------ Favorites ------------ */
export function FavoritesPage() {
  const { setSelection } = useSelection();
  const { setRoute } = useRoute();
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("crental:favorites:v1") || "[]");
  } catch {
    saved = [];
  }
  return (
    <PageShell title="Favoriler" subtitle="Takip listenizdeki varlıklar.">
      <Panel title="Kayıtlı Varlıklar" icon={<FaStar />}>
        {saved.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>
            <FaStar style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0 }}>Henüz favori eklemediniz.</p>
            <p style={{ margin: "8px 0 0", fontSize: 12 }}>Bir varlık görüntülerken yıldız ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {saved.map((f, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelection(f);
                  setRoute("dashboard");
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--panel-2)",
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 600 }}>{f.label}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{f.kind}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}

/* ------------ PRO ------------ */
const PRO_PLANS = [
  {
    name: "Free",
    price: "₺0",
    period: "ücretsiz",
    features: ["15 dk gecikmeli veri", "10 favori", "Temel grafikler", "Reklamlı"],
    cta: "Mevcut Plan",
    primary: false,
  },
  {
    name: "PRO",
    price: "₺149",
    period: "/ay",
    features: ["Anlık veri", "Sınırsız favori", "Gelişmiş teknik analiz", "Reklamsız", "API erişimi", "Fon karşılaştırma PRO"],
    cta: "PRO'ya Geç",
    primary: true,
    badge: "POPÜLER",
  },
  {
    name: "PRO+",
    price: "₺399",
    period: "/ay",
    features: ["PRO içeriği", "AI portföy önerileri", "Premium analiz raporları", "1-1 destek", "Erken erişim"],
    cta: "PRO+'a Geç",
    primary: false,
  },
];
export function ProPage() {
  return (
    <PageShell title="Crental PRO" subtitle="Profesyonel yatırımcılar için sınırsız erişim.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {PRO_PLANS.map((p) => (
          <div
            key={p.name}
            className="panel"
            style={{
              position: "relative",
              padding: 24,
              border: p.primary ? "2px solid var(--primary)" : "1px solid var(--border)",
              background: p.primary ? "linear-gradient(180deg, rgba(124,58,237,0.08), transparent)" : "var(--panel)",
            }}
          >
            {p.badge && (
              <div style={{
                position: "absolute",
                top: -10,
                right: 16,
                padding: "3px 10px",
                background: "var(--primary)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 999,
              }}>{p.badge}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {p.primary && <FaCrown style={{ color: "var(--primary)" }} />}
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{p.name}</h3>
            </div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>{p.price}</span>
              <span style={{ color: "var(--muted)", fontSize: 14, marginLeft: 4 }}>{p.period}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gap: 10 }}>
              {p.features.map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <FaCheck style={{ color: "#22c55e", flexShrink: 0, marginTop: 3 }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: p.primary ? "var(--primary)" : "var(--panel-2)",
                color: p.primary ? "#fff" : "var(--text)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ------------ Contact ------------ */
export function ContactPage() {
  return (
    <PageShell title="İletişim" subtitle="Sorularınız ve geri bildirimleriniz için bize yazın.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Bize Ulaşın" icon={<FaEnvelope />}>
          <form style={{ display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); alert("Mesajınız iletildi."); }}>
            <input placeholder="Ad Soyad" required style={inputStyle} />
            <input placeholder="E-posta" type="email" required style={inputStyle} />
            <input placeholder="Konu" required style={inputStyle} />
            <textarea placeholder="Mesajınız" required rows={5} style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }} />
            <button type="submit" style={{
              padding: "10px 16px", borderRadius: 10, border: "none",
              background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer",
            }}>Gönder</button>
          </form>
        </Panel>
        <Panel title="İletişim Bilgileri" icon={<FaHeadset />}>
          <div style={{ display: "grid", gap: 16, fontSize: 14 }}>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>E-posta</div>
              <a href="mailto:hello@crental.app" style={{ color: "var(--primary)" }}>hello@crental.app</a>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Destek Saatleri</div>
              <div>Pzt-Cum 09:00 - 18:00</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>Adres</div>
              <div>İstanbul, Türkiye</div>
            </div>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--panel-2)",
  color: "var(--text)",
  fontSize: 14,
};

/* ------------ Support ------------ */
const FAQS = [
  { q: "Verileri ne sıklıkla güncelliyorsunuz?", a: "BIST, NASDAQ ve döviz verileri piyasa açıkken 30-60 saniyede bir, kripto 15 saniyede bir güncellenir. PRO üyelerde anlık veri." },
  { q: "Hangi para birimlerini destekliyorsunuz?", a: "150+ para birimi, 50+ TEFAS fonu, BIST, NASDAQ, S&P 500 hisseleri, BTC/ETH ve top altcoinler, altın & gümüş emtialarını destekliyoruz." },
  { q: "Aboneliği nasıl iptal ederim?", a: "PRO sayfasındaki 'Aboneliği Yönet' butonundan dilediğiniz zaman iptal edebilirsiniz. İptal edildikten sonra mevcut dönem sonuna kadar PRO özelliklerini kullanmaya devam edersiniz." },
  { q: "Veriler nereden geliyor?", a: "TEFAS, Yahoo Finance, NASDAQ.com, Binance ve Frankfurter gibi resmi/güvenilir kaynaklardan toplanır." },
  { q: "API erişimi var mı?", a: "Evet, PRO ve PRO+ planlarda REST API erişimi mevcuttur. /api/docs adresinden dokümana ulaşabilirsiniz." },
];
export function SupportPage() {
  return (
    <PageShell title="Destek Merkezi" subtitle="Sık sorulan sorular ve yardım kaynakları.">
      <Panel title="Sık Sorulan Sorular" icon={<FaHeadset />}>
        <div style={{ display: "grid", gap: 8 }}>
          {FAQS.map((f, i) => (
            <details key={i} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel-2)" }}>
              <summary style={{ padding: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>{f.q}</summary>
              <div style={{ padding: "0 14px 14px", color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{f.a}</div>
            </details>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}

/* ------------ Live Archive / Calendar ------------ */
const ARCHIVE_ROWS = [
  { date: "2026-05-09", title: "BIST Haftalık Bülten", host: "Murat Demir", duration: "42:18" },
  { date: "2026-05-06", title: "FED Faiz Kararı Sonrası Piyasalar", host: "Ayşe Yılmaz", duration: "1:08:24" },
  { date: "2026-05-02", title: "Mayıs Ayı Hisse Önerileri", host: "Ahmet Korkmaz", duration: "36:42" },
  { date: "2026-04-30", title: "Yıl Sonu Enflasyon Beklentileri", host: "Selin Aksoy", duration: "55:10" },
];
export function LiveArchivePage() {
  return (
    <PageShell title="Geçmiş Yayınlar" subtitle="Önceki canlı yayınların kayıtları.">
      <Panel title="Arşiv" icon={<FaHistory />}>
        <div style={{ display: "grid", gap: 8 }}>
          {ARCHIVE_ROWS.map((r, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
              gap: 12,
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel-2)",
              alignItems: "center",
              fontSize: 13,
            }}>
              <span style={{ color: "var(--muted)" }}>{r.date}</span>
              <span style={{ fontWeight: 600 }}>{r.title}</span>
              <span style={{ color: "var(--muted)" }}>{r.host}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--primary)" }}>{r.duration}</span>
            </div>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}

const CAL_ROWS = [
  { date: "2026-05-13 14:00", title: "ABD Enflasyon Verisi (CPI)", impact: "high" },
  { date: "2026-05-15 11:00", title: "TCMB PPK Toplantısı", impact: "high" },
  { date: "2026-05-16 15:30", title: "ABD Perakende Satışlar", impact: "medium" },
  { date: "2026-05-20 09:00", title: "ECB Toplantı Tutanakları", impact: "medium" },
  { date: "2026-05-22 14:30", title: "Türkiye Tüketici Güveni", impact: "low" },
];
export function LiveCalendarPage() {
  const colors = { high: "#ef4444", medium: "#eab308", low: "#22c55e" };
  return (
    <PageShell title="Ekonomik Takvim" subtitle="Önemli veri açıklamaları ve toplantılar.">
      <Panel title="Yaklaşan Olaylar" icon={<FaCalendarAlt />}>
        <div style={{ display: "grid", gap: 8 }}>
          {CAL_ROWS.map((r, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 12,
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--panel-2)",
              alignItems: "center",
              fontSize: 13,
            }}>
              <span style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{r.date}</span>
              <span style={{ fontWeight: 600 }}>{r.title}</span>
              <span style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colors[r.impact],
              }} />
            </div>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}

/* ------------ Revenue Program ------------ */
export function RevenueProgramPage() {
  return (
    <PageShell title="Gelir Programı" subtitle="İçerik üreticileri için Crental ortaklık programı.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 }}>
        {[
          { v: "%30", l: "Gelir paylaşım oranı" },
          { v: "₺50K+", l: "Aylık ortalama kazanç (top 10)" },
          { v: "2.500+", l: "Aktif içerik üretici" },
        ].map((s, i) => (
          <div key={i} className="panel" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)" }}>{s.v}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: "var(--muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <Panel title="Nasıl Çalışıyor?" icon={<FaBullhorn />}>
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10, fontSize: 14, lineHeight: 1.6 }}>
          <li>Crental hesabınızla içerik üretici olarak başvurun.</li>
          <li>Analiz yazıları, video içerikleri veya canlı yayın yapın.</li>
          <li>Takipçilerinizin abonelik gelirlerinin %30'unu kazanın.</li>
          <li>Aylık olarak ödemenizi banka hesabınıza alın.</li>
        </ol>
      </Panel>
    </PageShell>
  );
}

/* ------------ Fonlar Sub-pages (12) ------------ */
function FundsSubShell({ title, subtitle, icon, children }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <Panel title={title} icon={icon}>
        {children}
      </Panel>
    </PageShell>
  );
}

export function FundsInvestmentPage() {
  return <FundsSubShell title="Yatırım Fonları" subtitle="TEFAS'taki tüm yatırım fonları." icon={<FaChartPie />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Tüm yatırım fonlarını filtreleyip karşılaştırın. <a href="#/funds" style={{ color: "var(--primary)" }}>Fonlar listesine git →</a></p>
  </FundsSubShell>;
}
export function FundsBesPage() {
  return <FundsSubShell title="BES Fonları" subtitle="Bireysel Emeklilik Sistemi fonları." icon={<FaShieldAlt />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>BES fonlarınızı analiz edin, performans karşılaştırması yapın.</p>
  </FundsSubShell>;
}
export function FundsByfPage() {
  return <FundsSubShell title="Borsa Yatırım Fonları (BYF)" subtitle="Borsada işlem gören fonlar." icon={<FaSitemap />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>ETF ve benzeri borsa yatırım fonlarını keşfedin.</p>
  </FundsSubShell>;
}
export function FundsLeaguePage() {
  return <FundsSubShell title="Fon Ligi" subtitle="Yıl sonu performans sıralaması." icon={<FaTrophy />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>YBB getirilerine göre en iyi performans gösteren fonların sıralaması.</p>
  </FundsSubShell>;
}
export function FundsGlancePage() {
  return <FundsSubShell title="Bir Bakışta" subtitle="Fon kategorilerinin özet görünümü." icon={<FaListAlt />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Tüm fon kategorilerinin tek ekranda hızlı özeti.</p>
  </FundsSubShell>;
}
export function FundsCompaniesPage() {
  return <FundsSubShell title="Portföy Şirketleri" subtitle="Tüm portföy yönetim şirketleri." icon={<FaBuilding />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Şirket bazlı fon listesi ve toplam yönetilen varlık büyüklüğü.</p>
  </FundsSubShell>;
}
export function FundsComparePage() {
  return <FundsSubShell title="Fon Karşılaştırma" subtitle="2-5 fonu yan yana karşılaştırın." icon={<FaBalanceScale />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Performans, risk, masraf oranı gibi metriklerle yan yana inceleyin.</p>
  </FundsSubShell>;
}
export function FundsSimPage() {
  return <FundsSubShell title="Fon Simülasyonu" subtitle="Geçmişe dönük portföy testi." icon={<FaFlask />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Geçmiş verilerle hipotetik portföyünüzün performansını test edin.</p>
  </FundsSubShell>;
}
export function FundsSmartPage() {
  return <FundsSubShell title="Akıllı Para" subtitle="Profesyonel yatırımcı hareketleri." icon={<FaSearch />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Kurumsal yatırımcıların pozisyon değişikliklerini takip edin.</p>
  </FundsSubShell>;
}
export function FundsReversePage() {
  return <FundsSubShell title="Ters Arama" subtitle="Şirketten fona doğru arama." icon={<FaExchangeAlt />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Hangi fonlar hangi hisseleri taşıyor? Şirket adıyla arayın.</p>
  </FundsSubShell>;
}
export function FundsOverlapPage() {
  return <FundsSubShell title="Çakışma Analizi" subtitle="Portföyünüzdeki örtüşmeleri görün." icon={<FaSitemap />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Farklı fonların aynı hisselere ne kadar yatırım yaptığını görselleştirin.</p>
  </FundsSubShell>;
}
export function FundsRotationPage() {
  return <FundsSubShell title="Sektör Rotasyonu" subtitle="Hangi sektörler öne çıkıyor?" icon={<FaSyncAlt />}>
    <p style={{ margin: 0, color: "var(--muted)" }}>Fonların sektörel ağırlık değişimlerini takip ederek piyasa rotasyonunu izleyin.</p>
  </FundsSubShell>;
}

/* ------------ Static Legal / Meta Pages ------------ */
function LegalPage({ title, sections, icon }) {
  return (
    <PageShell title={title}>
      <Panel title={title} icon={icon}>
        <div style={{ display: "grid", gap: 16, fontSize: 14, lineHeight: 1.7 }}>
          {sections.map((s, i) => (
            <div key={i}>
              {s.h && <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>{s.h}</h3>}
              <p style={{ margin: 0, color: "var(--muted)" }}>{s.p}</p>
            </div>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}

export function AboutPage() {
  return <LegalPage title="Hakkımızda" icon={<FaInfoCircle />} sections={[
    { h: "Misyon", p: "Crental, yatırımcılara şeffaf, hızlı ve doğru piyasa verisi sunmayı hedefler. BIST, NASDAQ, TEFAS, kripto ve emtia piyasalarını tek bir arayüzde birleştiriyoruz." },
    { h: "Vizyon", p: "Türkiye'nin en güvenilir bağımsız finans terminali olmak ve bireysel yatırımcının profesyonel araçlara erişimini demokratikleştirmek." },
    { h: "Ekip", p: "Yazılım, finans ve veri bilimi alanlarında deneyimli, küçük ve odaklı bir ekip tarafından İstanbul'da geliştiriliyor." },
  ]} />;
}
export function DisclaimerPage() {
  return <LegalPage title="Yasal Uyarı" icon={<FaShieldAlt />} sections={[
    { p: "Crental platformunda sunulan veriler bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz." },
    { p: "Veriler üçüncü taraf kaynaklardan (TEFAS, Yahoo Finance, NASDAQ, Binance vb.) toplanmaktadır. Veri gecikmeleri veya hataları olabilir." },
    { p: "Yatırım kararlarınızı verirken kendi araştırmanızı yapın ve gerektiğinde profesyonel bir danışmana başvurun." },
    { p: "Crental, içeriklerden veya verilere dayanılarak verilen kararlardan kaynaklanan zararlardan sorumlu tutulamaz." },
  ]} />;
}
export function TosPage() {
  return <LegalPage title="Kullanım Koşulları" icon={<FaFileContract />} sections={[
    { h: "1. Kabul", p: "Crental platformunu kullanarak bu kullanım koşullarını kabul etmiş olursunuz." },
    { h: "2. Hesap", p: "Hesap güvenliğinden kullanıcı sorumludur. Şifre ihlali durumunda Crental'i bilgilendirmelisiniz." },
    { h: "3. İçerik Kullanımı", p: "Platformdaki içerikler kişisel ve ticari olmayan kullanım içindir. Veri kazıma (scraping) yasaktır." },
    { h: "4. Abonelik", p: "PRO üyelikler otomatik yenilenir. İstediğiniz zaman iptal edebilirsiniz." },
    { h: "5. Değişiklikler", p: "Crental, koşulları önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar." },
  ]} />;
}
export function KvkkPage() {
  return <LegalPage title="KVKK Aydınlatma Metni" icon={<FaUserShield />} sections={[
    { h: "Veri Sorumlusu", p: "Crental, 6698 sayılı KVKK kapsamında veri sorumlusudur." },
    { h: "Toplanan Veriler", p: "Ad-soyad, e-posta, IP adresi, kullanım istatistikleri toplanır." },
    { h: "Amaç", p: "Hesap yönetimi, hizmet iyileştirme, yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır." },
    { h: "Haklarınız", p: "Kişisel verilerinize erişim, düzeltme, silme ve işleme itiraz haklarınızı kullanmak için iletisim@crental.app adresine yazabilirsiniz." },
  ]} />;
}
export function PrivacyPage() {
  return <LegalPage title="Gizlilik Politikası" icon={<FaUserShield />} sections={[
    { h: "Veri Toplama", p: "Sadece hizmeti sağlamak için gereken minimum veriyi toplarız." },
    { h: "Çerezler", p: "Tema tercihi, dil seçimi ve oturum bilgileri için yerel depolama (localStorage) kullanılır. Üçüncü taraf reklam çerezleri kullanılmaz." },
    { h: "Üçüncü Taraflar", p: "Veriler yalnızca yasal yükümlülükler veya açık kullanıcı izni olmadan üçüncü taraflarla paylaşılmaz." },
    { h: "Güvenlik", p: "Veriler HTTPS üzerinden şifreli aktarılır. Şifreler hash'lenerek saklanır." },
  ]} />;
}

/* ------------ Changelog ------------ */
const CHANGELOG = [
  { version: "v1.7.0", date: "2026-05-12", items: ["FVT-tarzı Dashboard layout'u", "Canlı saat ve döviz çevirici sağ panelde", "27 yeni sayfa rotası", "Halka arz ve temettü takvimi"] },
  { version: "v1.6.0", date: "2026-05-08", items: ["TEFAS fon detay sayfası", "FVT-stili fon karşılaştırma tablosu", "Risk göstergeleri ve sıralanabilir kolonlar"] },
  { version: "v1.5.0", date: "2026-05-01", items: ["BTC/ETH/altcoin seçimi", "Binance entegrasyonu", "Sparkline grafikleri"] },
  { version: "v1.4.0", date: "2026-04-22", items: ["Bloomberg-tarzı sidebar nav", "Hash-bazlı routing", "QuickStats şeridi"] },
  { version: "v1.3.0", date: "2026-04-15", items: ["i18n TR/EN desteği", "Tema modu (açık/koyu)", "PWA desteği"] },
];
export function ChangelogPage() {
  return (
    <PageShell title="Güncellemeler" subtitle="Crental sürüm geçmişi ve yenilikler.">
      <div style={{ display: "grid", gap: 12 }}>
        {CHANGELOG.map((c) => (
          <div key={c.version} className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>{c.version}</h3>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{c.date}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4, fontSize: 13 }}>
              {c.items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
