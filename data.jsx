// data.jsx — seed data + live simulation utilities

const TRADERS = [
  { id: 't1', name: "DiamondHand", handle: "0x4f...91a3", color: "#FF8C42", roi: 142.4, win: 78, copiers: 2841, pnl: 184230, online: true,   bias: "bull" },
  { id: 't2', name: "OrcaWhale",   handle: "0x9a...b0e2", color: "#22C55E", roi: 98.2,  win: 71, copiers: 1923, pnl: 92410,  online: true,   bias: "bull" },
  { id: 't3', name: "MidnightFox", handle: "0x12...c4d1", color: "#A78BFA", roi: 64.8,  win: 65, copiers: 1402, pnl: 58210,  online: false,  bias: "neutral" },
  { id: 't4', name: "GammaGoat",   handle: "0x77...88f4", color: "#F97316", roi: 51.3,  win: 62, copiers: 1187, pnl: 44120,  online: true,   bias: "bear" },
  { id: 't5', name: "ZeroSumZ",    handle: "0xab...12c0", color: "#06B6D4", roi: 47.1,  win: 60, copiers: 998,  pnl: 38940,  online: true,   bias: "bull" },
  { id: 't6', name: "QuiverQ",     handle: "0xde...4502", color: "#EC4899", roi: 39.5,  win: 58, copiers: 812,  pnl: 31200,  online: false,  bias: "bull" },
  { id: 't7', name: "PolyGrid",    handle: "0x33...771a", color: "#FACC15", roi: 33.8,  win: 56, copiers: 654,  pnl: 24800,  online: true,   bias: "neutral" },
  { id: 't8', name: "VegaVulture", handle: "0x55...9912", color: "#84CC16", roi: 28.4,  win: 54, copiers: 521,  pnl: 19420,  online: true,   bias: "bull" },
  { id: 't9', name: "BrickByBrick",handle: "0x88...0aa2", color: "#FB7185", roi: 22.7,  win: 53, copiers: 411,  pnl: 14820,  online: false,  bias: "bear" },
  { id: 't10', name: "OracleOwl",  handle: "0x44...e1d3", color: "#38BDF8", roi: 18.9,  win: 51, copiers: 332,  pnl: 11920,  online: true,   bias: "neutral" },
  { id: 't11', name: "ThetaThief", handle: "0x66...1b2f", color: "#FDE047", roi: 15.4,  win: 49, copiers: 271,  pnl: 9840,   online: false,  bias: "bear" },
  { id: 't12', name: "RugPullRex", handle: "0x99...4c5e", color: "#F472B6", roi: -8.2,  win: 41, copiers: 180,  pnl: -3920,  online: true,   bias: "bear" },
];

const WALLETS = [
  { id: 'w1', chain: 'eth',  name: "Main · Ethereum",  addr: "0x4f9c…91a3", balance: 184230.42, delta: 4.21,  tokens: 12 },
  { id: 'w2', chain: 'poly', name: "Polygon Vault",     addr: "0x9a23…b0e2", balance: 42180.10,  delta: -1.42, tokens: 7  },
  { id: 'w3', chain: 'base', name: "Base Trader",       addr: "0x12fe…c4d1", balance: 31092.55,  delta: 8.92,  tokens: 5  },
  { id: 'w4', chain: 'sol',  name: "Solana Hot Wallet", addr: "Hk3p…XmAq",   balance: 18403.71,  delta: 2.14,  tokens: 9  },
];

const MARKETS = [
  { id: 'm1', q: "Will the Fed cut rates by Sept 2026?",            cat: "Macro",     vol: 4.2,   yes: 64, ends: "Sep 18", traders: 1842 },
  { id: 'm2', q: "Bitcoin to break $200k before Q4 2026?",          cat: "Crypto",    vol: 12.8,  yes: 38, ends: "Oct 1",  traders: 5621 },
  { id: 'm3', q: "Will OpenAI release GPT-6 in 2026?",              cat: "Tech",      vol: 2.1,   yes: 71, ends: "Dec 31", traders: 980  },
  { id: 'm4', q: "Lakers win NBA Finals 2026?",                     cat: "Sports",    vol: 1.6,   yes: 22, ends: "Jun 15", traders: 1240 },
  { id: 'm5', q: "Apple ships M5 MacBook Pro before Nov 2026?",     cat: "Tech",      vol: 0.9,   yes: 58, ends: "Nov 1",  traders: 421  },
  { id: 'm6', q: "EU passes AI Act amendment by Aug 2026?",         cat: "Politics",  vol: 0.6,   yes: 44, ends: "Aug 30", traders: 318  },
  { id: 'm7', q: "Tesla delivers Optimus v2 in 2026?",              cat: "Tech",      vol: 1.3,   yes: 31, ends: "Dec 31", traders: 612  },
  { id: 'm8', q: "Will SpaceX land humans on Mars by 2030?",        cat: "Science",   vol: 3.4,   yes: 12, ends: "Jan 1, 2031", traders: 2103 },
];

// Deterministic hash from a string seed — used so each tx has a stable hash
// that ties back to the same trader profile every render.
function makeHash(seed) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 8-char hex; positive
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  // Append a longer pseudo segment for visual realism
  let h2 = h ^ 0xdeadbeef;
  for (let i = 0; i < 4; i++) h2 = Math.imul(h2 ^ (h2 >>> 13), 1597334677);
  const tail = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${tail.slice(0, 6)}`;
}

const TXS_SEED = [
  { id: 'tx1', traderId: 't1', kind: 'buy',  market: "BTC > $200k Q4",       amount: 1240,   shares: 32.4, time: 2  },
  { id: 'tx2', traderId: 't3', kind: 'sell', market: "Fed rate cut Sept",    amount: 820,    shares: 12.8, time: 5  },
  { id: 'tx3', traderId: 't2', kind: 'buy',  market: "GPT-6 in 2026",         amount: 412,    shares: 5.8,  time: 12 },
  { id: 'tx4', traderId: 't5', kind: 'send', market: "→ 0x7c…4e1f",           amount: 2400,   shares: 0,    time: 22 },
  { id: 'tx5', traderId: 't4', kind: 'buy',  market: "Lakers win 2026",       amount: 184,    shares: 8.4,  time: 41 },
  { id: 'tx6', traderId: 't7', kind: 'sell', market: "Tesla Optimus v2",      amount: 612,    shares: 19.7, time: 68 },
  { id: 'tx7', traderId: 't6', kind: 'buy',  market: "Apple M5 MBP",          amount: 940,    shares: 16.2, time: 96 },
  { id: 'tx8', traderId: 't8', kind: 'buy',  market: "EU AI Act amendment",   amount: 308,    shares: 7.0,  time: 142 },
  { id: 'tx9', traderId: 't10', kind: 'sell', market: "BTC > $200k Q4",       amount: 1820,   shares: 47.9, time: 211 },
  { id: 'tx10',traderId: 't2', kind: 'buy',  market: "Fed rate cut Sept",    amount: 560,    shares: 8.7,  time: 305 },
].map(tx => ({ ...tx, hash: makeHash(tx.id + tx.traderId) }));

// Pick a trader id biased toward higher-ranked traders (more activity)
function pickTraderId() {
  const r = Math.random();
  // Top 3 (~50%), next 4 (~30%), rest (~20%)
  if (r < 0.5)  return TRADERS[Math.floor(Math.random() * 3)].id;
  if (r < 0.8)  return TRADERS[3 + Math.floor(Math.random() * 4)].id;
  return TRADERS[7 + Math.floor(Math.random() * (TRADERS.length - 7))].id;
}

function lookupTrader(idOrTx) {
  const id = typeof idOrTx === 'string' ? idOrTx : (idOrTx && idOrTx.traderId);
  return TRADERS.find(t => t.id === id) || null;
}

const POSITIONS = [
  { id: 'p1', market: "Fed rate cut by Sept 2026",   side: 'YES', shares: 4200, avg: 0.58, last: 0.64, pnl: 252.0 },
  { id: 'p2', market: "BTC > $200k Q4 2026",         side: 'NO',  shares: 1820, avg: 0.65, last: 0.62, pnl: 54.6  },
  { id: 'p3', market: "GPT-6 release in 2026",       side: 'YES', shares: 980,  avg: 0.63, last: 0.71, pnl: 78.4  },
  { id: 'p4', market: "Apple M5 MBP before Nov",     side: 'YES', shares: 540,  avg: 0.55, last: 0.58, pnl: 16.2  },
  { id: 'p5', market: "Tesla Optimus v2 in 2026",    side: 'NO',  shares: 1100, avg: 0.69, last: 0.69, pnl: 0     },
];

// Smooth-walk a series — used everywhere for sparklines / charts.
function makeSeries(n, opts = {}) {
  const { start = 100, drift = 0.5, vol = 2.5, seed = 1 } = opts;
  let v = start;
  let s = seed;
  const out = [];
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v += drift + r * vol;
    v = Math.max(1, v);
    out.push(+v.toFixed(2));
  }
  return out;
}

// Format helpers
const fmt = {
  usd: (n, opts = {}) => {
    const v = Math.abs(n);
    if (opts.compact && v >= 1e6) return `$${(n/1e6).toFixed(2)}M`;
    if (opts.compact && v >= 1e3) return `$${(n/1e3).toFixed(1)}K`;
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: opts.dp ?? 2 });
  },
  num: (n) => n.toLocaleString('en-US'),
  pct: (n, dp = 1) => `${n >= 0 ? '+' : ''}${n.toFixed(dp)}%`,
  pctRaw: (n, dp = 0) => `${n.toFixed(dp)}%`,
  shortAddr: (a) => a.length > 12 ? `${a.slice(0,6)}…${a.slice(-4)}` : a,
  rel: (s) => {
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }
};

Object.assign(window, { TRADERS, WALLETS, MARKETS, TXS_SEED, POSITIONS, makeSeries, makeHash, pickTraderId, lookupTrader, fmt });
