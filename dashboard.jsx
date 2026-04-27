// dashboard.jsx — main dashboard screen

function KpiCard({ label, value, delta, series, icon, color = "var(--accent)" }) {
  const up = delta >= 0;
  return (
    <div className="glass kpi">
      <div className="kpi-label">{icon}{label}</div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-delta ${up ? 'up' : 'dn'}`}>
        {up ? <Icon.ArrowUpRt size={12}/> : <Icon.ArrowDnRt size={12}/>}
        {fmt.pct(delta)}
        <span className="muted" style={{ fontWeight: 400, marginLeft: 4 }}>· 24h</span>
      </div>
      <div className="kpi-spark"><Sparkline data={series} w={220} h={70} color={up ? color : "var(--loss)"}/></div>
    </div>
  );
}

function SentimentBar({ yes, label }) {
  return (
    <div>
      <div className="between" style={{ fontSize: 11, marginBottom: 6 }}>
        <span className="muted">{label}</span>
        <span><span className="up" style={{ fontWeight: 600 }}>{yes}% YES</span> · <span className="dn" style={{ fontWeight: 600 }}>{100 - yes}% NO</span></span>
      </div>
      <div className="sentiment-bar">
        <span className="yes" style={{ width: `${yes}%` }}/>
        <span className="no" style={{ width: `${100 - yes}%` }}/>
      </div>
    </div>
  );
}

function Dashboard({ chartMode, showWalletPanel, onCopyTrader, onOpenTrader }) {
  const [range, setRange] = React.useState('1M');
  const tick = useTicker(2200);
  const [chartData, setChartData] = React.useState(() => {
    const RANGES = { '24H': 24, '1W': 30, '1M': 30, '3M': 60, 'ALL': 90 };
    const n = RANGES['1M'];
    const series = makeSeries(n, { start: 110000, drift: 280, vol: 1800, seed: 99 });
    return series.map((v, i) => {
      const o = i === 0 ? v : series[i - 1];
      const hi = Math.max(v, o) + Math.random() * 800;
      const lo = Math.min(v, o) - Math.random() * 800;
      return { t: `D${i+1}`, v, o, c: v, hi, lo };
    });
  });

  // Live update last point
  React.useEffect(() => {
    setChartData(prev => {
      const last = prev[prev.length - 1];
      const drift = (Math.random() - 0.45) * 1400;
      const v = Math.max(1, last.v + drift);
      const next = [...prev];
      next[next.length - 1] = { ...last, v, c: v, hi: Math.max(last.hi, v), lo: Math.min(last.lo, v) };
      return next;
    });
  }, [tick]);

  const last = chartData[chartData.length - 1].v;
  const first = chartData[0].v;
  const pctChange = ((last - first) / first) * 100;

  const topTraders = TRADERS.slice(0, 6);

  return (
    <div className={`content ${showWalletPanel ? 'with-panel' : ''}`}>
      <div className="col-main">
        <div className="page-title">
          <div>
            <h1>Good morning, Jess</h1>
            <p>Your portfolio is up <span className="up" style={{ fontWeight: 600 }}>{fmt.pct(4.21)}</span> over the last 24 hours.</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn"><Icon.Filter size={14}/> Filters</button>
            <button className="btn btn-primary"><Icon.Plus size={14}/> New Position</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          <KpiCard label="Portfolio" icon={<Icon.Wallet size={12}/>}
                   value={fmt.usd(275906.78, { compact: true })}
                   delta={4.21}
                   series={makeSeries(40, { start: 100, drift: 0.4, vol: 1.8, seed: 11 })}/>
          <KpiCard label="P&L · 7D" icon={<Icon.Trend size={12}/>}
                   value={fmt.usd(11842, { compact: true })}
                   delta={6.84}
                   series={makeSeries(40, { start: 80, drift: 0.6, vol: 2.2, seed: 7 })}/>
          <KpiCard label="Win Rate" icon={<Icon.Star size={12}/>}
                   value="68.4%"
                   delta={1.2}
                   series={makeSeries(40, { start: 60, drift: 0.2, vol: 1.4, seed: 3 })}/>
          <KpiCard label="Active Copies" icon={<Icon.Copy size={12}/>}
                   value="8"
                   delta={-2.1}
                   series={makeSeries(40, { start: 70, drift: -0.1, vol: 1.5, seed: 21 })}/>
        </div>

        {/* Performance chart */}
        <div className="glass">
          <div className="card-hd">
            <div>
              <h3>Portfolio Performance</h3>
              <p>Combined value across all chains and prediction-market positions</p>
            </div>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Current</div>
                <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{fmt.usd(last, { dp: 0 })}</div>
                  <span className={`chip ${pctChange >= 0 ? 'up' : 'dn'}`}>{fmt.pct(pctChange)}</span>
                </div>
              </div>
              <div className="seg">
                {['24H','1W','1M','3M','ALL'].map(r => (
                  <button key={r} data-active={range === r ? 1 : 0} onClick={() => setRange(r)}>{r}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="card-bd">
            <PerformanceChart data={chartData} mode={chartMode} h={300}/>
          </div>
        </div>

        {/* Copy trading section */}
        <div className="glass">
          <div className="card-hd">
            <div>
              <h3>Top Traders to Copy</h3>
              <p>Ranked by 30-day ROI · auto-mirrors trades to your wallet</p>
            </div>
            <button className="btn btn-sm">View all <Icon.ArrowUpRt size={12}/></button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Trader</th>
                  <th>30D ROI</th>
                  <th>Win %</th>
                  <th>Copiers</th>
                  <th>P&L</th>
                  <th>Trend</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topTraders.map(t => (
                  <tr key={t.id} className="row-int" onClick={() => onOpenTrader(t.id)}>
                    <td>
                      <div className="trader-cell">
                        <div className={`trader-avatar ${t.online ? 'online' : ''}`} style={{ background: `linear-gradient(135deg, ${t.color}, color-mix(in oklab, ${t.color} 60%, #000))` }}>
                          {t.name.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="trader-name">{t.name} <small>{t.handle}</small></div>
                        </div>
                      </div>
                    </td>
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

      {showWalletPanel && <WalletPanel onOpenTrader={onOpenTrader}/>}
    </div>
  );
}

function WalletPanel({ onOpenTrader }) {
  const [txs, setTxs] = React.useState(TXS_SEED.slice(0, 6));
  const tick = useTicker(4500);

  React.useEffect(() => {
    if (tick === 0) return;
    const traderId = pickTraderId();
    const id = `tx-${Date.now()}`;
    const newTx = {
      id,
      traderId,
      kind: ['buy','sell','buy','send'][Math.floor(Math.random()*4)],
      market: ['BTC > $200k Q4', 'Fed rate cut Sept', 'GPT-6 in 2026', 'Lakers win 2026', 'Tesla Optimus v2'][Math.floor(Math.random()*5)],
      amount: Math.floor(Math.random() * 1500) + 100,
      shares: +(Math.random() * 30).toFixed(1),
      time: 0,
      isNew: true,
      hash: makeHash(id + traderId),
    };
    setTxs(prev => [newTx, ...prev.slice(0, 5)].map((t, i) => ({ ...t, time: i === 0 ? 0 : (t.time || 0) + 5 })));
  }, [tick]);

  const total = WALLETS.reduce((s, w) => s + w.balance, 0);
  const slices = WALLETS.map(w => ({
    v: w.balance,
    color: w.chain === 'eth' ? '#627EEA' : w.chain === 'poly' ? '#8247E5' : w.chain === 'base' ? '#0052FF' : '#14F195',
    label: w.chain.toUpperCase(),
  }));

  return (
    <div className="col-side">
      {/* Wallets list */}
      <div className="glass">
        <div className="card-hd">
          <div><h3>Connected Wallets</h3></div>
          <button className="btn btn-sm btn-ghost"><Icon.Plus size={12}/> Add</button>
        </div>
        <div className="card-bd" style={{ display: 'grid', gap: 4, paddingLeft: 8, paddingRight: 8 }}>
          {WALLETS.map(w => (
            <div key={w.id} className="wallet-row">
              <div className={`chain-icon ${w.chain}`}>
                {w.chain === 'eth' ? 'Ξ' : w.chain === 'poly' ? '◈' : w.chain === 'base' ? 'B' : '◎'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{w.name}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{w.addr}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt.usd(w.balance, { compact: true })}</div>
                <div className={`mono ${w.delta >= 0 ? 'up' : 'dn'}`} style={{ fontSize: 10.5, fontWeight: 600 }}>{fmt.pct(w.delta)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio donut */}
      <div className="glass">
        <div className="card-hd">
          <div><h3>Portfolio Allocation</h3></div>
        </div>
        <div className="card-bd" style={{ display: 'flex', alignItems: 'center', gap: 18, paddingTop: 0 }}>
          <Donut slices={slices} size={140} thick={16} centerLabel="Total" centerValue={fmt.usd(total, { compact: true })}/>
          <div style={{ flex: 1, display: 'grid', gap: 8 }}>
            {WALLETS.map((w, i) => (
              <div key={w.id} className="row" style={{ justifyContent: 'space-between', fontSize: 11.5 }}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: slices[i].color }}/>
                  <span style={{ color: 'var(--text-2)' }}>{w.chain.toUpperCase()}</span>
                </div>
                <span className="mono" style={{ fontWeight: 600 }}>{((w.balance / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass">
        <div className="card-hd">
          <div><h3>Recent Activity</h3></div>
          <span className="chip"><span className="live-dot"/>Live</span>
        </div>
        <div className="card-bd" style={{ display: 'grid', gap: 0, paddingTop: 0, paddingLeft: 8, paddingRight: 8 }}>
          {txs.map((tx, i) => {
            const trader = lookupTrader(tx);
            const ic = tx.kind === 'buy' ? <Icon.ArrowDnRt size={12}/> :
                       tx.kind === 'sell' ? <Icon.ArrowUpRt size={12}/> :
                       <Icon.Send size={12}/>;
            const color = tx.kind === 'buy' ? 'var(--profit)' : tx.kind === 'sell' ? 'var(--loss)' : 'var(--text-2)';
            const clickable = !!(trader && onOpenTrader);
            return (
              <div key={tx.id}
                   className={`wallet-row ${tx.isNew && i === 0 ? 'fade-up' : ''}`}
                   style={{ cursor: clickable ? 'pointer' : 'default' }}
                   title={trader ? `View ${trader.name}'s profile` : ''}
                   onClick={() => clickable && onOpenTrader(trader.id)}>
                {trader ? (
                  <div className={`trader-avatar ${trader.online ? 'online' : ''}`}
                       style={{ width: 32, height: 32, fontSize: 10.5, flexShrink: 0,
                                background: `linear-gradient(135deg, ${trader.color}, color-mix(in oklab, ${trader.color} 60%, #000))` }}>
                    {trader.name.slice(0,2).toUpperCase()}
                  </div>
                ) : (
                  <div className="chain-icon" style={{ background: 'var(--glass-fill)', color, border: '1px solid var(--glass-border)' }}>
                    {ic}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1.25 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color }}>{ic}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trader ? trader.name : 'Unknown'}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.kind} · {tx.market} · {fmt.rel(tx.time)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{fmt.usd(tx.amount, { compact: true })}</div>
                  {tx.hash && <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 1 }}>{tx.hash.slice(0, 8)}…</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
