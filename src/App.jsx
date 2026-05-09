import "./App.css";
import BuyMeACoffee from "./components/BuyMeACofee";
import Currency from "./components/Currency";
import MarketCards from "./components/MarketCards";
import BistCards from "./components/BistCards";
import TopStocks from "./components/TopStocks";
import HeaderControls from "./components/HeaderControls";
import { useI18n } from "./i18n";

function App() {
  const { t } = useI18n();
  return (
    <>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">Crental</span>
            <span className="brand-sub">Currency</span>
          </div>
          <div className="header-right">
            <span className="brand-tag">{t("brand.tag")}</span>
            <HeaderControls />
          </div>
        </header>

        <main className="app-main">
          <MarketCards />
          <TopStocks />
          <BistCards />
          <Currency />
        </main>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Crental</span>
          <span className="dot">•</span>
          <span>{t("footer.tag")}</span>
        </footer>
      </div>

      <div className="bmc-floating">
        <BuyMeACoffee />
      </div>
    </>
  );
}

export default App;
