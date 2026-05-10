// Top Turkish funds — curated metadata only (live NAV + history fetched from TEFAS at runtime).
// Categories used by TEFAS:
//   HSF = Hisse Senedi Fonu, KFA = Kıymetli Maden, DBF = Değişken,
//   SPK = Para Piyasası, KAR = Karma, BIY = Borçlanma, FSF = Fon Sepeti, GMF = Gayrimenkul
export const FUND_LIST = [
  { code: "AFA", name: "Ak Portföy Hisse Senedi Fon Sepeti", manager: "Ak Portföy", type: "FSF" },
  { code: "GAH", name: "Garanti Portföy Hisse Senedi", manager: "Garanti Portföy", type: "HSF" },
  { code: "TI3", name: "Tacirler Yatırım Hisse Senedi", manager: "Tacirler Portföy", type: "HSF" },
  { code: "ATA", name: "Ata Portföy Hisse Senedi", manager: "Ata Portföy", type: "HSF" },
  { code: "IPK", name: "İş Portföy Kısa Vadeli Borçlanma", manager: "İş Portföy", type: "BIY" },
  { code: "TPL", name: "Türkiye Portföy Para Piyasası Likit", manager: "Türkiye Portföy", type: "SPK" },
  { code: "HVZ", name: "HSBC Portföy Para Piyasası Likit", manager: "HSBC Portföy", type: "SPK" },
  { code: "ZBJ", name: "Ziraat Portföy Kira Sertifikası", manager: "Ziraat Portföy", type: "BIY" },
  { code: "AFV", name: "Ak Portföy Altın Katılım", manager: "Ak Portföy", type: "KFA" },
  { code: "DBA", name: "Deniz Portföy Hisse Senedi", manager: "Deniz Portföy", type: "HSF" },
  { code: "GPB", name: "Garanti Portföy Borçlanma", manager: "Garanti Portföy", type: "BIY" },
  { code: "YAS", name: "Yapı Kredi Portföy Karma", manager: "Yapı Kredi Portföy", type: "KAR" },
];

const RANGE_TO_DAYS = {
  "1d": 5,
  "1w": 12,
  "1m": 35,
  "3m": 100,
  "1y": 380,
};

export async function fetchFundHistory(fonkod, range = "1m") {
  const days = RANGE_TO_DAYS[range] ?? 35;
  const r = await fetch(`/api/tefas?fonkod=${encodeURIComponent(fonkod)}&days=${days}`);
  if (!r.ok) throw new Error(`tefas ${r.status}`);
  const data = await r.json();
  if (data?.error) throw new Error(data.error);
  return data?.points || [];
}

// Computes last NAV + % change from the points array.
export function summarizePoints(points) {
  if (!points || points.length < 1) return { last: null, pct: null };
  const last = points[points.length - 1].value;
  const first = points[0].value;
  const pct = Number.isFinite(first) && first !== 0 ? ((last - first) / first) * 100 : null;
  return { last, pct };
}
