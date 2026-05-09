import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";

export default function HeaderControls() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();

  return (
    <div className="header-controls">
      <div className="lang-toggle" role="group" aria-label={t("lang.label")}>
        <button
          type="button"
          className={`lang-btn ${lang === "tr" ? "is-active" : ""}`}
          onClick={() => setLang("tr")}
          aria-pressed={lang === "tr"}
        >
          TR
        </button>
        <button
          type="button"
          className={`lang-btn ${lang === "en" ? "is-active" : ""}`}
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
        >
          EN
        </button>
      </div>
      <button
        type="button"
        className="theme-btn"
        onClick={toggle}
        aria-label={theme === "dark" ? t("theme.toggleLight") : t("theme.toggleDark")}
        title={theme === "dark" ? t("theme.toggleLight") : t("theme.toggleDark")}
      >
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
}
