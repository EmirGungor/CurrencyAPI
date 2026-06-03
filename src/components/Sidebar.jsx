import {
  FaTachometerAlt,
  FaBriefcase,
  FaTerminal,
  FaChartBar,
  FaChartLine,
  FaChartArea,
  FaLandmark,
  FaBitcoin,
  FaCoins,
  FaScroll,
  FaWaveSquare,
  FaBroadcastTower,
  FaCommentDots,
  FaUsers,
  FaNewspaper,
  FaFileAlt,
  FaCrown,
  FaStar,
  FaGlobe,
  FaRocket,
  FaMoneyBillWave,
  FaHeadset,
  FaEnvelope,
  FaInfoCircle,
  FaBullhorn,
  FaHistory,
} from "react-icons/fa";
import { useI18n } from "../i18n";
import { useRoute } from "../lib/router";

export default function Sidebar() {
  const { t } = useI18n();
  const { route, setRoute } = useRoute();

  const groups = [
    {
      label: t("nav.main"),
      links: [
        { id: "dashboard", ic: <FaTachometerAlt />, label: t("nav.dashboard") },
        { id: "portfolio", ic: <FaBriefcase />, label: t("nav.portfolio") },
        { id: "terminal", ic: <FaTerminal />, label: t("nav.terminal") },
        { id: "indices", ic: <FaChartBar />, label: t("nav.indices") },
      ],
    },
    {
      label: t("nav.markets"),
      links: [
        { id: "funds", ic: <FaChartLine />, label: t("nav.funds") },
        { id: "stocks", ic: <FaChartArea />, label: t("nav.stocks") },
        { id: "foreign-stocks", ic: <FaGlobe />, label: t("nav.foreignStocks") },
        { id: "etf", ic: <FaLandmark />, label: t("nav.etf") },
        { id: "crypto", ic: <FaBitcoin />, label: t("nav.crypto") },
        { id: "gold-fx", ic: <FaCoins />, label: t("nav.goldFx") },
        { id: "futures", ic: <FaScroll />, label: t("nav.futures") },
        { id: "technical", ic: <FaWaveSquare />, label: t("nav.technical") },
        { id: "ipo", ic: <FaRocket />, label: t("nav.ipo") },
        { id: "dividends", ic: <FaMoneyBillWave />, label: t("nav.dividends") },
      ],
    },
    {
      label: t("nav.community"),
      links: [
        { id: "live", ic: <FaBroadcastTower />, label: t("nav.live") },
        { id: "live-archive", ic: <FaHistory />, label: t("nav.liveArchive") },
        { id: "live-calendar", ic: <FaChartBar />, label: t("nav.liveCalendar") },
        { id: "tchat", ic: <FaCommentDots />, label: t("nav.tchat") },
        { id: "community", ic: <FaUsers />, label: t("nav.community") },
        { id: "news", ic: <FaNewspaper />, label: t("nav.news") },
        { id: "posts", ic: <FaFileAlt />, label: t("nav.posts") },
      ],
    },
    {
      label: t("nav.account"),
      links: [
        { id: "favorites", ic: <FaStar />, label: t("nav.favorites") },
        { id: "pro", ic: <FaCrown />, label: t("nav.pro") },
        { id: "support", ic: <FaHeadset />, label: t("nav.support") },
        { id: "revenue-program", ic: <FaBullhorn />, label: t("nav.revenueProgram") },
      ],
    },
    {
      label: t("nav.company"),
      links: [
        { id: "about", ic: <FaInfoCircle />, label: t("nav.about") },
        { id: "contact", ic: <FaEnvelope />, label: t("nav.contact") },
        { id: "changelog", ic: <FaScroll />, label: t("nav.changelog") },
      ],
    },
  ];

  return (
    <aside className="sidebar" aria-label="Navigation">
      {groups.map((g, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="sb-divider" aria-hidden />}
          <div className="sb-group-label">{g.label}</div>
          {g.links.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`sb-item ${route === l.id ? "is-active" : ""}`}
              onClick={() => setRoute(l.id)}
              title={l.label}
              aria-current={route === l.id ? "page" : undefined}
            >
              <span className="sb-ic">{l.ic}</span>
              <span className="sb-label">{l.label}</span>
            </button>
          ))}
        </div>
      ))}
      <div className="sb-divider" aria-hidden />
      <button
        type="button"
        className={`sb-pro ${route === "pro" ? "is-active" : ""}`}
        title="PRO"
        onClick={() => setRoute("pro")}
        style={{ cursor: "pointer", background: "none", border: "none", textAlign: "left", width: "100%" }}
      >
        <FaCrown />
        <span className="sb-label">PRO</span>
      </button>
    </aside>
  );
}
