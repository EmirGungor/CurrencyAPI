# Crental — Döviz · Kripto · Altın · Türkiye Piyasaları

Modern, hızlı, mobil uyumlu bir finans paneli. Canlı döviz çevirici, kripto fiyatları (BTC, ETH, XAU), Türk piyasası verileri (USD/TRY, EUR/TRY, GBP/TRY, CHF/TRY ve gram/çeyrek/yarım/tam/cumhuriyet altın + gümüş), ışık/karanlık tema, TR/EN dil seçimi ve PWA desteği.

## Özellikler

- **Çoklu kaynak piyasa kartları**
  - Kripto + ons altın: CoinGecko (BTC, ETH, XAU/USDT) — 7 günlük sparkline ile
  - Türkiye piyasaları: truncgil (USD/TRY, EUR/TRY, GBP/TRY, CHF/TRY, gram altın, çeyrek/yarım/tam/cumhuriyet altın, gümüş)
- **Akıllı döviz çevirici**
  - 30+ para birimi için **dinamik liste** (freecurrencyapi `/currencies` endpointi)
  - **Aranabilir** combobox (kod veya isimle)
  - **Çift yönlü hesap**: hem kaynaktan hedefe hem hedeften kaynağa anlık dönüştürme
  - **localStorage geçmişi** (son 8 çevirme — tek tıkla geri yükleme)
- **Tema sistemi** — `data-theme` attribute ile light/dark, tercih localStorage'a kaydedilir
- **Çift dil** — TR / EN UI metinleri (custom hafif i18n provider)
- **PWA** — yüklenebilir, offline cache (truncgil + CoinGecko + freecurrencyapi 5–60 dk)
- **Erişilebilirlik** — interaktif öğelerde aria-label, focus ring, klavye desteği
- **SEO + sosyal paylaşım** — title/description, OpenGraph, Twitter card, OG image

## Teknoloji

- **Vite 5** + **React 18**
- `axios` (FX), native `fetch` (truncgil)
- `react-icons` (FA + Game Icons)
- `vite-plugin-pwa` (Workbox)
- Plain CSS — `src/styles/*.css` modüllerine bölünmüş

## Kurulum

```bash
git clone <repo-url>
cd CurrencyAPI-main
npm install
cp .env.example .env  # ardından kendi API key'ini gir
npm run dev           # http://localhost:5173
```

### `.env`
```bash
VITE_FREECURRENCY_API_KEY=fca_live_...
```
Anahtarı [freecurrencyapi.com](https://freecurrencyapi.com/) üzerinden ücretsiz alabilirsin.

## Komutlar
```bash
npm run dev       # Vite dev server (HMR)
npm run build     # production build (PWA assets dahil)
npm run preview   # build çıktısını lokalde sun
npm run lint      # ESLint
```

## Proje yapısı
```
src/
├── components/
│   ├── BistCards.jsx         # Türkiye piyasası kartları (truncgil)
│   ├── BuyMeACofee.jsx
│   ├── Currency.jsx          # Çevirici + dinamik liste + history
│   ├── HeaderControls.jsx    # Dil + tema toggle
│   ├── MarketCards.jsx       # Kripto + altın (CoinGecko)
│   └── Sparkline.jsx         # SVG mini chart
├── i18n/
│   └── index.jsx             # I18nProvider + STRINGS
├── theme/
│   └── ThemeProvider.jsx     # data-theme yönetimi
├── lib/
│   ├── storage.js            # localStorage helpers (history/theme/lang)
│   └── yfinance.js           # Yahoo Finance helper (proxy üzerinden)
├── styles/
│   ├── tokens.css            # CSS değişkenleri (light + dark)
│   ├── base.css              # body / app-shell / header / footer
│   ├── cards.css             # market kartları + sparkline
│   ├── currency.css          # çevirici card + form + input
│   └── controls.css          # tema/dil butonları + combo + history
├── config.js                 # API anahtarları + base URL'ler
├── App.css                   # @import hub
├── App.jsx
└── main.jsx                  # Provider sarmalamaları
api/
├── yfinance.js               # Vercel serverless proxy (BIST için)
└── yfinance-chart.js         # Vercel serverless chart proxy
```

## Veri kaynakları

| Kaynak | Endpoint | Kullanım |
|---|---|---|
| **freecurrencyapi** | `/v1/latest`, `/v1/currencies` | Çevirici kurları + tüm para listesi |
| **CoinGecko** | `/simple/price`, `/coins/{id}/market_chart` | BTC/ETH/XAU + 7g sparkline |
| **truncgil** | `https://finans.truncgil.com/today.json` | TRY pariteleri + altın çeşitleri + gümüş |
| **Yahoo Finance** *(opt.)* | `/v7/finance/quote`, `/v8/finance/chart` | XU100/XU030 BIST endeksleri (proxy gerekiyor) |

## BIST 100 / 30 (XU100, XU030) hakkında

`src/lib/yfinance.js` + `api/yfinance*.js` ile altyapı hazır — geliştirmede `vite.config.js`'teki `/yf` proxy, üretimde Vercel serverless function (`api/yfinance.js`) kullanılır. Yahoo Finance şu anda çoğu bölgede crumb/cookie tabanlı oranlama uygular; sandbox/CI'da 429 alınabilir. Üretimde Vercel proxy genellikle çalışır.

Daha güvenilir alternatifler:
- [collectAPI](https://collectapi.com/) `/economy/dailyBist` (API key gerektirir)
- TradingView UDF (self-host)
- KAP (resmi açıklamalar — gerçek zamanlı endeks yok)

Şu an **Türkiye Piyasaları** kartları truncgil'den besleniyor (USD/TRY, EUR/TRY, GBP/TRY, CHF/TRY, gram/çeyrek/yarım/tam/cumhuriyet altın, gümüş) — Türk kullanıcı için BIST endeksinden çoğu zaman daha aksiyonel veri.

## Üretim — güvenli API key

`.env`'deki `VITE_*` değişkenler Vite tarafından **client bundle'a gömülür**. Üretim için:

1. **Vercel** (veya Netlify) ile deploy et — `api/` klasöründeki proxy fonksiyonları otomatik çalışır.
2. Frontend'i `/api/rates` gibi proxy'lere yönlendir, key'i sadece sunucu env'inde tut.
3. `VITE_FREECURRENCY_API_KEY`'i client'tan kaldır, fonksiyonun içinden `process.env.FREECURRENCY_API_KEY` ile çağır.

`api/yfinance.js` örneği aynı patterni kullanır — kopyalayıp yeni bir `api/rates.js` yazabilirsin.

## Yol haritası

- [ ] BIST 100/30 entegrasyonu (collectAPI veya alternatif kaynak)
- [ ] FX çeviriciye chart (haftalık/aylık trend)
- [ ] Watchlist (favori para çiftleri)
- [ ] Push bildirim (eşik fiyat alarmı)

## Lisans
MIT
