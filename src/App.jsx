import { useCallback } from "react";
import Converter from "./components/Converter";
import TickerTile from "./components/TickerTile";
import { useTheme } from "./theme/ThemeProvider";
import { subscribeCrypto, subscribeGold, subscribeIndex, CNBC_SYMBOLS } from "./lib/feeds";
import { isBistOpen, isUsMarketOpen, isForexOpen } from "./lib/marketHours";

export default function App() {
  const { theme, toggle } = useTheme();

  // Subscriptions are stable refs per ticker so TickerTile's effect re-runs cleanly.
  const subBtc  = useCallback((cb) => subscribeCrypto("BTCUSDT", cb), []);
  const subEth  = useCallback((cb) => subscribeCrypto("ETHUSDT", cb), []);
  const subGold = useCallback((cb) => subscribeGold(cb), []);
  const subXu100 = useCallback((cb) => subscribeIndex(CNBC_SYMBOLS.XU100, cb), []);
  const subIxic  = useCallback((cb) => subscribeIndex(CNBC_SYMBOLS.IXIC, cb), []);
  const subGspc  = useCallback((cb) => subscribeIndex(CNBC_SYMBOLS.GSPC, cb), []);
  const subDji   = useCallback((cb) => subscribeIndex(CNBC_SYMBOLS.DJI, cb), []);
  const subVix   = useCallback((cb) => subscribeIndex(CNBC_SYMBOLS.VIX, cb), []);

  const bistOpen = isBistOpen();
  const usOpen   = isUsMarketOpen();
  const fxOpen   = isForexOpen();

  return (
    <>
      <div className="bg-mesh" aria-hidden>
        <i /><i />
      </div>

      <div className="app">
        <header className="header">
          <div className="brand">
            <div className="brand-mark">C</div>
            <div className="brand-text">
              <h1>Crental</h1>
              <p>Canlı kur, kripto, emtia ve endeks</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              aria-label={theme === "dark" ? "Aydınlık moda geç" : "Karanlık moda geç"}
              title={theme === "dark" ? "Aydınlık" : "Karanlık"}
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <Converter />

        <div className="bento">
          <TickerTile
            sym="BTC"
            name="Bitcoin"
            icon="₿"
            gradient="linear-gradient(135deg, #f7931a, #ffd166)"
            currency="$"
            decimals={2}
            subscribe={subBtc}
            alwaysLive
          />
          <TickerTile
            sym="ETH"
            name="Ethereum"
            icon="Ξ"
            gradient="linear-gradient(135deg, #627eea, #8a9bff)"
            currency="$"
            decimals={2}
            subscribe={subEth}
            alwaysLive
          />
          <TickerTile
            sym="GOLD"
            name="Gram Altın (TRY)"
            icon="Au"
            gradient="linear-gradient(135deg, #f5b942, #ffd966)"
            currency="₺"
            decimals={2}
            subscribe={subGold}
            isOpen={fxOpen}
          />
          <TickerTile
            sym="BIST 100"
            name="Borsa İstanbul"
            icon="BI"
            gradient="linear-gradient(135deg, #e63946, #ff6b6b)"
            currency=""
            decimals={2}
            subscribe={subXu100}
            isOpen={bistOpen}
          />
          <TickerTile
            sym="NASDAQ"
            name="Composite (IXIC)"
            icon="ND"
            gradient="linear-gradient(135deg, #0ea5e9, #2cc6ff)"
            currency=""
            decimals={2}
            subscribe={subIxic}
            isOpen={usOpen}
          />
          <TickerTile
            sym="S&P 500"
            name="GSPC"
            icon="SP"
            gradient="linear-gradient(135deg, #7c5cff, #a78bfa)"
            currency=""
            decimals={2}
            subscribe={subGspc}
            isOpen={usOpen}
          />
          <TickerTile
            sym="DOW"
            name="Dow Jones (DJI)"
            icon="DJ"
            gradient="linear-gradient(135deg, #15b96b, #2dd47e)"
            currency=""
            decimals={2}
            subscribe={subDji}
            isOpen={usOpen}
          />
          <TickerTile
            sym="VIX"
            name="Volatilite Endeksi"
            icon="VX"
            gradient="linear-gradient(135deg, #ff5dcd, #ff8ada)"
            currency=""
            decimals={2}
            subscribe={subVix}
            isOpen={usOpen}
          />
        </div>

        <footer className="footer">
          <span>Veriler bilgilendirme amaçlıdır</span>
          <span> · </span>
          <a href="https://api.frankfurter.dev" target="_blank" rel="noreferrer">Frankfurter</a>
          <span>·</span>
          <a href="https://www.binance.com" target="_blank" rel="noreferrer">Binance</a>
          <span>·</span>
          <a href="https://finance.yahoo.com" target="_blank" rel="noreferrer">Yahoo</a>
        </footer>
      </div>
    </>
  );
}
