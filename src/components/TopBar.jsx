import { useEffect, useState } from "react";
import { FaSearch, FaBell, FaSun, FaMoon } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useTheme } from "../theme/ThemeProvider";
import { useSearch } from "../lib/search";

function formatTime(d, lang) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDate(d, lang) {
  const locale = lang === "tr" ? "tr-TR" : "en-US";
  return d.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "long" });
}

export default function TopBar() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { query, setQuery } = useSearch();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Crental</span>
          <span className="brand-sub">Terminal</span>
        </div>
        <label className="topbar-search">
          <FaSearch aria-hidden />
          <input
            type="text"
            placeholder={t("topbar.search")}
            aria-label={t("topbar.search")}
            value={query ?? ""}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="topbar-right">
        <div className="topbar-time" aria-live="polite">
          <div className="t-date">{formatDate(now, lang)}</div>
          <div className="t-clock">{formatTime(now, lang)}</div>
        </div>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            type="button"
            className={`lang-btn ${lang === "tr" ? "is-active" : ""}`}
            onClick={() => setLang("tr")}
          >
            TR
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === "en" ? "is-active" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={toggle}
          aria-label={theme === "dark" ? t("theme.toggleLight") : t("theme.toggleDark")}
          title={theme === "dark" ? t("theme.toggleLight") : t("theme.toggleDark")}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>
        <button type="button" className="topbar-icon-btn" aria-label="Notifications" title="Notifications">
          <FaBell />
        </button>
      </div>
    </header>
  );
}
