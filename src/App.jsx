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
import PortfolioPage from "./components/PortfolioPage";
import {
  IpoPage,
  DividendsPage,
  ForeignStocksPage,
  FavoritesPage,
  ProPage,
  ContactPage,
  SupportPage,
  LiveArchivePage,
  LiveCalendarPage,
  RevenueProgramPage,
  FundsInvestmentPage,
  FundsBesPage,
  FundsByfPage,
  FundsLeaguePage,
  FundsGlancePage,
  FundsCompaniesPage,
  FundsComparePage,
  FundsSimPage,
  FundsSmartPage,
  FundsReversePage,
  FundsOverlapPage,
  FundsRotationPage,
  AboutPage,
  DisclaimerPage,
  TosPage,
  KvkkPage,
  PrivacyPage,
  ChangelogPage,
} from "./components/StaticPages";
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

const ROUTE_COMPONENTS = {
  dashboard: DashboardPage,
  stocks: StocksPage,
  crypto: CryptoPage,
  "gold-fx": GoldFxPage,
  terminal: TerminalPage,
  funds: FundsPage,
  portfolio: PortfolioPage,
  favorites: FavoritesPage,
  support: SupportPage,
  pro: ProPage,
  "revenue-program": RevenueProgramPage,
  "foreign-stocks": ForeignStocksPage,
  ipo: IpoPage,
  dividends: DividendsPage,
  "live-archive": LiveArchivePage,
  "live-calendar": LiveCalendarPage,
  "funds-investment": FundsInvestmentPage,
  "funds-bes": FundsBesPage,
  "funds-byf": FundsByfPage,
  "funds-league": FundsLeaguePage,
  "funds-glance": FundsGlancePage,
  "funds-companies": FundsCompaniesPage,
  "funds-compare": FundsComparePage,
  "funds-sim": FundsSimPage,
  "funds-smart": FundsSmartPage,
  "funds-reverse": FundsReversePage,
  "funds-overlap": FundsOverlapPage,
  "funds-rotation": FundsRotationPage,
  contact: ContactPage,
  changelog: ChangelogPage,
  about: AboutPage,
  disclaimer: DisclaimerPage,
  tos: TosPage,
  kvkk: KvkkPage,
  privacy: PrivacyPage,
};

function App() {
  const { route } = useRoute();
  const { t } = useI18n();

  const Component = ROUTE_COMPONENTS[route];
  let page;
  if (Component) {
    page = <Component />;
  } else {
    const labelKey = ROUTE_LABELS[route];
    page = <ComingSoonPage id={route} label={labelKey ? t(labelKey) : route} />;
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
