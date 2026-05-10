import {
  FaChartLine,
  FaBitcoin,
  FaCoins,
  FaChartArea,
  FaWrench,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import QuickStats from "./QuickStats";
import BigChart from "./BigChart";
import WinnersLosers from "./WinnersLosers";
import GoldList from "./GoldList";
import TopStocks from "./TopStocks";
import Currency from "./Currency";
import FundsPanel from "./FundsPanel";

export function DashboardPage() {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t("page.title")}</h1>
      </div>
      <QuickStats />
      <div className="main-grid">
        <div className="main-grid-left">
          <BigChart />
          <WinnersLosers />
        </div>
        <div className="main-grid-right">
          <TopStocks />
          <Currency />
          <GoldList />
        </div>
      </div>
    </>
  );
}

export function FundsPage() {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t("nav.funds")}</h1>
      </div>
      <QuickStats />
      <div className="main-grid">
        <div className="main-grid-left">
          <BigChart />
          <FundsPanel />
        </div>
        <div className="main-grid-right">
          <GoldList />
          <Currency />
        </div>
      </div>
    </>
  );
}

export function StocksPage() {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t("nav.stocks")}</h1>
      </div>
      <QuickStats />
      <div className="main-grid">
        <div className="main-grid-left">
          <BigChart />
          <WinnersLosers />
        </div>
        <div className="main-grid-right">
          <TopStocks />
        </div>
      </div>
    </>
  );
}

export function CryptoPage() {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t("nav.crypto")}</h1>
      </div>
      <QuickStats />
      <div className="main-grid">
        <div className="main-grid-left">
          <BigChart />
        </div>
        <div className="main-grid-right">
          <TopStocks />
        </div>
      </div>
    </>
  );
}

export function GoldFxPage() {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t("nav.goldFx")}</h1>
      </div>
      <QuickStats />
      <div className="main-grid">
        <div className="main-grid-left">
          <BigChart />
          <Currency />
        </div>
        <div className="main-grid-right">
          <GoldList />
        </div>
      </div>
    </>
  );
}

export function TerminalPage() {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{t("nav.terminal")}</h1>
      </div>
      <QuickStats />
      <div className="main-grid">
        <div className="main-grid-left">
          <BigChart />
          <WinnersLosers />
        </div>
        <div className="main-grid-right">
          <TopStocks />
          <GoldList />
        </div>
      </div>
    </>
  );
}

const ICONS = {
  portfolio: <FaChartArea />,
  indices: <FaChartLine />,
  funds: <FaChartLine />,
  etf: <FaCoins />,
  futures: <FaCoins />,
  technical: <FaChartLine />,
  live: <FaBitcoin />,
  tchat: <FaWrench />,
  community: <FaWrench />,
  news: <FaWrench />,
  posts: <FaWrench />,
};

export function ComingSoonPage({ id, label }) {
  const { t } = useI18n();
  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{label}</h1>
      </div>
      <div className="panel">
        <div className="panel-body" style={{ padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, color: "var(--primary)", marginBottom: 12 }}>
            {ICONS[id] || <FaWrench />}
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>{label}</h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            {t("page.comingSoon")}
          </p>
        </div>
      </div>
    </>
  );
}
