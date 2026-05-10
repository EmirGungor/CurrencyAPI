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
    "topbar.search": "Sembol veya isim ara…",
    "page.title": "Günün Özeti",
    "page.comingSoon": "Bu bölüm yakında eklenecek.",
    "search.placeholder": "Sembol veya para birimi…",
    "search.noResults": "Sonuç yok",
    "funds.title": "TEFAS Fonları",
    "funds.code": "Kod",
    "funds.name": "Fon Adı",
    "funds.type": "Tür",
    "funds.nav": "Pay Fiyatı",
    "funds.change30d": "30g Değişim",
    "funds.unavailable": "veri yok",
    "funds.unavailableDetail": "TEFAS API'si şu anda erişilebilir değil. Yeniden dener veya production deployment sonrası yeniden açılır.",
    "quickstats.label": "Piyasa özet kartları",
    "nav.main": "Ana Menü",
    "nav.markets": "Piyasalar",
    "nav.community": "Topluluk",
    "nav.dashboard": "Günün Özeti",
    "nav.portfolio": "Portföyüm",
    "nav.terminal": "Terminal",
    "nav.indices": "Endeksler",
    "nav.funds": "Fonlar",
    "nav.stocks": "Hisseler",
    "nav.etf": "ETF",
    "nav.crypto": "Kripto",
    "nav.goldFx": "Altın & Döviz",
    "nav.futures": "Vadeli Piyasa",
    "nav.technical": "Teknik Analiz",
    "nav.live": "Canlı Yayın",
    "nav.tchat": "t-Chat",
    "nav.news": "Haberler",
    "nav.posts": "Yazılar",
    "wl.title": "Günün Enleri",
    "wl.winners": "Kazananlar",
    "wl.losers": "Kaybedenler",
    "wl.symbol": "Sembol",
    "wl.price": "Fiyat",
    "wl.change": "Değişim",
    "gold.title": "Altın & Değerli Metal",
    "bigchart.session": "oturum",
    "bigchart.live": "Canlı",
    "bigchart.day": "G",
    "bigchart.week": "H",
    "bigchart.month": "A",
    "bigchart.collecting": "Veri topluyoruz, ilk noktalar dakika içinde…",
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
    "topbar.search": "Search symbol or name…",
    "page.title": "Today's Snapshot",
    "page.comingSoon": "This section is coming soon.",
    "search.placeholder": "Symbol or currency…",
    "search.noResults": "No results",
    "funds.title": "TEFAS Funds",
    "funds.code": "Code",
    "funds.name": "Fund Name",
    "funds.type": "Type",
    "funds.nav": "NAV",
    "funds.change30d": "30d Change",
    "funds.unavailable": "no data",
    "funds.unavailableDetail": "TEFAS API is currently not reachable. It may recover automatically, or work in production deployment.",
    "quickstats.label": "Market quick stats",
    "nav.main": "Main",
    "nav.markets": "Markets",
    "nav.community": "Community",
    "nav.dashboard": "Dashboard",
    "nav.portfolio": "Portfolio",
    "nav.terminal": "Terminal",
    "nav.indices": "Indices",
    "nav.funds": "Funds",
    "nav.stocks": "Stocks",
    "nav.etf": "ETF",
    "nav.crypto": "Crypto",
    "nav.goldFx": "Gold & FX",
    "nav.futures": "Futures",
    "nav.technical": "Technical",
    "nav.live": "Live",
    "nav.tchat": "t-Chat",
    "nav.news": "News",
    "nav.posts": "Posts",
    "wl.title": "Top Movers",
    "wl.winners": "Gainers",
    "wl.losers": "Losers",
    "wl.symbol": "Symbol",
    "wl.price": "Price",
    "wl.change": "Change",
    "gold.title": "Gold & Precious Metals",
    "bigchart.session": "session",
    "bigchart.live": "Live",
    "bigchart.day": "D",
    "bigchart.week": "W",
    "bigchart.month": "M",
    "bigchart.collecting": "Collecting data; first points in a minute…",
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
