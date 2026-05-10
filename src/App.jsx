import "./App.css";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import {
  DashboardPage,
  StocksPage,
  CryptoPage,
  GoldFxPage,
  TerminalPage,
  FundsPage,
  ComingSoonPage,
} from "./components/RoutePages";
import { useRoute } from "./lib/router";
import { useI18n } from "./i18n";

const ROUTE_LABELS = {
  portfolio: "nav.portfolio",
  indices: "nav.indices",
  etf: "nav.etf",
  futures: "nav.futures",
  technical: "nav.technical",
  live: "nav.live",
  tchat: "nav.tchat",
  community: "nav.community",
  news: "nav.news",
  posts: "nav.posts",
};

function App() {
  const { route } = useRoute();
  const { t } = useI18n();

  let page;
  switch (route) {
    case "stocks":
      page = <StocksPage />;
      break;
    case "crypto":
      page = <CryptoPage />;
      break;
    case "gold-fx":
      page = <GoldFxPage />;
      break;
    case "terminal":
      page = <TerminalPage />;
      break;
    case "funds":
      page = <FundsPage />;
      break;
    case "dashboard":
      page = <DashboardPage />;
      break;
    default: {
      const labelKey = ROUTE_LABELS[route];
      page = <ComingSoonPage id={route} label={labelKey ? t(labelKey) : route} />;
    }
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="shell-body">
        <Sidebar />
        <main className="main">{page}</main>
      </div>
    </div>
  );
}

export default App;
