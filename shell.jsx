// shell.jsx — sidebar, topbar, layout shell

function Sidebar({ route, setRoute, mode }) {
  const items = [
    { group: "Trade" },
    { id: 'dashboard', label: 'Dashboard', ico: <Icon.Dashboard size={18}/> },
    { id: 'traders',   label: 'Traders',   ico: <Icon.Traders size={18}/>, badge: '12' },
    { id: 'markets',   label: 'Markets',   ico: <Icon.Market size={18}/> },
    { group: "Account" },
    { id: 'wallets',   label: 'Wallets',   ico: <Icon.Wallet size={18}/> },
    { id: 'settings',  label: 'Settings',  ico: <Icon.Settings size={18}/> },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon.Logo size={16}/></div>
        <div className="brand-text">PolyTracker</div>
      </div>
      {items.map((it, i) => it.group ? (
        <div key={`g${i}`} className="nav-section">{it.group}</div>
      ) : (
        <div key={it.id} className="nav-item" data-active={route === it.id ? 1 : 0}
             onClick={() => setRoute(it.id)}>
          <span className="nav-ico">{it.ico}</span>
          <span className="nav-label">{it.label}</span>
          {it.badge && <span className="nav-badge">{it.badge}</span>}
        </div>
      ))}
      <div className="sidebar-cta">
        <h4>Pro Signals</h4>
        <p>Get real-time alerts when top traders enter positions.</p>
        <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          <Icon.Bolt size={12}/> Upgrade
        </button>
      </div>
    </aside>
  );
}

function Topbar({ route, totalPnl, livePnl }) {
  const labels = {
    dashboard: ["Overview", "Dashboard"],
    traders: ["Discover", "Top Traders"],
    markets: ["Discover", "Markets"],
    wallets: ["Account", "Wallets"],
    settings: ["Account", "Settings"],
    profile: ["Discover", "Trader Profile"],
  };
  const [a, b] = labels[route] || ["", ""];
  return (
    <header className="topbar">
      <div className="crumbs">
        <span>{a}</span>
        <span style={{ opacity: .4 }}>/</span>
        <strong>{b}</strong>
      </div>
      <div className="search">
        <Icon.Search size={16}/>
        <input placeholder="Search markets, traders, wallets…"/>
        <kbd>⌘K</kbd>
      </div>
      <div className="row" style={{ marginLeft: 'auto', gap: 10 }}>
        <div className="chip">
          <span className="live-dot"/>LIVE
        </div>
        <button className="icon-btn" aria-label="Notifications">
          <Icon.Bell size={16}/>
          <span className="dot"/>
        </button>
        <div className="profile">
          <div className="avatar">JM</div>
          <div className="profile-name">Jess M.<small>0x7c…4e1f</small></div>
          <Icon.Down size={14} style={{ color: 'var(--text-3)' }}/>
        </div>
      </div>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
