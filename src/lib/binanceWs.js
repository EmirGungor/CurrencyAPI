// Single multiplexed WebSocket connection to Binance combined streams.
// Exposes subscribeTicker(symbol, callback) → unsubscribe fn.
// Tick: { symbol, close, changePct, ts }

const WS_URL = "wss://stream.binance.com:9443/stream";
const RECONNECT_BASE_MS = 1500;
const MAX_RECONNECT_MS = 30_000;

let ws = null;
let subId = 1;
let reconnectAttempt = 0;
let reconnectTimer = null;

const subscribers = new Map(); // SYM -> Set<callback>
const subscribed = new Set();  // stream names
const lastTicks = new Map();

const streamOf = (sym) => `${sym.toLowerCase()}@ticker`;

function send(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify(obj)); } catch { /* ignore */ }
  }
}

function dispatch(t) {
  lastTicks.set(t.symbol, t);
  const cbs = subscribers.get(t.symbol);
  if (!cbs) return;
  for (const cb of cbs) {
    try { cb(t); } catch { /* swallow */ }
  }
}

function onMessage(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }
  const d = msg?.data || msg;
  if (d?.e !== "24hrTicker") return;
  dispatch({
    symbol: d.s,
    close: parseFloat(d.c),
    changePct: parseFloat(d.P),
    ts: Date.now(),
  });
}

function connect() {
  if (typeof WebSocket === "undefined") return;
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  try {
    ws = new WebSocket(WS_URL);
  } catch {
    scheduleReconnect();
    return;
  }
  ws.onopen = () => {
    reconnectAttempt = 0;
    if (subscribed.size > 0) {
      send({ method: "SUBSCRIBE", params: [...subscribed], id: subId++ });
    }
  };
  ws.onmessage = (e) => onMessage(e.data);
  ws.onerror = () => { /* triggers close */ };
  ws.onclose = () => {
    ws = null;
    if (subscribed.size > 0) scheduleReconnect();
  };
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const delay = Math.min(MAX_RECONNECT_MS, RECONNECT_BASE_MS * 2 ** reconnectAttempt);
  reconnectAttempt++;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

export function subscribeTicker(symbol, cb) {
  const sym = String(symbol || "").toUpperCase();
  if (!sym) return () => {};
  const stream = streamOf(sym);

  let set = subscribers.get(sym);
  if (!set) {
    set = new Set();
    subscribers.set(sym, set);
  }
  set.add(cb);

  // Replay last tick if we have it
  const last = lastTicks.get(sym);
  if (last) {
    try { cb(last); } catch { /* swallow */ }
  }

  if (!subscribed.has(stream)) {
    subscribed.add(stream);
    if (ws && ws.readyState === WebSocket.OPEN) {
      send({ method: "SUBSCRIBE", params: [stream], id: subId++ });
    } else {
      connect();
    }
  }

  return () => {
    const s = subscribers.get(sym);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) {
      subscribers.delete(sym);
      subscribed.delete(stream);
      send({ method: "UNSUBSCRIBE", params: [stream], id: subId++ });
    }
  };
}
