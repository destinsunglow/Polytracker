// traders.jsx — traders leaderboard + profile drill-in

function TraderAvatar({ t, size = 32 }) {
  return (
    <div className={`trader-avatar ${t.online ? 'online' : ''}`}
         style={{
           width: size, height: size, fontSize: size * 0.4,
           background: `linear-gradient(135deg, ${t.color}, color-mix(in oklab, ${t.color} 60%, #000))`
         }}>
      {t.name.slice(0,2).toUpperCase()}
    </div>
  );
}

function TradersScreen({ onCopyTrader, onOpenTrader }) {
  const [tab, setTab] = React.useState('top');
  const [bias, setBias] = React.useState('all');

  const filtered = TRADERS.filter(t => bias === 'all' ? true : t.bias === bias);
  const sorted = [...filtered].sort((a, b) => {
    if (tab === 'top') return b.roi - a.roi;
    if (tab === 'volume') return b.copiers - a.copiers;
    if (tab === 'pnl') return b.pnl - a.pnl;
    return 0;
  });

  return (
    <div className="content">
      <div className="col-main">
        <div className="page-title">
          <div>
            <h1>Top Traders</h1>
            <p>Browse {TRADERS.length} verified traders · auto-mirror their trades to your wallet</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn"><Icon.Filter size={14}/> Filters</button>
            <button className="btn btn-primary"><Icon.Plus size={14}/> Discover</button>
          </div>
        </div>

        {/* Top 3 podium cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {sorted.slice(0, 3).map((t, i) => (
            <div key={t.id} className="glass" style={{
              padding: 20, position: 'relative', cursor: 'pointer',
              borderColor: i === 0 ? 'color-mix(in oklab, var(--accent) 35%, transparent)' : undefined,
              boxShadow: i === 0 ? '0 0 32px var(--accent-glow)' : undefined,
            }} onClick={() => onOpenTrader(t.id)}>
              <div style={{
                position: 'absolute', top: 12, right: 14,
                fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700,
                color: i === 0 ? 'var(--accent)' : 'var(--text-3)', opacity: i === 0 ? .5 : .25,
                lineHeight: 1, letterSpacing: '-0.04em'
              }}>#{i+1}</div>
              <div className="row" style={{ gap: 12, marginBottom: 14 }}>
                <TraderAvatar t={t} size={44}/>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.handle}</div>
                </div>
              </div>
              <div className="stat-grid">
                <div className="stat"><div className="l">30D ROI</div><div className={`v ${t.roi >= 0 ? 'up' : 'dn'}`}>{fmt.pct(t.roi)}</div></div>
                <div className="stat"><div className="l">Win Rate</div><div className="v">{t.win}%</div></div>
                <div className="stat"><div className="l">Copiers</div><div className="v">{fmt.num(t.copiers)}</div></div>
                <div className="stat"><div className="l">P&L</div><div className={`v ${t.pnl >= 0 ? 'up' : 'dn'}`}>{fmt.usd(t.pnl, { compact: true })}</div></div>
              </div>
              <div style={{ marginTop: 14, height: 40 }}>
                <Sparkline data={makeSeries(30, { start: 100, drift: t.roi > 0 ? 0.7 : -0.5, vol: 2.4, seed: t.copiers })}
                           w={300} h={40} color={t.roi >= 0 ? 'var(--profit)' : 'var(--loss)'}/>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
                      onClick={(e) => { e.stopPropagation(); onCopyTrader(t); }}>
                <Icon.Copy size={14}/> Copy Trader
              </button>
            </div>
          ))}
        </div>

        <div className="glass">
          <div className="card-hd">
            <div className="tabs" style={{ marginBottom: 0, border: 0 }}>
              {[
                { id: 'top', l: 'Top ROI' },
                { id: 'volume', l: 'Most Copied' },
                { id: 'pnl', l: 'Total P&L' },
              ].map(t => (
                <button key={t.id} data-active={tab === t.id ? 1 : 0} onClick={() => setTab(t.id)}>{t.l}</button>
              ))}
            </div>
            <div className="seg">
              {[{id:'all',l:'All'},{id:'bull',l:'Bullish'},{id:'bear',l:'Bearish'},{id:'neutral',l:'Neutral'}].map(b => (
                <button key={b.id} data-active={bias === b.id ? 1 : 0} onClick={() => setBias(b.id)}>{b.l}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Trader</th>
                  <th>Bias</th>
                  <th>30D ROI</th>
                  <th>Win %</th>
                  <th>Copiers</th>
                  <th>P&L</th>
                  <th>30D Trend</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t, i) => (
                  <tr key={t.id} className="row-int" onClick={() => onOpenTrader(t.id)}>
                    <td className="muted mono">{i+1}</td>
                    <td>
                      <div className="trader-cell">
                        <TraderAvatar t={t}/>
                        <div className="trader-name">{t.name}<small>{t.handle}</small></div>
                      </div>
                    </td>
                    <td><span className={`chip ${t.bias === 'bull' ? 'up' : t.bias === 'bear' ? 'dn' : ''}`}>{t.bias}</span></td>
                    <td><span className={t.roi >= 0 ? 'up' : 'dn'} style={{ fontWeight: 600 }}>{fmt.pct(t.roi)}</span></td>
                    <td>{t.win}%</td>
                    <td>{fmt.num(t.copiers)}</td>
                    <td><span className={t.pnl >= 0 ? 'up' : 'dn'} style={{ fontWeight: 600 }}>{fmt.usd(t.pnl, { compact: true })}</span></td>
                    <td><div className="spark-cell"><Sparkline data={makeSeries(20, { start: 100, drift: t.roi > 0 ? 0.6 : -0.4, vol: 2, seed: t.copiers })} color={t.roi >= 0 ? 'var(--profit)' : 'var(--loss)'}/></div></td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); onCopyTrader(t); }}>
                        <Icon.Copy size={12}/> Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function TraderProfile({ traderId, onBack, onCopy }) {
  const t = TRADERS.find(x => x.id === traderId) || TRADERS[0];
  const tick = useTicker(2500);
  const [series, setSeries] = React.useState(() => {
    const s = makeSeries(40, { start: 100, drift: t.roi > 0 ? 1 : -0.5, vol: 3, seed: t.copiers });
    return s.map((v, i) => ({ t: `D${i+1}`, v }));
  });
  React.useEffect(() => {
    setSeries(prev => {
      const last = prev[prev.length - 1].v;
      const next = [...prev];
      next[next.length - 1] = { ...last, t: next[next.length - 1].t, v: Math.max(1, last + (Math.random() - 0.4) * 4) };
      return next;
    });
  }, [tick]);

  return (
    <div className="content">
      <div className="col-main">
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ width: 'fit-content' }}>
          ← Back to traders
        </button>
        <div className="glass" style={{ padding: 24 }}>
          <div className="row" style={{ gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TraderAvatar t={t} size={72}/>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26 }}>{t.name}</h1>
                <span className={`chip ${t.bias === 'bull' ? 'up' : t.bias === 'bear' ? 'dn' : ''}`}>{t.bias}</span>
                {t.online && <span className="chip up"><span className="live-dot"/>Live</span>}
              </div>
              <div className="mono" style={{ color: 'var(--text-3)', fontSize: 12 }}>{t.handle}</div>
              <p style={{ color: 'var(--text-2)', fontSize: 13, margin: '12px 0 0', maxWidth: 540, lineHeight: 1.55 }}>
                Quant trader focused on macro and tech prediction markets. Disciplined position sizing, holds median 6 days, prefers contrarian YES on undervalued binaries.
              </p>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn"><Icon.Eye size={14}/> Watch</button>
              <button className="btn btn-primary" onClick={() => onCopy(t)}><Icon.Copy size={14}/> Copy Trader</button>
            </div>
          </div>
        </div>

        <div className="kpi-row">
          <KpiCard label="30D ROI" icon={<Icon.Trend size={12}/>} value={fmt.pct(t.roi)} delta={t.roi/4} series={makeSeries(40, { start: 100, drift: t.roi > 0 ? 0.6 : -0.4, vol: 2, seed: 1 })}/>
          <KpiCard label="Win Rate" icon={<Icon.Star size={12}/>} value={`${t.win}%`} delta={1.4} series={makeSeries(40, { start: 60, drift: 0.2, vol: 1.4, seed: 2 })}/>
          <KpiCard label="Copiers" icon={<Icon.Copy size={12}/>} value={fmt.num(t.copiers)} delta={3.2} series={makeSeries(40, { start: 70, drift: 0.5, vol: 1.2, seed: 3 })}/>
          <KpiCard label="Total P&L" icon={<Icon.Coins size={12}/>} value={fmt.usd(t.pnl, { compact: true })} delta={t.roi/3} series={makeSeries(40, { start: 100, drift: 0.4, vol: 2, seed: 4 })}/>
        </div>

        <div className="glass">
          <div className="card-hd">
            <div><h3>Performance · 40 day</h3><p>Cumulative return % since trader was indexed</p></div>
            <div className="seg">
              <button data-active={1}>1M</button>
              <button data-active={0}>3M</button>
              <button data-active={0}>6M</button>
              <button data-active={0}>1Y</button>
            </div>
          </div>
          <div className="card-bd"><PerformanceChart data={series} mode="area" h={260}/></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          <div className="glass">
            <div className="card-hd"><div><h3>Recent Trades</h3></div></div>
            <table className="tbl">
              <thead>
                <tr><th>Market</th><th>Side</th><th>Size</th><th>Result</th><th>Time</th></tr>
              </thead>
              <tbody>
                {[
                  { m: "Fed rate cut Sept 2026", s: "YES", sz: 4200, r: 312, ago: 10 },
                  { m: "BTC > $200k Q4 2026", s: "NO", sz: 1820, r: 84, ago: 22 },
                  { m: "GPT-6 release in 2026", s: "YES", sz: 980, r: 142, ago: 41 },
                  { m: "Apple M5 MBP before Nov", s: "YES", sz: 540, r: -22, ago: 68 },
                  { m: "Tesla Optimus v2 in 2026", s: "NO", sz: 1100, r: 0, ago: 122 },
                ].map((row, i) => (
                  <tr key={i}>
                    <td>{row.m}</td>
                    <td><span className={`chip ${row.s === 'YES' ? 'up' : 'dn'}`}>{row.s}</span></td>
                    <td className="mono">{fmt.usd(row.sz, { dp: 0 })}</td>
                    <td className={`mono ${row.r >= 0 ? 'up' : 'dn'}`} style={{ fontWeight: 600 }}>{row.r === 0 ? '–' : fmt.usd(row.r, { dp: 0 })}</td>
                    <td className="muted">{fmt.rel(row.ago * 60)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass">
            <div className="card-hd"><div><h3>Sentiment Mix</h3></div></div>
            <div className="card-bd" style={{ display: 'grid', gap: 16 }}>
              <SentimentBar yes={t.bias === 'bull' ? 72 : t.bias === 'bear' ? 32 : 50} label="YES vs NO bias"/>
              <SentimentBar yes={64} label="Macro markets"/>
              <SentimentBar yes={48} label="Tech markets"/>
              <SentimentBar yes={28} label="Sports markets"/>
              <div style={{ height: 1, background: 'var(--glass-border)', margin: '4px 0' }}/>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="muted">Avg hold</span><span className="mono" style={{ fontWeight: 600 }}>6.2 days</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="muted">Avg bet size</span><span className="mono" style={{ fontWeight: 600 }}>$1,840</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="muted">Sharpe (90d)</span><span className="mono" style={{ fontWeight: 600 }}>1.84</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                <span className="muted">Max drawdown</span><span className="mono dn" style={{ fontWeight: 600 }}>−12.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.TradersScreen = TradersScreen;
window.TraderProfile = TraderProfile;
window.SentimentBar = SentimentBar;
