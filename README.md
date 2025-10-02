# 💱 Crental Currency – React Currency Converter

A small yet handy **currency converter** built with React. It features a modern glassy card UI, mobile‑first grid layout, a **swap** button, loading/error states, and an informative line like "**1 USD = … TRY**".

> ⚠️ **Security Note:** In this example project the API key is exposed on the client. For **production**, use `.env` and a backend **proxy** to keep the key server‑side.

---

## 🚀 Features

- ✅ **Modern, responsive UI** (glass effect, soft shadows, large touch targets)
- 🔁 **Swap currencies** (e.g., USD⇄TRY) with one click
- 📈 **Live rate info** with a helpful line (e.g., `1 USD = 34.1234 TRY`)
- ⏳ **Loading / Error states** (button disables, messages displayed)
- ♿ **Accessibility**: Proper labels/aria and visible focus rings
- 🧭 **Mobile‑first** layout: single column on small screens, two columns ≥640px

---

## 🛠️ Tech Stack
- **React** (Hooks: `useState`, `useEffect`, `useMemo`)
- **axios** for HTTP requests
- **react-icons** (swap icon)
- **Plain CSS** (component‑scoped styles with CSS variables)

---

## 📦 Installation & Setup

```bash
# 1) Clone the repo
git clone https://github.com/EmirGungor/<repo-name>.git
cd <repo-name>

# 2) Install dependencies
npm install

# 3) Start the dev server
npm run dev
```

If you’re using Vite, open the **localhost** URL printed in the terminal.

---

## 🔐 Environment Variables (Recommended)
Keep your API key secret in **production** or when sharing the project:

```bash
# .env
VITE_FREECURRENCY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

```js
// src/constants.js
export const BASE_URL = "https://api.freecurrencyapi.com/v1/latest";
export const API_KEY = import.meta.env.VITE_FREECURRENCY_API_KEY; // Vite
```

> 💡 For better security, add a **Node/Express proxy** or a backend endpoint like **/api/rates** and use the key **server‑side** only.

---

## 📂 Project Structure
```plaintext
📦 src
├── 📂 components
│   └── 📄 Currency.jsx       # Main currency converter component
├── 📂 css
│   └── 📄 currency.css       # Modern, mobile‑first stylesheet
├── 📄 App.jsx                # Page layout + fixed BuyMeACoffee button
└── 📄 main.jsx               # Entry point
```

---

## 🧭 Usage
1. Enter an amount (e.g., `100`).
2. Select source and target currencies (e.g., `USD → TRY`).
3. Use the **Swap** button to flip direction if needed.
4. Click **Convert** (or submit the form) → the result is calculated.

> Rates refresh automatically whenever the **source currency** changes; the result field is **read‑only**.

---

## 📱 Screenshots
> Replace these placeholders with your own screenshots.

| Mobile | Desktop |
|---|---|
| ![mobile](https://github.com/user-attachments/assets/placeholder-mobile) | ![desktop](https://github.com/user-attachments/assets/placeholder-desktop) |

---

## 🗺️ Roadmap
- [ ] Fetch currency list **dynamically** from API + searchable select
- [ ] Keep last **5 conversions** as history
- [ ] **Reverse** live calculation (to→from)
- [ ] Optional **PWA** (offline screen, icons)

---

## 🤝 Contributing
Contributions are welcome!

```bash
# create a new branch
git checkout -b feat/responsive-improvements
# commit your changes
git commit -m "feat(ui): responsive improvements"
# push the branch
git push origin feat/responsive-improvements
```

Then open a **Pull Request**. Please stick to the existing code style and structure.

---

## 🧪 Tips & Notes
- Colors and sizes come from **CSS variables** (`:root`).
- If the title color gets overridden by some global CSS, increase specificity with `.currency-card .title`.
- Touch targets are ≥44px; focus ring is visible for accessibility.

---

## 📄 License
MIT — Use, modify, and share freely.

---

## 🙏 Acknowledgments
- [freecurrencyapi.com](https://freecurrencyapi.com/) for currency data
- Icons by [react-icons](https://react-icons.github.io/react-icons/)

> If you have feedback, open an **Issue**. Happy coding! 🚀
