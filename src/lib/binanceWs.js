// Binance combined-stream WebSocket manager.
// Maintains a single connection, multiplexes per-symbol subscriptions,
// reconnects on close, replays subscriptions after reconnect.
//
// Public API:
//   subscribeTicker(symbol, callback) → unsubscribe fn
//
// Tick shape: { symbol, close, change, changePct, volume, ts }

const WS_URL = "wss://stream.binance.com:9443/stream";
const RECONNECT_DELAY_MS = 1500;
const MAX_RECONNECT_DELAY_MS = 30_000;

let ws = null;
let subId = 1;
let reconnectAttempt = 0;
let reconnectTimer = null;

// symbol(UPPER) → Set<callback>
const subscribers = new Map();
// stream name set, e.g. "btcusdt@ticker"
const subscribedStreams = new Set();
// last tick per symbol, served immediately to new subscribers
const lastTicks = new Map();

function streamFor(symbol) {
  return `${symbol.toLowerCase()}@ticker`;
}

function send(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify(obj)); } catch { /* ignore */ }
  }
}

function dispatch(tick) {
  lastTicks.set(tick.symbol, tick);
  const cbs = subscribers.get(tick.symbol);
  if (!cbs) return;
  for (const cb of cbs) {
    try { cb(tick); } catch { /* swallow */ }
  }
}

function handleMessage(raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }
  const data = msg?.data || msg;
  if (data?.e !== "24hrTicker") return;
  dispatch({
    symbol: data.s,
    close: parseFloat(data.c),
    change: parseFloat(data.p),
    changePct: parseFloat(data.P),
    volume: parseFloat(data.q),
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
    if (subscribedStreams.size > 0) {
      send({ method: "SUBSCRIBE", params: [...subscribedStreams], id: subId++ });
    }
  };
  ws.onmessage = (ev) => handleMessage(ev.data);
  ws.onerror = () => { /* will trigger close */ };
  ws.onclose = () => {
    ws = null;
    if (subscribedStreams.size > 0) scheduleReconnect();
  };
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const delay = Math.min(MAX_RECONNECT_DELAY_MS, RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempt));
  reconnectAttempt++;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

export function subscribeTicker(symbol, callback) {
  const sym = String(symbol || "").toUpperCase();
  if (!sym) return () => {};
  const stream = streamFor(sym);

  let set = subscribers.get(sym);
  if (!set) {
    set = new Set();
    subscribers.set(sym, set);
  }
  set.add(callback);

  // Replay last known tick immediately (so UI doesn't blank).
  const last = lastTicks.get(sym);
  if (last) {
    try { callback(last); } catch { /* swallow */ }
  }

  if (!subscribedStreams.has(stream)) {
    subscribedStreams.add(stream);
    if (ws && ws.readyState === WebSocket.OPEN) {
      send({ method: "SUBSCRIBE", params: [stream], id: subId++ });
    } else {
      connect();
    }
  }

  return () => {
    const s = subscribers.get(sym);
    if (!s) return;
    s.delete(callback);
    if (s.size === 0) {
      subscribers.delete(sym);
      subscribedStreams.delete(stream);
      send({ method: "UNSUBSCRIBE", params: [stream], id: subId++ });
    }
  };
}

// React hook helper
import { useEffect, useState } from "react";
export function useBinanceTicker(symbol) {
  const [tick, setTick] = useState(() => (symbol ? lastTicks.get(String(symbol).toUpperCase()) || null : null));
  useEffect(() => {
    if (!symbol) return;
    return subscribeTicker(symbol, setTick);
  }, [symbol]);
  return tick;
}
