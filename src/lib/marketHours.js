// Market hours helpers — determine whether a given market is currently open.
// Uses the browser's Intl APIs to avoid timezone libs.

function partsInTz(date, tz) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  return {
    weekday: parts.weekday, // Mon, Tue, ...
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
  };
}

const isWeekday = (w) => !["Sat", "Sun"].includes(w);

// BIST: Mon-Fri 09:55-18:00 TR (Europe/Istanbul). Tolerant pre-open window.
export function isBistOpen(date = new Date()) {
  const { weekday, hour, minute } = partsInTz(date, "Europe/Istanbul");
  if (!isWeekday(weekday)) return false;
  const m = hour * 60 + minute;
  return m >= 9 * 60 + 55 && m < 18 * 60;
}

// NYSE/NASDAQ: Mon-Fri 09:30-16:00 America/New_York (ignores half-days/holidays).
export function isUsMarketOpen(date = new Date()) {
  const { weekday, hour, minute } = partsInTz(date, "America/New_York");
  if (!isWeekday(weekday)) return false;
  const m = hour * 60 + minute;
  return m >= 9 * 60 + 30 && m < 16 * 60;
}

// Forex: open Sun 22:00 UTC → Fri 22:00 UTC. Drives FX/TRY pairs.
export function isForexOpen(date = new Date()) {
  const day = date.getUTCDay();
  const hour = date.getUTCHours();
  if (day === 6) return false; // Sat
  if (day === 0) return hour >= 22; // Sun before 22 UTC
  if (day === 5) return hour < 22; // Fri after 22 UTC
  return true;
}

export const isCryptoOpen = () => true;
