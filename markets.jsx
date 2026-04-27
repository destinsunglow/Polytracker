// markets.jsx — markets browser

function MarketsScreen({ onTrade }) {
  const [cat, setCat] = React.useState('All');
  const cats = ['All', 'Macro', 'Crypto', 'Tech', 'Sports', 'Politics', 'Science'];
  const filtered = cat === 'All' ? MARKETS : MARKETS.filter(m => m.cat === cat);
  const tick = useTicker(3000);
  const [pcts, setPcts] = React.useState(() => Object.fromEntries(MARKETS.map(m => [m.id, m.yes])));
  React.useEffect(() => {
    setPcts(prev => {
      const next = { ...prev };
      // Drift one random market a bit
      const ids = Object.keys(next);
      const id = ids[Math.floor(Math.random() * ids.length)];
      const cur = next[id];
      next[id] = Math.max(2, Math.min(98, cur + (Math.random() - 0.5) * 4));
      return next;
    });
  }, [tick]);

  return (
    <div className="content">
      <div className="col-main">
        <div className="page-title">
          <div>
            <h1>Markets</h1>
            <p>Browse {MARKETS.length} active prediction markets · trade YES or NO at live odds</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn"><Icon.Filter size={14}/> Sort: Volume</button>
            <button className="btn btn-primary"><Icon.Plus size={14}/> Create Market</button>
          </div>
        </div>

        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          {cats.map(c => (
            <button key={c} data-active={cat === c ? 1 : 0} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filtered.map(m => {
            const yes = +(pcts[m.id] ?? m.yes).toFixed(0);
            return (
              <div key={m.id} className="glass market-card" onClick={() => onTrade(m)}>
                <div className="market-meta">
                  <span className="chip accent">{m.cat}</span>
                  <span>· {m.traders} traders</span>
                  <span>· ends {m.ends}</span>
                  <span style={{ marginLeft: 'auto' }} className="mono">${m.vol}M vol</span>
                </div>
                <div className="market-q">{m.q}</div>
                <div style={{ marginTop: 4 }}>
                  <div className="between" style={{ fontSize: 11, marginBottom: 6 }}>
                    <span className="muted">Live odds</span>
                    <span><span className="up" style={{ fontWeight: 600 }}>{yes}% YES</span> · <span className="dn" style={{ fontWeight: 600 }}>{100 - yes}% NO</span></span>
                  </div>
                  <div className="sentiment-bar">
                    <span className="yes" style={{ width: `${yes}%` }}/>
                    <span className="no" style={{ width: `${100 - yes}%` }}/>
                  </div>
                </div>
                <div className="market-bets">
                  <button className="bet-btn yes" onClick={(e) => { e.stopPropagation(); onTrade(m, 'YES'); }}>
                    <span>YES</span><span className="pct">{yes}¢</span>
                  </button>
                  <button className="bet-btn no" onClick={(e) => { e.stopPropagation(); onTrade(m, 'NO'); }}>
                    <span>NO</span><span className="pct">{100 - yes}¢</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.MarketsScreen = MarketsScreen;
