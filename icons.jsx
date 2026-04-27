// icons.jsx — minimal stroke icons (lucide-ish)
const I = ({ d, fill, size = 16, sw = 1.6, viewBox = "0 0 24 24", style }) => (
  <svg width={size} height={size} viewBox={viewBox}
       fill={fill || "none"} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);

const Icon = {
  Dashboard: (p) => <I {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>} />,
  Traders:   (p) => <I {...p} d={<><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="6" r="2.5"/><path d="M15 13c2-1 4-1 5 1"/></>} />,
  Wallet:    (p) => <I {...p} d={<><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/></>} />,
  Market:    (p) => <I {...p} d={<><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></>} />,
  Settings:  (p) => <I {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.13.69.36.96.66.27.3.46.66.55 1.04.07.32.07.65 0 .97"/></>} />,
  Search:    (p) => <I {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  Bell:      (p) => <I {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 20a2 2 0 0 0 4 0"/></>} />,
  Plus:      (p) => <I {...p} d={<><path d="M12 5v14M5 12h14"/></>} />,
  Filter:    (p) => <I {...p} d={<><path d="M3 5h18l-7 9v5l-4 2v-7L3 5z"/></>} />,
  Down:      (p) => <I {...p} d={<><path d="m6 9 6 6 6-6"/></>} />,
  Up:        (p) => <I {...p} d={<><path d="m6 15 6-6 6 6"/></>} />,
  Trend:     (p) => <I {...p} d={<><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h6v6"/></>} />,
  Copy:      (p) => <I {...p} d={<><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>} />,
  Eye:       (p) => <I {...p} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>} />,
  ArrowUpRt: (p) => <I {...p} d={<><path d="M7 17 17 7M9 7h8v8"/></>} />,
  ArrowDnRt: (p) => <I {...p} d={<><path d="M7 7l10 10M9 17h8V9"/></>} />,
  Send:      (p) => <I {...p} d={<><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></>} />,
  Coins:     (p) => <I {...p} d={<><circle cx="9" cy="9" r="6"/><path d="M21 15a6 6 0 0 1-9 5.2"/><path d="M21 9a6 6 0 0 0-3-5.2"/></>} />,
  Bolt:      (p) => <I {...p} d={<><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></>} />,
  Star:      (p) => <I {...p} d={<><path d="M12 2 14.5 9 22 9.3l-6 4.7 2 7.5L12 17l-6 4.5 2-7.5-6-4.7L9.5 9z"/></>} />,
  Globe:     (p) => <I {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></>} />,
  Shield:    (p) => <I {...p} d={<><path d="M12 2 4 5v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V5l-8-3z"/></>} />,
  Logo:      ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 19V5h7a4 4 0 0 1 0 8H5" stroke="#150700" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="17" r="2.2" fill="#150700"/>
    </svg>
  ),
};

window.Icon = Icon;
