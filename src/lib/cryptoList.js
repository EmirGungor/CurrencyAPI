// Categorized crypto groups. Each item has a Binance symbol (USDT pair) for live data
// and a CoinGecko coinId for compatibility with our existing selection.kind="crypto".
export const CRYPTO_GROUPS = {
  top: [
    { symbol: "BTC", binance: "BTCUSDT", coinId: "bitcoin", name: "Bitcoin" },
    { symbol: "ETH", binance: "ETHUSDT", coinId: "ethereum", name: "Ethereum" },
    { symbol: "SOL", binance: "SOLUSDT", coinId: "solana", name: "Solana" },
    { symbol: "BNB", binance: "BNBUSDT", coinId: "binancecoin", name: "BNB" },
    { symbol: "XRP", binance: "XRPUSDT", coinId: "ripple", name: "XRP" },
    { symbol: "ADA", binance: "ADAUSDT", coinId: "cardano", name: "Cardano" },
    { symbol: "DOGE", binance: "DOGEUSDT", coinId: "dogecoin", name: "Dogecoin" },
    { symbol: "AVAX", binance: "AVAXUSDT", coinId: "avalanche-2", name: "Avalanche" },
    { symbol: "DOT", binance: "DOTUSDT", coinId: "polkadot", name: "Polkadot" },
    { symbol: "LINK", binance: "LINKUSDT", coinId: "chainlink", name: "Chainlink" },
    { symbol: "MATIC", binance: "MATICUSDT", coinId: "matic-network", name: "Polygon" },
    { symbol: "TON", binance: "TONUSDT", coinId: "the-open-network", name: "Toncoin" },
  ],
  defi: [
    { symbol: "UNI", binance: "UNIUSDT", coinId: "uniswap", name: "Uniswap" },
    { symbol: "AAVE", binance: "AAVEUSDT", coinId: "aave", name: "Aave" },
    { symbol: "MKR", binance: "MKRUSDT", coinId: "maker", name: "Maker" },
    { symbol: "LINK", binance: "LINKUSDT", coinId: "chainlink", name: "Chainlink" },
    { symbol: "CRV", binance: "CRVUSDT", coinId: "curve-dao-token", name: "Curve" },
    { symbol: "COMP", binance: "COMPUSDT", coinId: "compound-governance-token", name: "Compound" },
    { symbol: "LDO", binance: "LDOUSDT", coinId: "lido-dao", name: "Lido DAO" },
    { symbol: "SUSHI", binance: "SUSHIUSDT", coinId: "sushi", name: "SushiSwap" },
  ],
  meme: [
    { symbol: "DOGE", binance: "DOGEUSDT", coinId: "dogecoin", name: "Dogecoin" },
    { symbol: "SHIB", binance: "SHIBUSDT", coinId: "shiba-inu", name: "Shiba Inu" },
    { symbol: "PEPE", binance: "PEPEUSDT", coinId: "pepe", name: "Pepe" },
    { symbol: "FLOKI", binance: "FLOKIUSDT", coinId: "floki", name: "Floki" },
    { symbol: "BONK", binance: "BONKUSDT", coinId: "bonk", name: "Bonk" },
    { symbol: "WIF", binance: "WIFUSDT", coinId: "dogwifcoin", name: "dogwifhat" },
  ],
  l2: [
    { symbol: "ARB", binance: "ARBUSDT", coinId: "arbitrum", name: "Arbitrum" },
    { symbol: "OP", binance: "OPUSDT", coinId: "optimism", name: "Optimism" },
    { symbol: "MATIC", binance: "MATICUSDT", coinId: "matic-network", name: "Polygon" },
    { symbol: "IMX", binance: "IMXUSDT", coinId: "immutable-x", name: "Immutable X" },
    { symbol: "STRK", binance: "STRKUSDT", coinId: "starknet", name: "Starknet" },
  ],
};

export async function fetchCryptoQuotes(symbols) {
  const list = symbols.join(",");
  const r = await fetch(`/api/binance-24hr?symbols=${encodeURIComponent(list)}`);
  if (!r.ok) throw new Error(`binance ${r.status}`);
  const data = await r.json();
  return (Array.isArray(data) ? data : []).map((t) => ({
    symbol: t.symbol,
    close: parseFloat(t.lastPrice),
    change: parseFloat(t.priceChange),
    changePct: parseFloat(t.priceChangePercent),
    volume: parseFloat(t.quoteVolume),
  }));
}
