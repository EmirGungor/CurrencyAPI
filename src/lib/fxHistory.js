// Frankfurter (frankfurter.dev) — free historical FX from ECB.
// Returns ascending date-sorted [{date, value}] for a given range.
const BASE = "https://api.frankfurter.dev/v1";

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function startFor(range) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  switch (range) {
    case "1d":
      d.setDate(d.getDate() - 5); // ECB has weekday gaps; widen to ensure 1+ point
      break;
    case "1w":
      d.setDate(d.getDate() - 10);
      break;
    case "1m":
      d.setMonth(d.getMonth() - 1);
      break;
    case "3m":
      d.setMonth(d.getMonth() - 3);
      break;
    case "1y":
      d.setFullYear(d.getFullYear() - 1);
      break;
    default:
      d.setMonth(d.getMonth() - 1);
  }
  return d;
}

export async function fetchFxHistory(from, to, range) {
  const start = fmt(startFor(range));
  const end = fmt(new Date());
  const url = `${BASE}/${start}..${end}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fx history ${r.status}`);
  const data = await r.json();
  const rates = data?.rates || {};
  return Object.keys(rates)
    .sort()
    .map((d) => ({ date: d, value: rates[d]?.[to] }))
    .filter((p) => Number.isFinite(p.value));
}
