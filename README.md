# 💱 Crental Currency – React Tabanlı Döviz Çevirici

Küçük ama işlevsel bir **döviz çevirici**. Modern bir kart tasarımı, mobil‑öncelikli (mobile‑first) Grid düzeni, swap (para birimlerini değiştir) butonu, yükleniyor/hata durumları ve "**1 USD = … TRY**" gibi bilgilendirici oran satırı içerir.

> ⚠️ **Not (Güvenlik):** Örnek projede API anahtarı client tarafında gösterilmiştir. **Canlı ortamda** `.env` + backend **proxy** kullanarak gizlemeniz önerilir.

---

## 🚀 Özellikler

- ✅ **Modern, responsive UI** (cam efekti, yumuşak gölgeler, büyük dokunma hedefleri)
- 🔁 **Swap** (USD⇄TRY gibi para birimlerini tek tıkla değiştir)
- 📈 **Anlık kur bilgisi** ve bilgilendirici oran metni (ör. `1 USD = 34.1234 TRY`)
- ⏳ **Loading / Error** durumları (buton kilitlenir, mesajlar gösterilir)
- ♿ **Erişilebilirlik**: Label/aria nitelikleri, belirgin focus ring
- 🧭 **Mobile‑first**: Küçük ekranlarda tek sütun, ≥640px’de iki sütun

---

## 🛠️ Kullanılan Teknolojiler
- **React** (Hooks: `useState`, `useEffect`, `useMemo`)
- **axios** ile HTTP istekleri
- **react-icons** (swap ikonu)
- **Plain CSS** (Component bazlı, değişken destekli tema)

---

## 📦 Kurulum & Çalıştırma

```bash
# 1) Repoyu klonlayın
git clone https://github.com/EmirGungor/<repo-adi>.git
cd <repo-adi>

# 2) Bağımlılıkları yükleyin
npm install

# 3) Geliştirme sunucusunu başlatın
npm run dev
```

Vite kullanıyorsanız terminalde verilen **localhost** adresini açın.

---

## 🔐 Ortam Değişkenleri (Önerilen)
**Canlı** veya paylaşılacak ortamlarda anahtarı saklamak için:

```bash
# .env
VITE_FREECURRENCY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

```js
// src/constants.js
export const BASE_URL = "https://api.freecurrencyapi.com/v1/latest";
export const API_KEY = import.meta.env.VITE_FREECURRENCY_API_KEY; // Vite
```

> 💡 Daha iyi güvenlik için bir **Node/Express proxy** veya mevcut backend’inize bir **/api/rates** uç noktası ekleyin ve anahtarı **server tarafında** kullanın.

---

## 📂 Proje Yapısı
```plaintext
📦 src
├── 📂 components
│   └── 📄 Currency.jsx       # Ana döviz çevirici bileşeni
├── 📂 css
│   └── 📄 currency.css       # Modern, mobile-first stil dosyası
├── 📄 App.jsx                # Sayfa düzeni + BuyMeACoffee sabit butonu
└── 📄 main.jsx               # Giriş noktası
```

---

## 🧭 Kullanım
1. Miktarı gir (örn. `100`).
2. Kaynak ve hedef para birimlerini seç (örn. `USD → TRY`).
3. **Swap** butonuyla yönü değiştir.
4. **Convert** (ya da formu gönder) → sonuç otomatik hesaplanır.

> Kur bilgisi, **kaynak para birimi** değiştiğinde otomatik yenilenir; sonuç alanı **salt okunur** olarak tutulur.

---

## 📱 Ekran Görüntüleri
> Bu alanı kendi ekran görüntülerinle güncelle.

| Mobil | Masaüstü |
|---|---|
| ![mobile](https://github.com/user-attachments/assets/placeholder-mobile) | ![desktop](https://github.com/user-attachments/assets/placeholder-desktop) |

---

## 🗺️ Yol Haritası
- [ ] Para birimlerini API’den **dinamik** çekme + arama yapılabilen select
- [ ] Son **5 çeviri geçmişi**
- [ ] **Ters yönde** anlık hesaplama (to→from)
- [ ] **İsteğe bağlı** PWA (offline ekranı, ikonlar)

---

## 🤝 Katkıda Bulunma
Katkılar memnuniyetle karşılanır!

```bash
# yeni bir dal oluşturun
git checkout -b feat/responsive-improvements
# değişiklikleri commit’leyin
git commit -m "feat(ui): responsive iyileştirmeler"
# dalı gönderin
git push origin feat/responsive-improvements
```

Ardından bir **Pull Request** açın. Kod stili ve dosya yapısını korumaya dikkat edin.

---

## 🧪 Notlar / İpuçları
- Renkler ve ölçüler **CSS değişkenleri** üzerinden geliyor (`:root`).
- Başlık rengi başka bir global kural tarafından **eziliyorsa**, `.currency-card .title` ile özgüllüğü artırın.
- Dokunmatik hedefler ≥44px; erişilebilirlik için **focus ring** açık.

---

## 📄 Lisans
MIT — Dilediğiniz gibi kullanın, geliştirin, paylaşın.

---

## 🙏 Teşekkür
- [freecurrencyapi.com](https://freecurrencyapi.com/) kur verileri için
- İkonlar: [react-icons](https://react-icons.github.io/react-icons/)

> Geri bildirimlerin varsa **Issues** bölümünde paylaşabilirsin. Keyifli kodlamalar! 🚀

