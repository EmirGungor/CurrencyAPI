const HISTORY_KEY = "crental:history:v1";
const THEME_KEY = "crental:theme";
const LANG_KEY = "crental:lang";
const MAX_HISTORY = 8;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(items.slice(0, MAX_HISTORY))
    );
  } catch {
    // ignore quota errors
  }
}

export function pushHistory(entry) {
  const list = loadHistory();
  const next = [
    { ...entry, ts: Date.now() },
    ...list.filter(
      (i) =>
        !(
          i.from === entry.from &&
          i.to === entry.to &&
          i.amount === entry.amount
        )
    ),
  ].slice(0, MAX_HISTORY);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  saveHistory([]);
  return [];
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function loadLang() {
  try {
    return localStorage.getItem(LANG_KEY) || "tr";
  } catch {
    return "tr";
  }
}

export function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
}
