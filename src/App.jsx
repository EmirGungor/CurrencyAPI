import "./App.css";
import BuyMeACoffee from "./components/BuyMeACofee";
import Currency from "./components/Currency";
import MarketCards from "./components/MarketCards";

function App() {
  return (
    <>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">Crental</span>
            <span className="brand-sub">Currency</span>
          </div>
          <span className="brand-tag">Live FX · Crypto · Metals</span>
        </header>

        <main className="app-main">
          <MarketCards />
          <Currency />
        </main>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Crental</span>
          <span className="dot">•</span>
          <span>Built with precision</span>
        </footer>
      </div>

      <div className="bmc-floating">
        <BuyMeACoffee />
      </div>
    </>
  );
}

export default App;
