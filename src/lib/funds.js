// TEFAS fund snapshot — top 50 funds by investor count.
// Static metadata (managerCode, category, investorCount, totalValue, risk, sharpe)
// comes from a recent snapshot of TEFAS. Dynamic fields (daily/monthly/ytd, NAV)
// overlay onto this when /api/tefas works.

export const MANAGER_NAMES = {
  EPY: "Deniz Portföy",
  ISP: "İş Portföy",
  AKP: "Ak Portföy",
  KCP: "Yapı Kredi Portföy",
  SKP: "Tera Portföy",
  KTP: "Kuveyt Türk Portföy",
  GPY: "Garanti Portföy",
  PSP: "Pusula Portföy",
  ZPY: "Ziraat Portföy",
  ALA: "Atlas Portföy",
  MPY: "Marmara Capital Portföy",
  TEY: "TEB Portföy",
  FPY: "QNB Portföy",
};

// totalValueUnit: "MR" = Milyar TL, "M" = Milyon TL
export const FUND_LIST = [
  { code: "DLY", name: "DENİZ PORTFÖY PARA PİYASASI (TL) FONU", managerCode: "EPY", category: "Para Piyasası Fonu", investorCount: 313399, totalValue: 75.90, totalValueUnit: "MR", risk: 1, sharpe: 24.2687, daily: 0.29, monthly: 3.04, ytd: 14.03 },
  { code: "TTA", name: "İŞ PORTFÖY ALTIN FONU", managerCode: "ISP", category: "Altın Fonu", investorCount: 220140, totalValue: 29.25, totalValueUnit: "MR", risk: 6, sharpe: 0.0344, daily: -0.47, monthly: -0.19, ytd: 3.78 },
  { code: "AFT", name: "AK PORTFÖY YENİ TEKNOLOJİLER YABANCI HİSSE SENEDİ FONU", managerCode: "AKP", category: "Hisse Senedi Fonu", investorCount: 144346, totalValue: 26.60, totalValueUnit: "MR", risk: 6, sharpe: 1.0014, daily: 1.17, monthly: 21.53, ytd: 15.89 },
  { code: "YAK", name: "YAPI KREDİ PORTFÖY KARMA FON", managerCode: "KCP", category: "Karma Fon", investorCount: 109506, totalValue: 1.13, totalValueUnit: "MR", risk: 5, sharpe: -0.5820, daily: -0.01, monthly: 3.33, ytd: 15.33 },
  { code: "TP2", name: "TERA PORTFÖY PARA PİYASASI (TL) FONU", managerCode: "SKP", category: "Para Piyasası Fonu", investorCount: 102533, totalValue: 136.84, totalValueUnit: "MR", risk: 2, sharpe: 25.0051, daily: 0.37, monthly: 3.69, ytd: 18.02 },
  { code: "YKT", name: "YAPI KREDİ PORTFÖY ALTIN FONU", managerCode: "KCP", category: "Altın Fonu", investorCount: 93080, totalValue: 35.65, totalValueUnit: "MR", risk: 6, sharpe: 0.1206, daily: -0.59, monthly: 0.22, ytd: 11.30 },
  { code: "PHE", name: "PUSULA PORTFÖY HİSSE SENEDİ FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "PSP", category: "Hisse Senedi Fonu", investorCount: 92153, totalValue: 39.31, totalValueUnit: "MR", risk: 6, sharpe: 2.7437, daily: -0.24, monthly: 5.23, ytd: 101.38 },
  { code: "KLU", name: "KUVEYT TÜRK PORTFÖY PARA PİYASASI KATILIM (TL) FONU", managerCode: "KTP", category: "Katılım Fonu", investorCount: 88896, totalValue: 62.17, totalValueUnit: "MR", risk: 1, sharpe: 25.9497, daily: 0.32, monthly: 2.97, ytd: 13.55 },
  { code: "AFO", name: "AK PORTFÖY ALTIN FONU", managerCode: "AKP", category: "Altın Fonu", investorCount: 86506, totalValue: 22.99, totalValueUnit: "MR", risk: 6, sharpe: 0.1384, daily: -0.34, monthly: 0.42, ytd: 11.18 },
  { code: "YHT", name: "YAPI KREDİ PORTFÖY KISA VADELİ BORÇLANMA ARAÇLARI (TL) FONU", managerCode: "KCP", category: "Borçlanma Araçları Fonu", investorCount: 86210, totalValue: 1.93, totalValueUnit: "MR", risk: 1, sharpe: 23.4502, daily: 0.26, monthly: 2.78, ytd: 12.97 },
  { code: "DBK", name: "DENİZ PORTFÖY KISA VADELİ BORÇLANMA ARAÇLARI (TL) FONU", managerCode: "EPY", category: "Borçlanma Araçları Fonu", investorCount: 85832, totalValue: 675.41, totalValueUnit: "M", risk: 1, sharpe: 24.3324, daily: 0.31, monthly: 2.94, ytd: 13.68 },
  { code: "TLY", name: "TERA PORTFÖY BİRİNCİ SERBEST FON", managerCode: "SKP", category: "Serbest Fon", investorCount: 84072, totalValue: 131.27, totalValueUnit: "MR", risk: 7, sharpe: 7.2020, daily: 1.07, monthly: 8.88, ytd: 83.07 },
  { code: "GTA", name: "GARANTİ PORTFÖY ALTIN FONU", managerCode: "GPY", category: "Altın Fonu", investorCount: 80553, totalValue: 27.88, totalValueUnit: "MR", risk: 6, sharpe: 0.1391, daily: -0.33, monthly: 0.42, ytd: 11.17 },
  { code: "YAS", name: "YAPI KREDİ PORTFÖY KOÇ HOLDİNG İŞTİRAK VE HİSSE SENEDİ FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "KCP", category: "Hisse Senedi Fonu", investorCount: 69784, totalValue: 7.43, totalValueUnit: "MR", risk: 6, sharpe: -0.3891, daily: -0.28, monthly: 1.17, ytd: 15.66 },
  { code: "KZL", name: "KUVEYT TÜRK PORTFÖY ALTIN KATILIM FONU", managerCode: "KTP", category: "Katılım Fonu", investorCount: 69298, totalValue: 97.22, totalValueUnit: "MR", risk: 6, sharpe: 0.2567, daily: -0.26, monthly: 0.75, ytd: 12.65 },
  { code: "GTZ", name: "GARANTİ PORTFÖY GÜMÜŞ FON SEPETİ FONU", managerCode: "GPY", category: "Fon Sepeti Fonu", investorCount: 69285, totalValue: 16.81, totalValueUnit: "MR", risk: 7, sharpe: 1.3459, daily: -0.24, monthly: 7.41, ytd: 14.03 },
  { code: "YZG", name: "YAPI KREDİ PORTFÖY GÜMÜŞ FON SEPETİ FONU", managerCode: "KCP", category: "Fon Sepeti Fonu", investorCount: 68382, totalValue: 14.31, totalValueUnit: "MR", risk: 7, sharpe: 1.2928, daily: -0.28, monthly: 7.92, ytd: 15.54 },
  { code: "GUM", name: "AK PORTFÖY GÜMÜŞ FON SEPETİ FONU", managerCode: "AKP", category: "Fon Sepeti Fonu", investorCount: 57886, totalValue: 8.54, totalValueUnit: "MR", risk: 7, sharpe: 1.3350, daily: 0.00, monthly: 7.66, ytd: 15.33 },
  { code: "TCA", name: "ZİRAAT PORTFÖY ALTIN KATILIM FONU", managerCode: "ZPY", category: "Katılım Fonu", investorCount: 50090, totalValue: 15.71, totalValueUnit: "MR", risk: 6, sharpe: -0.2056, daily: -0.62, monthly: -0.51, ytd: 1.70 },
  { code: "SAS", name: "AK PORTFÖY SABANCI TOPLULUĞU ŞİRKETLERİ ENDEKSİ HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "AKP", category: "Hisse Senedi Fonu", investorCount: 46561, totalValue: 1.50, totalValueUnit: "MR", risk: 5, sharpe: -0.0105, daily: 0.09, monthly: 0.56, ytd: 20.39 },
  { code: "AFA", name: "AK PORTFÖY AMERİKA YABANCI HİSSE SENEDİ FONU", managerCode: "AKP", category: "Hisse Senedi Fonu", investorCount: 46070, totalValue: 5.60, totalValueUnit: "MR", risk: 6, sharpe: 0.0172, daily: 0.82, monthly: 13.05, ytd: 13.81 },
  { code: "KUT", name: "KUVEYT TÜRK PORTFÖY KIYMETLİ MADENLER KATILIM FONU", managerCode: "KTP", category: "Katılım Fonu", investorCount: 45194, totalValue: 9.86, totalValueUnit: "MR", risk: 6, sharpe: 0.9978, daily: -0.26, monthly: 2.64, ytd: 13.79 },
  { code: "KTV", name: "KUVEYT TÜRK PORTFÖY KISA VADELİ KİRA SERTİFİKALARI KATILIM (TL) FONU", managerCode: "KTP", category: "Kısa Vadeli Kira Sertifikaları Katılım Fonu", investorCount: 44335, totalValue: 25.20, totalValueUnit: "MR", risk: 1, sharpe: 26.1787, daily: 0.29, monthly: 2.79, ytd: 12.86 },
  { code: "TTE", name: "İŞ PORTFÖY BIST TEKNOLOJİ AĞIRLIK SINIRLAMALI ENDEKSİ HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "ISP", category: "Hisse Senedi Fonu", investorCount: 42551, totalValue: 3.85, totalValueUnit: "MR", risk: 7, sharpe: 0.7373, daily: -0.23, monthly: 19.21, ytd: 64.04 },
  { code: "TGE", name: "İŞ PORTFÖY EMTİA YABANCI BYF FON SEPETİ FONU", managerCode: "ISP", category: "Yabancı Fon Sepeti Fonu", investorCount: 41521, totalValue: 3.59, totalValueUnit: "MR", risk: 6, sharpe: 0.7078, daily: 1.64, monthly: 5.58, ytd: 30.74 },
  { code: "DFI", name: "ATLAS PORTFÖY SERBEST FON", managerCode: "ALA", category: "Serbest Fon", investorCount: 40567, totalValue: 19.54, totalValueUnit: "MR", risk: 7, sharpe: 3.5411, daily: 0.22, monthly: 6.25, ytd: 43.86 },
  { code: "PRY", name: "PUSULA PORTFÖY PARA PİYASASI (TL) FONU", managerCode: "PSP", category: "Para Piyasası Fonu", investorCount: 39661, totalValue: 86.45, totalValueUnit: "MR", risk: 2, sharpe: 25.1918, daily: 0.36, monthly: 3.66, ytd: 17.89 },
  { code: "EUZ", name: "GARANTİ PORTFÖY SERBEST (DÖVİZ-AVRO) FON", managerCode: "GPY", category: "Serbest Fon", investorCount: 39610, totalValue: 138.30, totalValueUnit: "MR", risk: 6, sharpe: 4.0767, daily: 0.03, monthly: 2.21, ytd: 6.49 },
  { code: "YAY", name: "YAPI KREDİ PORTFÖY YABANCI TEKNOLOJİ SEKTÖRÜ HİSSE SENEDİ FONU", managerCode: "KCP", category: "Hisse Senedi Fonu", investorCount: 39090, totalValue: 11.96, totalValueUnit: "MR", risk: 7, sharpe: 1.5342, daily: 1.06, monthly: 22.48, ytd: 30.02 },
  { code: "GPL", name: "GARANTİ PORTFÖY BİRİNCİ SERBEST (DÖVİZ) FON", managerCode: "GPY", category: "Serbest Fon", investorCount: 38899, totalValue: 99.41, totalValueUnit: "MR", risk: 5, sharpe: 5.3165, daily: 0.10, monthly: 1.77, ytd: 6.62 },
  { code: "PBR", name: "PUSULA PORTFÖY BİRİNCİ DEĞİŞKEN FON", managerCode: "PSP", category: "Değişken Fon", investorCount: 38622, totalValue: 15.40, totalValueUnit: "MR", risk: 4, sharpe: 3.1795, daily: 0.15, monthly: 8.72, ytd: 79.84 },
  { code: "MAC", name: "MARMARA CAPİTAL PORTFÖY HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "MPY", category: "Hisse Senedi Fonu", investorCount: 38327, totalValue: 5.18, totalValueUnit: "MR", risk: 6, sharpe: -0.2978, daily: 1.00, monthly: 8.82, ytd: 23.37 },
  { code: "TAU", name: "İŞ PORTFÖY BIST BANKA ENDEKSİ HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "ISP", category: "Hisse Senedi Fonu", investorCount: 38131, totalValue: 2.61, totalValueUnit: "MR", risk: 7, sharpe: 0.1767, daily: 0.88, monthly: -1.40, ytd: 8.60 },
  { code: "AOY", name: "AK PORTFÖY ALTERNATİF ENERJİ YABANCI HİSSE SENEDİ FONU", managerCode: "AKP", category: "Hisse Senedi Fonu", investorCount: 36560, totalValue: 1.05, totalValueUnit: "MR", risk: 7, sharpe: 1.1428, daily: 2.59, monthly: 5.62, ytd: 21.98 },
  { code: "AES", name: "AK PORTFÖY PETROL YABANCI BYF FON SEPETİ FONU", managerCode: "AKP", category: "Yabancı Fon Sepeti Fonu", investorCount: 36034, totalValue: 1.58, totalValueUnit: "MR", risk: 7, sharpe: 0.6100, daily: 3.13, monthly: 8.52, ytd: 77.52 },
  { code: "TUA", name: "TEB PORTFÖY ALTIN FONU", managerCode: "TEY", category: "Altın Fonu", investorCount: 34383, totalValue: 17.99, totalValueUnit: "MR", risk: 6, sharpe: 0.1229, daily: -0.36, monthly: 0.44, ytd: 10.94 },
  { code: "IJC", name: "İŞ PORTFÖY YARI İLETKEN TEKNOLOJİLERİ DEĞİŞKEN FON", managerCode: "ISP", category: "Değişken Fon", investorCount: 33919, totalValue: 4.49, totalValueUnit: "MR", risk: 6, sharpe: 2.2425, daily: 2.85, monthly: 34.29, ytd: 66.61 },
  { code: "TMG", name: "İŞ PORTFÖY YABANCI HİSSE SENEDİ FONU", managerCode: "ISP", category: "Hisse Senedi Fonu", investorCount: 33465, totalValue: 4.78, totalValueUnit: "MR", risk: 6, sharpe: 0.5291, daily: 0.39, monthly: 10.86, ytd: 13.72 },
  { code: "PAL", name: "AK PORTFÖY ALTINCI SERBEST (DÖVİZ) FON", managerCode: "AKP", category: "Serbest Fon", investorCount: 33138, totalValue: 171.58, totalValueUnit: "MR", risk: 2, sharpe: 5.5447, daily: 0.10, monthly: 1.80, ytd: 6.75 },
  { code: "IHK", name: "İŞ PORTFÖY İŞ'TE KADIN HİSSE SENEDİ (TL) FONU (HİSSE SENEDİ YOĞUN FON)", managerCode: "ISP", category: "Hisse Senedi Fonu", investorCount: 32979, totalValue: 2.01, totalValueUnit: "MR", risk: 6, sharpe: -0.1851, daily: 0.46, monthly: 1.51, ytd: 21.55 },
  { code: "BGP", name: "AK PORTFÖY ÜÇÜNCÜ PARA PİYASASI (TL) FONU", managerCode: "AKP", category: "Para Piyasası Fonu", investorCount: 30861, totalValue: 61.12, totalValueUnit: "MR", risk: 1, sharpe: 24.5235, daily: 0.10, monthly: 3.10, ytd: 14.23 },
  { code: "KGM", name: "KUVEYT TÜRK PORTFÖY GÜMÜŞ KATILIM FON SEPETİ FONU", managerCode: "KTP", category: "Fon Sepeti Fonu", investorCount: 30326, totalValue: 3.95, totalValueUnit: "MR", risk: 6, sharpe: 1.3560, daily: -0.78, monthly: 6.92, ytd: 14.45 },
  { code: "OJK", name: "QNB PORTFÖY ALTIN FONU", managerCode: "FPY", category: "Altın Fonu", investorCount: 30215, totalValue: 51.20, totalValueUnit: "MR", risk: 6, sharpe: 0.2326, daily: -0.35, monthly: 0.43, ytd: 12.06 },
  { code: "YP4", name: "YAPI KREDİ PORTFÖY FERİKÖY SERBEST (DÖVİZ) FON", managerCode: "KCP", category: "Serbest Fon", investorCount: 30144, totalValue: 135.71, totalValueUnit: "MR", risk: 5, sharpe: 5.4100, daily: 0.10, monthly: 1.76, ytd: 6.66 },
  { code: "GUH", name: "GARANTİ PORTFÖY YABANCI TEKNOLOJİ HİSSE SENEDİ FONU", managerCode: "GPY", category: "Hisse Senedi Fonu", investorCount: 28858, totalValue: 3.11, totalValueUnit: "MR", risk: 6, sharpe: 1.3891, daily: 0.13, monthly: 25.19, ytd: 30.35 },
  { code: "DBA", name: "DENİZ PORTFÖY ALTIN FONU", managerCode: "EPY", category: "Altın Fonu", investorCount: 27213, totalValue: 11.46, totalValueUnit: "MR", risk: 6, sharpe: 0.2780, daily: -0.37, monthly: 0.60, ytd: 12.42 },
  { code: "GRO", name: "GARANTİ PORTFÖY OTUZUNCU SERBEST (DÖVİZ) FON", managerCode: "GPY", category: "Serbest Fon", investorCount: 27055, totalValue: 187.34, totalValueUnit: "MR", risk: 5, sharpe: 5.5519, daily: 0.10, monthly: 1.79, ytd: 6.72 },
  { code: "ADE", name: "AK PORTFÖY MUTLAK GETİRİ HEDEFLİ DEĞİŞKEN FON", managerCode: "AKP", category: "Değişken Fon", investorCount: 26789, totalValue: 990.24, totalValueUnit: "M", risk: 3, sharpe: -1.0597, daily: 0.09, monthly: 1.70, ytd: 9.76 },
  { code: "AFS", name: "AK PORTFÖY SAĞLIK SEKTÖRÜ YABANCI HİSSE SENEDİ FONU", managerCode: "AKP", category: "Hisse Senedi Fonu", investorCount: 26787, totalValue: 747.85, totalValueUnit: "M", risk: 6, sharpe: -1.5277, daily: 0.33, monthly: -1.16, ytd: -0.02 },
  { code: "DAS", name: "DENİZ PORTFÖY ONİKİNCİ SERBEST (DÖVİZ) FON", managerCode: "EPY", category: "Serbest Fon", investorCount: 26671, totalValue: 128.73, totalValueUnit: "MR", risk: 5, sharpe: 5.5510, daily: 0.10, monthly: 1.79, ytd: 6.83 },
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

export function summarizePoints(points) {
  if (!points || points.length < 1) return { last: null, pct: null };
  const last = points[points.length - 1].value;
  const first = points[0].value;
  const pct = Number.isFinite(first) && first !== 0 ? ((last - first) / first) * 100 : null;
  return { last, pct };
}
