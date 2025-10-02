# 💱 Crental Currency – React Currency Converter
├── 📂 css
│ └── 📄 currency.css # Modern, mobile‑first stylesheet
├── 📄 App.jsx # Page layout + fixed BuyMeACoffee button
└── 📄 main.jsx # Entry point
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
