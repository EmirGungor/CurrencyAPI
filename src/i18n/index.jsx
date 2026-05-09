import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { loadLang, saveLang } from "../lib/storage";

const STRINGS = {
  tr: {
    "brand.tag": "Canlı Döviz · Kripto · Altın · BIST",
    "section.crypto": "Kripto & Altın",
    "section.bist": "Türkiye Piyasaları",
    "section.refresh": "{n} sn'de bir güncellenir",
    "section.refreshM": "{n} dk'da bir güncellenir",
    "section.open": "açık",
    "section.closed": "kapalı",
    "section.alwaysOpen": "7/24",
    "common.loading": "yükleniyor…",
    "common.retry": "Tekrar dene",
    "common.error.fx": "Kur bilgileri alınamadı",
    "common.error.bist": "BIST verileri alınamadı",
    "common.error.market": "Piyasa verileri alınamadı",
    "common.day": "günlük",
    "common.day24": "24s",
    "currency.title": "Döviz Çevirici",
    "currency.amount": "Miktar",
    "currency.from": "Kimden",
    "currency.to": "Kime",
    "currency.result": "Sonuç",
    "currency.swap": "Para birimlerini değiştir",
    "currency.convert": "Çevir",
    "currency.updating": "Güncelleniyor…",
    "currency.updated": "Güncelleme: {time}",
    "currency.search": "Para birimi ara…",
    "currency.noResults": "Sonuç yok",
    "history.title": "Son Çevirmeler",
    "history.empty": "Henüz çevirme yapmadınız",
    "history.clear": "Temizle",
    "history.restore": "Bu çevirmeyi geri yükle",
    "theme.toggleDark": "Karanlık moda geç",
    "theme.toggleLight": "Aydınlık moda geç",
    "lang.label": "Dil",
    "footer.tag": "Hassasiyetle inşa edildi",
  },
  en: {
    "brand.tag": "Live FX · Crypto · Metals · BIST",
    "section.crypto": "Crypto & Metals",
    "section.bist": "Türkiye Markets",
    "section.refresh": "Updates every {n} s",
    "section.refreshM": "Updates every {n} min",
    "section.open": "open",
    "section.closed": "closed",
    "section.alwaysOpen": "24/7",
    "common.loading": "loading…",
    "common.retry": "Retry",
    "common.error.fx": "Failed to load FX rates",
    "common.error.bist": "Failed to load BIST data",
    "common.error.market": "Failed to load market data",
    "common.day": "daily",
    "common.day24": "24h",
    "currency.title": "Currency Converter",
    "currency.amount": "Amount",
    "currency.from": "From",
    "currency.to": "To",
    "currency.result": "Result",
    "currency.swap": "Swap currencies",
    "currency.convert": "Convert",
    "currency.updating": "Updating…",
    "currency.updated": "Updated: {time}",
    "currency.search": "Search currency…",
    "currency.noResults": "No results",
    "history.title": "Recent Conversions",
    "history.empty": "No conversions yet",
    "history.clear": "Clear",
    "history.restore": "Restore this conversion",
    "theme.toggleDark": "Switch to dark mode",
    "theme.toggleLight": "Switch to light mode",
    "lang.label": "Language",
    "footer.tag": "Built with precision",
  },
};

const I18nContext = createContext({
  lang: "tr",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => loadLang());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    saveLang(next);
  }, []);

  const t = useCallback(
    (key, params) => {
      const dict = STRINGS[lang] || STRINGS.tr;
      let str = dict[key] ?? STRINGS.tr[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
