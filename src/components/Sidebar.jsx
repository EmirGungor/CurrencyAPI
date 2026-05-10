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
        { id: "etf", ic: <FaLandmark />, label: t("nav.etf") },
        { id: "crypto", ic: <FaBitcoin />, label: t("nav.crypto") },
        { id: "gold-fx", ic: <FaCoins />, label: t("nav.goldFx") },
        { id: "futures", ic: <FaScroll />, label: t("nav.futures") },
        { id: "technical", ic: <FaWaveSquare />, label: t("nav.technical") },
      ],
    },
    {
      label: t("nav.community"),
      links: [
        { id: "live", ic: <FaBroadcastTower />, label: t("nav.live") },
        { id: "tchat", ic: <FaCommentDots />, label: t("nav.tchat") },
        { id: "community", ic: <FaUsers />, label: t("nav.community") },
        { id: "news", ic: <FaNewspaper />, label: t("nav.news") },
        { id: "posts", ic: <FaFileAlt />, label: t("nav.posts") },
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
      <div className="sb-pro" title="PRO">
        <FaCrown />
        <span className="sb-label">PRO</span>
      </div>
    </aside>
  );
}
